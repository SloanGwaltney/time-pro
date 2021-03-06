import type { UserRole } from "@prisma/client";
import type { Session } from "@remix-run/node";
import { createCookieSessionStorage } from "@remix-run/node"; // or "@remix-run/cloudflare"

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    // a Cookie from `createCookie` or the CookieOptions to create one
    cookie: {
      name: "__session",

      // all of these are optional
      domain: process.env.COOKIE_DOMAIN,
      // Expires can also be set (although maxAge overrides it when used in combination).
      // Note that this method is NOT recommended as `new Date` creates only one date on each server deployment, not a dynamic date in the future!
      //
      // expires: new Date(Date.now() + 60_000),
      httpOnly: true,
      maxAge: 60,
      path: "/",
      sameSite: "lax",
      secrets: [process.env.COOKIE_SECRET_1 as string],
      secure: process.env.NODE_ENV === 'production',
    },
  });

	function sessionHasRole(session: Session, role: UserRole) {
		const sessionRole = session.get('userRole')
		return sessionRole && sessionRole === role
	}

	function getSessionFromCookieHeader(request: Request) {
		return getSession(request.headers.get('Cookie'))
	}
export { getSession, commitSession, destroySession, sessionHasRole, getSessionFromCookieHeader };