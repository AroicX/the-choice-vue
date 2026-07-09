import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/types";

const controlRoles: UserRole[] = ["ADMIN", "SUPER_ADMIN", "MODERATOR"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("choice9ja-role")?.value as UserRole | undefined;

  if (pathname.startsWith("/control")) {
    if (!authCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!controlRoles.includes(authCookie)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname.startsWith("/control/settings") && authCookie !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/control", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/control/:path*"]
};
