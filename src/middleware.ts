import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // Role-based authorization
    if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Onboarding redirection: enforce onboarding if not complete
    if (!token.isOnboarded && !pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    // Prevent onboarded users from returning to the onboarding wizard
    if (token.isOnboarded && pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // If there's a token, user is authenticated
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Protect dashboard, onboarding, admin routes and base routes
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/admin/:path*',
    '/safety/:path*',
    '/health/:path*',
    '/wellness/:path*',
    '/community/:path*',
    '/chat/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/premium/:path*',
  ],
};
