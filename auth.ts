import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/auth-schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      authorization: {
        params: {
          // Two-tier OAuth: sign-in asks for identity only. Repo access
          // (repo,read:org) is requested lazily at scan time via incremental
          // consent (see components/scan/connect-repos.tsx).
          scope: "read:user,user:email",
        },
      },
    }),
  ],
  callbacks: {
    // The Drizzle adapter only persists tokens on the FIRST account link —
    // a repeat sign-in (e.g. the incremental repo-scope consent) would drop
    // the upgraded token/scope. This runs on every OAuth callback and always
    // carries the freshly issued token, so upsert it manually.
    async signIn({ account }) {
      if (account?.provider === "github" && account.access_token) {
        await db
          .update(accounts)
          .set({
            access_token: account.access_token,
            scope: account.scope,
            token_type: account.token_type,
            expires_at: account.expires_at,
            refresh_token: account.refresh_token ?? undefined,
          })
          .where(
            and(
              eq(accounts.provider, "github"),
              eq(accounts.providerAccountId, account.providerAccountId)
            )
          );
      }
      return true;
    },
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
