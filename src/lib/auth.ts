import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
  // Prevent CSRF 'Invalid Origin' errors by trusting all valid deployment domains
  trustedOrigins: [
    "https://gym-app-2-nine.vercel.app",
    "https://gym-app-2-azure.vercel.app",
    "https://gym-app-2.vercel.app",
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // Log the link in the terminal console for easy development/fallback testing
        console.log(`\n======================================================`);
        console.log(`MAGIC LINK GENERATED FOR: ${email}`);
        console.log(`LINK: ${url}`);
        console.log(`======================================================\n`);

        if (resend) {
          try {
            await resend.emails.send({
              from: "Pulse Auth <onboarding@resend.dev>", // Default free sandbox sender
              to: email,
              subject: "Verify your login to Pulse",
              html: `
                <div style="font-family: sans-serif; background: #0c0f17; color: #fff; padding: 30px; border-radius: 16px; max-width: 480px; margin: auto; border: 1px solid rgba(255,255,255,0.08);">
                  <h1 style="color: #00F2FE; font-weight: 800; letter-spacing: 2px; margin-bottom: 8px; font-family: monospace;">PULSE</h1>
                  <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">Your passwordless login link is ready. Click the button below to sign in to your dashboard.</p>
                  <a href="${url}" style="display: inline-block; background: #fff; color: #0f172a; padding: 12px 24px; border-radius: 12px; font-weight: bold; text-decoration: none; font-size: 14px; margin-bottom: 24px;">SIGN IN INSTANTLY</a>
                  <p style="color: #64748b; font-size: 11px;">If the button doesn't work, copy and paste this URL into your browser:<br/><span style="color: #38bdf8; word-break: break-all;">${url}</span></p>
                </div>
              `,
            });
          } catch (error) {
            console.error("Failed to send magic link via Resend:", error);
          }
        }
      },
    }),
  ],
});
