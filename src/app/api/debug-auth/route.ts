import { NextResponse } from "next/server";
import pg from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnosticDetails: any = {
    env: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL_SET: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY_SET: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY_SET: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      GOOGLE_CLIENT_ID_SET: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET_SET: !!process.env.GOOGLE_CLIENT_SECRET,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      VERCEL_URL: process.env.VERCEL_URL,
    },
    dbConnection: "Not attempted",
    error: null,
  };

  try {
    const { Client } = pg;
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });

    diagnosticDetails.dbConnection = "Attempting connect...";
    await client.connect();
    diagnosticDetails.dbConnection = "Connected successfully";

    const res = await client.query("SELECT version()");
    diagnosticDetails.dbVersion = res.rows[0].version;

    // Check Supabase auth tables and app tables
    const authTables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'auth'
      AND table_name IN ('users', 'sessions', 'identities');
    `);
    diagnosticDetails.authTablesFound = authTables.rows.map((r: any) => r.table_name);

    const appTables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('profiles', 'job_contexts');
    `);
    diagnosticDetails.appTablesFound = appTables.rows.map((r: any) => r.table_name);

    await client.end();
  } catch (err: any) {
    diagnosticDetails.dbConnection = "Failed";
    diagnosticDetails.error = {
      message: err.message,
      code: err.code,
      stack: err.stack,
    };
  }

  return NextResponse.json(diagnosticDetails);
}
