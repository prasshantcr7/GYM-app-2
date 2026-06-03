import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  // Set baseURL for redirects
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  // Fallback secret for seamless local-first development
  secret: process.env.BETTER_AUTH_SECRET || "default_development_secret_32_characters_long",
});
