import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 [SERVER] Authorization attempt:', { email: credentials?.email })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [SERVER] Missing credentials')
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            school: true
          }
        })

        if (!user) {
          console.log('❌ [SERVER] User not found:', credentials.email)
          return null
        }

        if (!user.password) {
          console.log('❌ [SERVER] User has no password')
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          console.log('❌ [SERVER] Invalid password for:', credentials.email)
          return null
        }

        if (!user.isActive) {
          console.log('❌ [SERVER] Account deactivated for:', credentials.email)
          throw new Error("Account is deactivated")
        }

        console.log('✅ [SERVER] Login successful for:', credentials.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          schoolId: user.schoolId,
          schoolName: user.school?.name
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.schoolId = user.schoolId
        token.schoolName = user.schoolName
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.schoolId = token.schoolId as string
        session.user.schoolName = token.schoolName as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login"
  }
}
