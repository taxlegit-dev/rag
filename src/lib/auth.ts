import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase();
        if (!email || !credentials?.password) {
          throw new Error("Email and password are required");
        }
        if (email !== "admin@taxlegit.com") {
          throw new Error("Invalid credentials");
        }

        const adminUser = await prisma.user.findUnique({
          where: { email },
          select: {
            email: true,
            password: true,
          },
        });

        if (!adminUser || !adminUser.password) {
          throw new Error("Invalid credentials");
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          adminUser.password,
        );

        if (!isValidPassword) {
          throw new Error("Invalid credentials");
        }

        return {
          id: adminUser.email,
          email: adminUser.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string | null | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  debug: process.env.MODE === "development",
};
