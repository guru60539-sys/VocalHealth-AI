import { getDatabase } from "@/config/database";
import { sessionChats, users } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { and, desc, eq, gt, sql } from "drizzle-orm";

export async function POST(req:NextRequest){
    const {notes,selectedDoctor}=await req.json();
    const user=await currentUser()
    const emailAddress = user?.primaryEmailAddress?.emailAddress;
    
    if (!emailAddress) {
        return NextResponse.json({error: "unauthorized"}, {status: 401});
    }

    try {
        if (!selectedDoctor?.specialist || typeof selectedDoctor.specialist !== "string") {
            return NextResponse.json({ error: "A doctor must be selected." }, { status: 400 });
        }

        const db = getDatabase();
        const sessionId = uuidv4();
        const result = await db.transaction(async (tx) => {
            // Keep the credit deduction and session creation atomic.
            const [dbUser] = await tx
                .update(users)
                .set({ credits: sql`${users.credits} - 1`, updatedAt: new Date() })
                .where(and(eq(users.email, emailAddress.toLowerCase()), gt(users.credits, 0)))
                .returning({ credits: users.credits });

            if (!dbUser) return null;

            const [newSession] = await tx.insert(sessionChats).values({
                sessionId,
                createdBy: emailAddress.toLowerCase(),
                notes: typeof notes === "string" ? notes : "",
                selectedDoctor,
            }).returning();

            return { ...newSession, _id: String(newSession.id), credits: dbUser.credits };
        });

        if (!result) {
            return NextResponse.json({ 
                error: "Insufficient Credits", 
                details: "You have run out of credits.Limit reached." 
            }, { status: 403 });
        }

        return NextResponse.json(result);
    } catch (e: any) {
        console.error("POST session-chat ERROR:", e);
        return NextResponse.json({ 
            error: "Unable to create the consultation.",
            details: "Check the database connection and try again."
        }, { status: 500 });
    }
}

export async function GET(req:NextRequest){
    try {
        const db = getDatabase();
        const {searchParams}=new URL(req.url);
        const sessionId=searchParams.get('sessionId');
        const user=await currentUser()
        const emailAddress = user?.primaryEmailAddress?.emailAddress;

        if (!emailAddress) {
            return NextResponse.json([]);
        }

        if(sessionId=='all'){
            const result = await db.select().from(sessionChats)
                .where(eq(sessionChats.createdBy, emailAddress.toLowerCase()))
                .orderBy(desc(sessionChats.id));
            return NextResponse.json(result.map((session) => ({ ...session, _id: String(session.id) })));
        }
        else{
            const [result] = await db.select().from(sessionChats)
                .where(and(eq(sessionChats.sessionId, sessionId ?? ""), eq(sessionChats.createdBy, emailAddress.toLowerCase())))
                .limit(1);
            return NextResponse.json(result ? { ...result, _id: String(result.id) } : null);
        }
    } catch (e: any) {
        console.error("GET session-chat ERROR:", e);
        return NextResponse.json({ 
            error: "Unable to load consultation data.",
            details: "Check the database connection and try again."
        }, { status: 500 });
    }
}
