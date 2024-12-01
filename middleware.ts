import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware((auth, request) => {
  const isPublic = isPublicRoute(request);

  if (!isPublic) {
    const { userId } = auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Attach userId to the request headers for Python to use
    request.headers.set("x-user-id", userId);
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
