import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    // This function will only run for authenticated requests
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // return false if the user is an admin - this will prevent them from accessing the frontend pages
        if (token?.role === "ADMIN") return false;
        return !!token;
      },
    },
    pages: {
      signIn: "/login", // custom sign in page
    },
  },
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|admin).*)"],
};
