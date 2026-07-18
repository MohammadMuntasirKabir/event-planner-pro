import { NextResponse } from "next/server";

export default function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|png|ico|ttf|woff2?|map)).*)",
    "/(api|trpc)(.*)",
  ],
};
