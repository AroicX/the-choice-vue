import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/types";

const adminOnlyRoles: UserRole[] = ["ADMIN", "SUPER_ADMIN"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("choice9ja-role")?.value as UserRole | undefined;

  if (pathname.startsWith("/control")) {
    if (!authCookie || !adminOnlyRoles.includes(authCookie)) {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    if (pathname.startsWith("/control/settings") && authCookie !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/control/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/control/:path*"]
};
