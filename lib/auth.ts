import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/broker/login",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const email = String(credentials?.email || "").toLowerCase().trim();
        const password = String(credentials?.password || "");

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { brokerProfile: true },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: (user.role as "ADMIN" | "BROKER") ?? "BROKER",
          status:
            (user.status as "ACTIVE" | "PENDING" | "SUSPENDED") ?? "ACTIVE",
          brokerProfileId: user.brokerProfile?.id ?? null,
          brokerCity: user.brokerProfile?.city ?? null,
          businessName: user.brokerProfile?.businessName ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.status = user.status;
        token.brokerProfileId = user.brokerProfileId;
        token.brokerCity = user.brokerCity;
        token.businessName = user.businessName;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.brokerProfileId = token.brokerProfileId ?? null;
        session.user.brokerCity = token.brokerCity ?? null;
        session.user.businessName = token.businessName ?? null;
      }

      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
