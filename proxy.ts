import { NextRequest, NextResponse } from "next/server";

function isServerActionPost(request: NextRequest) {
  if (request.method !== "POST") return false;
  const h = request.headers;
  return Boolean(h.get("Next-Action") ?? h.get("next-action"));
}

export default async function proxy(request: NextRequest) {
  if (isServerActionPost(request)) {
    return NextResponse.next();
  }

  const { getSession } = await import("@/lib/auth/server");
  const session = await getSession();

  if (!session) {
    const url = new URL("/auth/sign-in", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/events/:path*"],
};
