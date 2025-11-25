import { type NextRequest } from "next/server";
import { routing } from "@workspace/i18n/routing";
import createMiddleware from "@workspace/i18n/middleware";
import { updateSession } from "@/src/utils/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  return await updateSession(request, response);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
