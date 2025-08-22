import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  const role = session?.user.id

  const protectedRoutes = ["/dashboard", "/payment"]
  const pathname = req.nextUrl.pathname;
   const isProtected = protectedRoutes.some((route) =>
     pathname.startsWith(route)
   );

  console.log("🔎 Middleware path:", pathname);
  console.log("🔑 Session:", session ? "exists ✅" : "null ❌", error);

  // If accessing protected routes but no session
  if (isProtected && !session) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and trying to access login/signup → redirect to dashboard
  if ((pathname === "/login" || pathname === "/signup") && session) {
    if (role !== "admin") { 
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    else {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
