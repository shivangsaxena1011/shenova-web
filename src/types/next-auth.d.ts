import NextAuth, { DefaultSession } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

export type UserRole = 'USER' | 'PREMIUM' | 'ADMIN' | 'MODERATOR';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isOnboarded: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: UserRole;
    isOnboarded: boolean;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    isOnboarded: boolean;
  }
}
