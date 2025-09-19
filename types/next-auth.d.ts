import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
      schoolId?: string | null
      schoolName?: string | null
    }
  }

  interface User {
    role: string
    schoolId?: string | null
    schoolName?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    schoolId?: string | null
    schoolName?: string | null
  }
}
