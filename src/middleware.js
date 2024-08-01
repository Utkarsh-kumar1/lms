import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Middleware function
export async function middleware(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    const url = req.nextUrl.clone();


    if (token && (
        url.pathname.startsWith('/sign-in') ||
        url.pathname.startsWith('/sign-up') ||
        url.pathname.startsWith('/verify') ||
        url.pathname === '/'
    )) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (!token && (
        url.pathname.startsWith('/dashboard') ||
        // url.pathname.startsWith('/Activity') ||
        url.pathname.startsWith('/Revision')
    )) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}

// Middleware matcher
export const config = {
    matcher: [
        '/sign-in',
        '/sign-up',
        '/',
        '/dashboard/:path*',
        '/verify/:path*'
    ],
};
