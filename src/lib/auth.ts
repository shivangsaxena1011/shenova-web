import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-client-secret',
    }),
    CredentialsProvider({
      id: 'mock-developer',
      name: 'Mock Developer Login',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'developer@shenova.ai' },
        name: { label: 'Name', type: 'text', placeholder: 'Jane Doe' },
        role: { label: 'Role', type: 'text', placeholder: 'USER' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error('Email is required');
        }

        try {
          const res = await fetch(`${API_URL}/api/v1/auth/mock-login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              name: credentials.name,
              role: credentials.role,
            }),
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Mock login failed');
          }

          const data = await res.json();
          return data.user;
        } catch (error: any) {
          throw new Error(error.message || 'Connection to API failed');
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const email = user.email?.toLowerCase();
        if (!email) return false;

        try {
          const res = await fetch(`${API_URL}/api/v1/auth/google-login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              name: user.name || 'Google User',
              googleId: account.providerAccountId,
              avatar: user.image,
            }),
          });

          if (!res.ok) {
            return false;
          }

          const data = await res.json();
          
          // Attach fields to next-auth user object for jwt callback
          user.id = data.user.id;
          user.role = data.user.role;
          user.isOnboarded = data.user.isOnboarded;
          return true;
        } catch (error) {
          console.error('Google sign in sync failed:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isOnboarded = user.isOnboarded;
      }

      // Handle updating session dynamically (e.g. after onboarding)
      if (trigger === 'update' && session) {
        if (session.isOnboarded !== undefined) {
          token.isOnboarded = session.isOnboarded;
        }
        if (session.name !== undefined) {
          token.name = session.name;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isOnboarded = token.isOnboarded;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-at-least-32-chars-long',
};
export default authOptions;
