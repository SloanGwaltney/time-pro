import type { UserRole } from "@prisma/client";
import type { Session } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { commitSession, sessionHasRole } from "~/session";

export async function authorizeOrRedirect(session: Session, role: UserRole, attemptedAction: string) {
	const authorized = isAuthorized(session, role)
	if (!authorized) {
		session.flash('error', `You do not have permission to ${attemptedAction}`)
		throw redirect('/', {headers: {'Set-Cookie': await commitSession(session)}})
	}
}

function isAuthorized(session: Session, role: UserRole) {
	return sessionHasRole(session, role)
}

export function requireUserId(session: Session) {
	const userId = session.get('userId')
	if (!userId) {
		session.flash('error', 'You must be logged in to perform this action')
		throw redirect('/', {status: 401})
	}
	return userId
}