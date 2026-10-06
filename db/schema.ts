import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    clerkId: text("clerk_id").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    credits: integer("credits").notNull().default(5),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("users_clerk_id_unique").on(table.clerkId),
    uniqueIndex("users_email_unique").on(table.email),
    check("users_credits_nonnegative", sql`${table.credits} >= 0`),
  ],
);

export const sessionChats = pgTable(
  "session_chats",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    notes: varchar("notes", { length: 5000 }).notNull().default(""),
    selectedDoctor: jsonb("selected_doctor").notNull(),
    conversation: jsonb("conversation"),
    report: jsonb("report"),
    createdBy: text("created_by").notNull(),
    createdOn: timestamp("created_on", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("session_chats_session_id_unique").on(table.sessionId),
    index("session_chats_created_by_created_on_idx").on(
      table.createdBy,
      table.createdOn,
    ),
  ],
);
