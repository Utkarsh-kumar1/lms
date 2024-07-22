import { NextResponse, NextRequest } from 'next/server'
export { default } from "next-auth/middleware"
import { getToken } from 'next-auth/jwt'

// This function can be marked `async` if using `await` inside
export async function middleware(req) {

    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    console.log(token);
    const url = req.nextUrl

    if (token && (
        url.pathname.startsWith('/sign-in') ||
        url.pathname.startsWith('/sign-up') ||
        url.pathname.startsWith('/verify') ||
        url.pathname.startsWith('/')
    )) {
        return NextResponse.redirect(new URL('/test', req.url))
    }

    if (!token && url.pathname.startsWith('/dashboard')) 
    {
        return NextResponse.redirect(new URL('/sign-in' , req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/sign-in',
        '/sign-up',
        '/',
        '/dashboard/:path*',
        '/verify/:path*'

    ],
}