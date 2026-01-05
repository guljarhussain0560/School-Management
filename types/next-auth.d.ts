import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
      image?: string | null
      phone?: string | null
      address?: string | null
      schoolId?: string | null
      schoolName?: string | null
    }
  }

  interface User {
    role: string
    image?: string | null
    phone?: string | null
    address?: string | null
    schoolId?: string | null
    schoolName?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    phone?: string | null
    address?: string | null
    schoolId?: string | null
    schoolName?: string | null
  }
}
