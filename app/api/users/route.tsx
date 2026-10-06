import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getDatabase } from "@/config/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(_req: NextRequest){
    const user=await currentUser();
    if (!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});

    const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
    if (!email) return NextResponse.json({ error: "No primary email address is available for this account." }, { status: 400 });

    try{
        const db = getDatabase();
        const [insertedUser] = await db
            .insert(users)
            .values({ clerkId: user.id, name: user.fullName || "User", email })
            .onConflictDoNothing({ target: users.clerkId })
            .returning();
        const dbUser = insertedUser ?? (await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1))[0];

        if (!dbUser) {
            return NextResponse.json({ error: "Unable to load the user account." }, { status: 500 });
        }

        return NextResponse.json({ ...dbUser, _id: String(dbUser.id) });
    }
    catch(e: unknown){
        console.error("POST users ERROR:", e);
        return NextResponse.json({ error: "Unable to create or load the user account." }, { status: 500 });
    }
}
