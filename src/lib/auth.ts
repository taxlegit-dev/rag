import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // Remove adapter - we'll handle user creation manually for both providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    CredentialsProvider({
      id: "otp",
      name: "OTP",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        otp: { label: "OTP", type: "text" },
        firstName: { label: "First Name", type: "text" },
        lastName: { label: "Last Name", type: "text" },
        isSignup: { label: "Is Signup", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) {
          throw new Error("Phone and OTP are required");
        }

        try {
          // Find the OTP record
          const otpRecord = await prisma.oTP.findUnique({
            where: { phone: credentials.phone },
          });

          if (!otpRecord) {
            throw new Error("OTP not found or expired");
          }

          // Check if OTP is expired
          if (new Date() > otpRecord.expiresAt) {
            await prisma.oTP.delete({ where: { phone: credentials.phone } });
            throw new Error("OTP has expired");
          }

          // Verify OTP
          if (otpRecord.otp !== credentials.otp) {
            throw new Error("Invalid OTP");
          }

          // Check if this is a sub-user login first
          const subUser = await prisma.subUser.findUnique({
            where: { contactNumber: credentials.phone },
            include: { department: true, user: true },
          });

          let user;
          let isSubUser = false;

          if (subUser) {
            // Sub-user login
            isSubUser = true;
            user = subUser.user; // The main user who owns this sub-user
          } else {
            // Main user login
            user = await prisma.user.findFirst({
              where: { phone: credentials.phone },
            });

            const isSignup = credentials.isSignup === "true";

            if (isSignup) {
              // Signup scenario - user should not exist (already checked in send-otp)
              if (!credentials.firstName || !credentials.lastName) {
                throw new Error("First name and last name are required");
              }

              // Get the default plan
              const defaultPlan = await prisma.plan.findFirst({
                where: { isDefault: true },
              });

              // Create new user
              user = await prisma.user.create({
                data: {
                  firstName: credentials.firstName,
                  lastName: credentials.lastName,
                  phone: credentials.phone,
                  planId: defaultPlan?.id || null,
                  remainingProcesses: defaultPlan?.processLimit ?? 0,
                  remainingSubprocesses: defaultPlan?.subprocessLimit ?? 0,
                },
              });

              console.log("✅ New user created (OTP):", user.id, user.phone);
            } else {
              // Login scenario - user should exist (already checked in send-otp)
              if (!user) {
                throw new Error("User not found");
              }
            }
          }

          // Delete OTP after successful verification
          await prisma.oTP.delete({ where: { phone: credentials.phone } });

          if (isSubUser && subUser) {
            // Return sub-user session data
            return {
              id: subUser.id,
              phone: subUser.contactNumber,
              firstName: subUser.name,
              lastName: "", // Sub-users don't have separate first/last names
              role: "subuser",
              email: null,
              image: null,
              subUserId: subUser.id,
              userId: subUser.userId,
              departmentId: subUser.departmentId,
            };
          } else {
            // Return main user session data
            return {
              id: user.id,
              phone: user.phone,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              email: user.email,
              image: user.image,
            };
          }
        } catch (error) {
          console.error("❌ OTP Auth error:", error);
          throw error;
        }
      },
    }),
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
          console.log("Missing email or password");
          throw new Error("Email and password are required");
        }

        try {
          console.log("Admin login attempt for email:", email);
          // Find admin user in DB
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

          if (!adminUser) {
            console.log("User not found for email:", email);
            throw new Error("Invalid credentials");
          }

          if (!adminUser.password) {
            console.log("User has no password for email:", email);
            throw new Error("Invalid credentials");
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            adminUser.password
          );

          if (!isValidPassword) {
            console.log("Password invalid for email:", email);
            throw new Error("Invalid credentials");
          }

          console.log("✅ Admin login successful for email:", email);
          return {
            id: adminUser.id,
            email: adminUser.email,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            phone: adminUser.phone,
            role: adminUser.role,
            image: adminUser.image,
          };
        } catch (error) {
          console.error("❌ Admin auth error:", error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt", // JWT for all authentication methods
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth - create/update user in database
      if (account?.provider === "google") {
        try {
          const email = user.email;
          if (!email) return false;

          // Check if user already exists
          let existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (!existingUser) {
            // Split name into firstName and lastName
            let firstName = "";
            let lastName = "";

            if (user.name) {
              const nameParts = user.name.trim().split(" ");
              firstName = nameParts[0] || "";
              lastName = nameParts.slice(1).join(" ") || "";
            }

            // Fetch the default plan
            const defaultPlan = await prisma.plan.findFirst({
              where: { isDefault: true },
            });

            // Create new user
            existingUser = await prisma.user.create({
              data: {
                email,
                emailVerified: new Date(),
                image: user.image,
                firstName,
                lastName,
                phone: "",
                planId: defaultPlan?.id || null,
                remainingProcesses: defaultPlan?.processLimit ?? 0,
                remainingSubprocesses: defaultPlan?.subprocessLimit ?? 0,
              },
            });

            console.log(
              "✅ New user created (Google):",
              existingUser.id,
              existingUser.email
            );
          } else {
            // Update existing user's image and emailVerified if needed
            await prisma.user.update({
              where: { email },
              data: {
                image: user.image,
                emailVerified: new Date(),
              },
            });
          }

          // Update user object with database values
          user.id = existingUser.id;
          user.firstName = existingUser.firstName;
          user.lastName = existingUser.lastName;
          user.role = existingUser.role;
          user.phone = existingUser.phone;

          return true;
        } catch (error) {
          console.error("❌ Google sign in error:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      // On sign in, add user data to token
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.email = user.email;
        token.image = user.image;
        // Add sub-user specific fields if present
        if (user.subUserId) token.subUserId = user.subUserId;
        if (user.userId) token.userId = user.userId;
        if (user.departmentId) token.departmentId = user.departmentId;
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        // Add sub-user specific fields if present
        if (token.subUserId) session.user.subUserId = token.subUserId as string;
        if (token.userId) session.user.userId = token.userId as string;
        if (token.departmentId)
          session.user.departmentId = token.departmentId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.MODE === "development",
};
