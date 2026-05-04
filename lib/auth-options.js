import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { isMissingTableError } from "@/lib/prisma-errors";
import { getSiteSettings } from "@/lib/site-settings";
import { ensureUserFinanceSetup } from "@/lib/user";

const providers = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password are required");
      }

      try {
        const siteSettings = await getSiteSettings();

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user?.password) {
          throw new Error("Invalid credentials");
        }

        const valid = await verifyPassword(credentials.password, user.password);
        if (!valid) {
          throw new Error("Invalid credentials");
        }

        if (siteSettings.requireEmailVerification && !user.emailVerified) {
          throw new Error("Please verify your email before logging in");
        }

        return user;
      } catch (error) {
        if (isMissingTableError(error)) {
          throw new Error("Database is not initialized yet");
        }

        throw error;
      }
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  );
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name || token.name;
        token.email = user.email || token.email;
        token.picture = user.image || token.picture;
        token.role = user.role || "user";
        token.defaultCurrencyId = user.defaultCurrencyId || null;
        token.emailVerified = user.emailVerified || null;
      }

      if (token?.sub) {
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.sub },
            include: { defaultCurrency: true },
          });
          if (freshUser) {
            token.name = freshUser.name;
            token.email = freshUser.email;
            token.picture = freshUser.image;
            token.role = freshUser.role;
            token.defaultCurrencyId = freshUser.defaultCurrencyId;
            token.defaultCurrencyCode = freshUser.defaultCurrency?.code || "USD";
            token.emailVerified = freshUser.emailVerified;
          }
        } catch (error) {
          if (!isMissingTableError(error)) {
            throw error;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.sub) {
        session.user.name = token.name || session.user.name;
        session.user.email = token.email || session.user.email;
        session.user.image = token.picture || session.user.image;
        session.user.id = token.sub;
        session.user.role = token.role || "user";
        session.user.defaultCurrencyId = token.defaultCurrencyId || null;
        session.user.defaultCurrencyCode = token.defaultCurrencyCode || "USD";
        session.user.emailVerified = token.emailVerified || null;
      }

      return session;
    },
    async signIn({ user, account }) {
      if (user?.id) {
        await ensureUserFinanceSetup(user.id, user.defaultCurrencyId || null);
        if (account?.provider && account.provider !== "credentials") {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              emailVerified: user.emailVerified || new Date(),
            },
          });
        }
      }
      return true;
    },
  },
};
