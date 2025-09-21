import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { routeAccessMap } from "./lib/settings"; // your role → routes map

// Build matchers from your settings
const matchers = Object.keys(routeAccessMap).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route],
}));

export default clerkMiddleware((auth, req) => {
  const { sessionClaims } = auth();

  // Extract role from Clerk metadata
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // ✅ Step 1: If no role, force them to unauthorized
  if (!role) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // ✅ Step 2: Check access rules for this request
  for (const { matcher, allowedRoles } of matchers) {
    if (matcher(req)) {
      if (!allowedRoles.includes(role)) {
        // Redirect to dashboard for their own role
        return NextResponse.redirect(new URL(`/${role}`, req.url));
      }
    }
  }

  // If nothing matched, allow request
  return NextResponse.next();
});

// Apply middleware globally (except Next.js internals)
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
