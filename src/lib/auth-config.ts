import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { getUserByEmail, verifyPassword } from '@/lib/auth';
import { getUsersCollection } from '@/lib/mongodb';
import NextAuth from 'next-auth';

export const authOptions = {
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

        const email = typeof credentials.email === 'string' ? credentials.email : '';
        const password = typeof credentials.password === 'string' ? credentials.password : '';

        if (!email || !password) {
          return null;
        }

        const user = await getUserByEmail(email);
        if (!user || !user.password) {
          return null;
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user._id?.toString() || '',
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user, account }: { user: any; account?: any }) {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
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
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true, // Required for Vercel deployments
};

export const { handlers, auth } = NextAuth(authOptions);
