import { cookies } from 'next/headers';

// For NextAuth v5 beta, getServerSession is not exported from 'next-auth'
// We fetch the session from the NextAuth session API endpoint
export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        cookie: cookieHeader,
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return null;
    }
    
    const session = await response.json();
    return session?.user ? session : null;
  } catch (error) {
    return null;
  }
}
