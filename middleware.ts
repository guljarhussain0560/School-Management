import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/signup']
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Role-based access control
    const userRole = token.role as string

    // Admin-only routes
    const adminRoutes = [
      '/api/users',
      '/api/financial',
      '/admin'
    ]
    
    if (adminRoutes.some(route => pathname.startsWith(route)) && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    // Teacher and Admin routes
    const teacherAdminRoutes = [
      '/api/academic/attendance',
      '/api/academic/assignments',
      '/api/academic/students',
      '/api/academic/student-performance',
      '/api/academic/recent-admissions',
      '/api/academic/subjects',
      '/api/academic/curriculum-progress',
      '/api/academic/teacher-assignments'
    ]
    
    if (teacherAdminRoutes.some(route => pathname.startsWith(route)) && !['TEACHER', 'ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    // Transport routes (accessible by TRANSPORT and ADMIN)
    const transportRoutes = [
      '/api/operations/bus-routes',
      '/api/operations/maintenance',
      '/api/operations/safety-alerts'
    ]
    
    if (transportRoutes.some(route => pathname.startsWith(route)) && !['TRANSPORT', 'ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    // Dashboard access based on role
    if (pathname === '/home') {
      return NextResponse.next()
    }

    // Input portal access based on role
    if (pathname === '/input-portal') {
      return NextResponse.next()
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to public routes
        const publicRoutes = ['/', '/login', '/signup']
        if (publicRoutes.includes(pathname)) {
          return true
        }

        // Require authentication for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/home/:path*',
    '/input-portal/:path*',
    '/admin/:path*',
    '/api/:path*',
    '/unauthorized'
  ]
}
