import { NextResponse } from "next/server";
import pg from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnosticDetails: any = {
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      BETTER_AUTH_SECRET_SET: !!process.env.BETTER_AUTH_SECRET,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
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

    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user', 'session', 'account', 'verification');
    `);
    diagnosticDetails.tablesFound = tables.rows.map((r: any) => r.table_name);

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
