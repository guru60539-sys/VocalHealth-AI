CREATE TABLE "session_chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"notes" varchar(5000) DEFAULT '' NOT NULL,
	"selected_doctor" jsonb NOT NULL,
	"conversation" jsonb,
	"report" jsonb,
	"created_by" text NOT NULL,
	"created_on" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"credits" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_credits_nonnegative" CHECK ("users"."credits" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "session_chats_session_id_unique" ON "session_chats" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "session_chats_created_by_created_on_idx" ON "session_chats" USING btree ("created_by","created_on");--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerk_id_unique" ON "users" USING btree ("clerk_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");