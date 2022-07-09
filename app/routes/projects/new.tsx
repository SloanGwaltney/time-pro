import { UserRole } from "@prisma/client";
import type { Request, Session } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form as RemixForm, useActionData, useTransition } from "@remix-run/react";
import { prisma } from "prisma/prisma.server";
import { Button, Form } from "react-bulma-components";
import { z } from "zod";
import { authorizeOrRedirect } from "~/lib/auth";
import { parseFormData, validateBodyOrReturnResponse } from "~/lib/form";
import { getSession } from "~/session";

export const newProjectSchema = z.object({
	name: z.string().min(3).max(32),
	number: z.string().min(3).max(32),
	description: z.string().min(20).max(256)
})

export async function loader({request}: {request: Request}) {
	const session = await getSession(request.headers.get('Cookie'))
	await authorizeOrRedirect(session, UserRole.PROJECT_MANAGER, 'create a project')	
	return null
}

async function createProject(session: Session, data: z.infer<typeof newProjectSchema>) {
	return prisma.project.create({data: {...data, createdById: session.get('userId')}})
}

export async function action({request}: {request: Request}) {
	const session = await getSession(request.headers.get('Cookie'))
	await authorizeOrRedirect(session, UserRole.PROJECT_MANAGER, 'create a project')
	const body = await parseFormData(request)
	const validationResult = await validateBodyOrReturnResponse(body, newProjectSchema)
	await createProject(session, validationResult.data)
	return redirect('/projects')
}

export default function NewProject() {
	const action = useActionData()
	const transition = useTransition()

	return (
		<RemixForm method="post">
			<Form.Field>
				<Form.Label>Project Name</Form.Label>
				<Form.Control>
					<Form.Input name="name" color={action?.validationErrors?.fieldErrors.name ? 'danger' : undefined} />
				</Form.Control>
				{action?.validationErrors?.fieldErrors.name ? <Form.Help color="danger">{action?.validationErrors?.fieldErrors.name.join(' ')}</Form.Help> : null}
			</Form.Field>
			<Form.Field>
				<Form.Label>Project Number</Form.Label>
				<Form.Control>
					<Form.Input color={action?.validationErrors?.fieldErrors.number ? 'danger' : undefined} name="number" />
				</Form.Control>
				{action?.validationErrors?.fieldErrors.number ? <Form.Help color="danger">{action?.validationErrors?.fieldErrors.number.join(' ')}</Form.Help> : null}
			</Form.Field>
			<Form.Field>
				<Form.Label>Project Description</Form.Label>
				<Form.Control>
					<Form.Input color={action?.validationErrors?.fieldErrors.description ? 'danger' : undefined} name="description" />
				</Form.Control>
				{action?.validationErrors?.fieldErrors.description ? <Form.Help color='danger'>{action?.validationErrors?.fieldErrors.description.join(' ')}</Form.Help> : null}
			</Form.Field>
			<Button disabled={transition.state === 'submitting'} fullwidth rounded color="primary" type='submit'>{transition.state === 'submitting' ? 'Submitting' : 'Create Project'}</Button>
		</RemixForm>
	)
}