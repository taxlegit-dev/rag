import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone?: string | null;
      firstName: string;
      lastName: string;
      email?: string | null;
      image?: string | null;
      role?: string;
      subUserId?: string;
      userId?: string;
      departmentId?: string;
    };
  }

  interface User {
    id: string;
    phone?: string | null;
    firstName: string;
    lastName: string;
    email?: string | null;
    image?: string | null;
    role?: string;
    subUserId?: string;
    userId?: string;
    departmentId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phone?: string | null;
    firstName: string;
    lastName: string;
    email?: string | null;
    image?: string | null;
    role?: string;
    subUserId?: string;
    userId?: string;
    departmentId?: string;
  }
}
