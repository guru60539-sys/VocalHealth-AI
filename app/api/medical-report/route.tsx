import { openai } from "@/config/OpenAiModel";
import { getDatabase } from "@/config/database";
import { sessionChats } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const REPORT_GEN_PROMPT = `
You create a factual consultation summary from a completed voice consultation transcript.
Use ONLY details explicitly present in the transcript. Do not infer, embellish, diagnose,
or add general medical advice. Distinguish patient-reported information from what the AI
assistant said. A discussed possible condition is not a diagnosis. If a field is absent,
use "Not mentioned" (or ["Not mentioned"] for list fields). Return valid JSON only with
exactly these fields:
{
  "chiefComplaint": "string",
  "symptoms": ["string"],
  "duration": "string",
  "severity": "string",
  "summary": "string",
  "questionsAndConcernsDiscussed": ["string"],
  "adviceGiven": ["string"],
  "medicationsMentioned": ["string"],
  "testsInvestigationsMentioned": ["string"],
  "possibleConditionsDiscussed": ["string"],
  "warningSignsRedFlagsMentioned": ["string"],
  "followUpAdvice": ["string"],
  "professionalCareAdvice": ["string"]
}
For the chief complaint, symptoms, duration, and severity, include only what the patient
reported. For advice, follow-up, professional care, and warning signs, include only what
the AI assistant explicitly said. For questions, medicines, tests, and conditions, prefix
each item with "Patient reported/asked:" or "AI assistant discussed:" when the speaker is
clear. If attribution is unclear, use "Speaker not specified:" and do not attribute it to
either party. The summary must identify reported information versus assistant advice. This
is a consultation summary, not a definitive medical diagnosis.
`;

type TranscriptMessage = {
  role: "user" | "assistant";
  text: string;
};

function normalizeString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeList(value: unknown): string[] {
  if (!Array.isArray(value)) return ["Not mentioned"];
  const items = value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  ).map((item) => item.trim());
  return items.length ? items : ["Not mentioned"];
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { sessionId?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "A valid JSON request is required." }, { status: 400 });
  }

  const { sessionId, message } = body;
  if (typeof sessionId !== "string" || !sessionId.trim() || !Array.isArray(message)) {
    return NextResponse.json(
      { error: "A session ID and completed conversation transcript are required." },
      { status: 400 },
    );
  }

  const transcript: TranscriptMessage[] = message.flatMap((entry) => {
    if (
      !entry ||
      typeof entry !== "object" ||
      !("role" in entry) ||
      !("text" in entry) ||
      typeof entry.role !== "string" ||
      typeof entry.text !== "string"
    ) {
      return [];
    }

    const role = entry.role.toLowerCase();
    const text = entry.text.trim();
    if (!text || (role !== "user" && role !== "assistant")) return [];
    return [{ role, text: text.replaceAll("[END_CALL]", "").trim() }];
  }).filter((entry) => entry.text.length > 0);

  if (!transcript.length) {
    return NextResponse.json(
      { error: "No finalized transcript messages were received; the report was not generated." },
      { status: 400 },
    );
  }
  if (transcript.length > 500 || transcript.reduce((total, entry) => total + entry.text.length, 0) > 100_000) {
    return NextResponse.json({ error: "The transcript exceeds the report size limit." }, { status: 413 });
  }

  try {
    const db = getDatabase();
    const [session] = await db
      .select()
      .from(sessionChats)
      .where(and(eq(sessionChats.sessionId, sessionId), eq(sessionChats.createdBy, email)))
      .limit(1);

    if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });

    const specialist =
      session.selectedDoctor &&
      typeof session.selectedDoctor === "object" &&
      "specialist" in session.selectedDoctor &&
      typeof session.selectedDoctor.specialist === "string"
        ? session.selectedDoctor.specialist
        : "General Physician";

    const [transcriptSaved] = await db
      .update(sessionChats)
      .set({ conversation: transcript, updatedAt: new Date() })
      .where(and(eq(sessionChats.sessionId, sessionId), eq(sessionChats.createdBy, email)))
      .returning({ sessionId: sessionChats.sessionId });

    if (!transcriptSaved) {
      return NextResponse.json({ error: "The consultation transcript could not be saved." }, { status: 500 });
    }

    console.info("Consultation transcript saved", {
      sessionId,
      specialist,
      transcriptMessages: transcript.length,
    });

    console.info("Generating consultation report", {
      sessionId,
      specialist,
      transcriptMessages: transcript.length,
    });

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: REPORT_GEN_PROMPT },
        {
          role: "user",
          content: JSON.stringify({ specialist, transcript }),
        },
      ],
    });

    const rawResponse = completion.choices[0]?.message?.content;
    if (!rawResponse) throw new Error("The AI provider returned an empty report.");

    const parsed: unknown = JSON.parse(rawResponse);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("The AI provider returned an invalid report shape.");
    }

    const generated = parsed as Record<string, unknown>;
    const report = {
      sessionId,
      agent: specialist,
      user: user?.fullName || "Anonymous",
      timestamp: new Date().toISOString(),
      chiefComplaint: normalizeString(generated.chiefComplaint, "Not mentioned"),
      symptoms: normalizeList(generated.symptoms),
      duration: normalizeString(generated.duration, "Not mentioned"),
      severity: normalizeString(generated.severity, "Not mentioned"),
      summary: normalizeString(generated.summary, "Not mentioned"),
      questionsAndConcernsDiscussed: normalizeList(generated.questionsAndConcernsDiscussed),
      adviceGiven: normalizeList(generated.adviceGiven),
      medicationsMentioned: normalizeList(generated.medicationsMentioned),
      testsInvestigationsMentioned: normalizeList(generated.testsInvestigationsMentioned),
      possibleConditionsDiscussed: normalizeList(generated.possibleConditionsDiscussed),
      warningSignsRedFlagsMentioned: normalizeList(generated.warningSignsRedFlagsMentioned),
      followUpAdvice: normalizeList(generated.followUpAdvice),
      professionalCareAdvice: normalizeList(generated.professionalCareAdvice),
      disclaimer: "AI-generated consultation summary based only on the recorded conversation; not a diagnosis.",
    };

    const [saved] = await db
      .update(sessionChats)
      .set({ report, updatedAt: new Date() })
      .where(and(eq(sessionChats.sessionId, sessionId), eq(sessionChats.createdBy, email)))
      .returning({ sessionId: sessionChats.sessionId });

    if (!saved) throw new Error("The consultation was not available to save the report.");

    console.info("Consultation report saved", { sessionId, transcriptMessages: transcript.length });
    return NextResponse.json(report);
  } catch (error) {
    console.error("POST medical-report ERROR:", {
      sessionId,
      error: error instanceof Error ? error.message : "Unknown report generation error",
    });
    return NextResponse.json(
      { error: "Unable to analyze the transcript or save the consultation report." },
      { status: 500 },
    );
  }
}
