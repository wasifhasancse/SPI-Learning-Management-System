import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login" || request.nextUrl.pathname === "/admin/login/") {
    return NextResponse.next();
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
      query: { disableCookieCache: true, disableRefresh: true }
    });

    if (!session?.user) {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.headers.set("Cache-Control", "no-store");
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Failed to verify dashboard session:", error);
    return new NextResponse("Unable to verify your session. Please try again later.", {
      status: 503,
      headers: { "Cache-Control": "no-store" }
    });
  }
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"]
};
