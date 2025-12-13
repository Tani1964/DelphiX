import { auth } from '@/lib/auth-config';

// Use NextAuth v5's auth() function for server-side session access
// This works properly in Vercel/serverless environments
export async function getServerSession() {
  const session = await auth();
  return session;
}
