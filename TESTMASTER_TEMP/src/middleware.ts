import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/api/admin") || path.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden - Admins only" }, { status: 403 });
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/api/admin/:path*", "/admin/:path*", "/student/:path*", "/api/tests/:path*"],
};
