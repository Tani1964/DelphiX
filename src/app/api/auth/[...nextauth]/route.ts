import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { getUserByEmail, createUser, verifyPassword } from '@/lib/auth';
import { getUsersCollection } from '@/lib/mongodb';
import { User } from '@/types';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await getUserByEmail(credentials.email);
        if (!user || !user.password) {
          return null;
        }

        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user._id || '',
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const users = await getUsersCollection();
        const existingUser = await users.findOne({ email: user.email });

        if (!existingUser) {
          // Create new user from Google OAuth
          await users.insertOne({
            email: user.email,
            name: user.name || '',
            role: 'user',
            emergencyContacts: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || 'user';
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
};

// For NextAuth v5, export handlers and auth function
export const { handlers, auth } = NextAuth(authOptions);

export const { GET, POST } = handlers;

