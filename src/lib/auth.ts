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

        const adminUser = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            password: true,
            role: true,
            image: true,
          },
        });

        if (!adminUser || !adminUser.password || adminUser.role !== "ADMIN") {
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
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          phone: adminUser.phone,
          role: adminUser.role,
          image: adminUser.image,
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
        token.phone = user.phone;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.email = user.email;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
        session.user.firstName = token.firstName as string | undefined;
        session.user.lastName = token.lastName as string | undefined;
        session.user.role = token.role as string;
        session.user.email = token.email as string | null | undefined;
        session.user.image = token.image as string | null | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  debug: process.env.MODE === "development",
};
