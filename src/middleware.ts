import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    // This function will only run for authenticated requests
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        return !!token;
      },
    },
    pages: {
      signIn: "/login", // custom sign in page
    },
  },
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
