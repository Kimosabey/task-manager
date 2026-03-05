import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

import { connectToMongoDB } from '@/lib/mongodb'
import { User } from '@/models/User'

export const sessionMaxAgeSeconds = 7 * 24 * 60 * 60

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
  session: {
    strategy: 'jwt',
    maxAge: sessionMaxAgeSeconds,
  },
  jwt: {
    maxAge: sessionMaxAgeSeconds,
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim()
        const password = credentials?.password

        if (!email || !password) return null

        await connectToMongoDB()

        const user = await User.findOne({ email }).select('+password')
        if (!user) return null

        const ok = await bcrypt.compare(password, user.password)
        if (!ok) return null

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as {
          id?: string
          role?: 'admin' | 'member'
          avatar?: string
        }

        token.id = u.id
        token.role = u.role
        token.avatar = u.avatar
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id ?? ''
      session.user.role = token.role
      session.user.avatar = token.avatar
      return session
    },
  },
}
