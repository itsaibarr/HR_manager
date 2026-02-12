import { betterAuth } from "better-auth";

const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

export const auth = betterAuth({
  baseURL: getBaseURL(),
  database: {
    type: "postgres",
    connectionString: process.env.DATABASE_URL || "postgres://dummy:dummy@localhost:5432/dummy",
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  },
  emailAndPassword: {
    enabled: true,
  },
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    },
  } : {}),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    // @ts-expect-error - generateId is a valid runtime option in Better Auth 1.x but may be missing in current type definitions
    generateId: () => crypto.randomUUID(),
  },
});

export type Session = typeof auth.$Infer.Session;
