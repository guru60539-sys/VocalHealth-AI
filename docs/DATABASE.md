# Neon PostgreSQL database

The application uses Neon PostgreSQL through Drizzle ORM. Set `DATABASE_URL` to the Neon connection string in `.env.local` or your deployment secret store. Do not commit or log the connection string.

## Schema

The schema is defined in [`../db/schema.ts`](../db/schema.ts).

### `users`

One record per Clerk account. `clerk_id` and `email` are unique; credits default to 5.

### `session_chats`

Stores each consultation, its selected specialist snapshot, optional transcript and generated report, owner email, and timestamps. `selected_doctor`, `conversation`, and `report` are JSONB so the existing application data shapes remain intact.

The schema includes the unique and lookup indexes used by the API. The credit decrement and consultation insert run in one database transaction.

## Setup and schema updates

1. Set `DATABASE_URL` to the Neon connection string in `.env.local`.
2. Apply the Drizzle schema:

   ```bash
   npm run db:push
   ```

3. Verify the connection:

   ```bash
   npm run db:check
   ```

4. Start the application:

   ```bash
   npm run dev
   ```

`npm run db:generate` generates SQL migration files under `drizzle/` when you prefer reviewed migrations over schema push.

## Existing MongoDB data

This change does not automatically copy data from MongoDB. Export and migrate existing MongoDB `users` and `sessionchats` records separately if they need to be retained. Do not run a data import until the source and destination backups have been verified.

Health transcripts are sensitive data. Define retention/deletion rules and access controls appropriate to your jurisdiction before real patient use.
