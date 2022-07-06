import { Button, Form } from "react-bulma-components";
import {Form as RemixForm, useActionData, useTransition} from '@remix-run/react'
import type { Request } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { toObjectLiteral } from "~/lib/form";
import { z } from "zod";
import { hash } from "bcryptjs";
import { prisma } from "prisma/prisma.server";
import { UserRole } from "@prisma/client";

const registerSchema = z.object({
	email: z.string().email(),
	name: z.string().min(3).max(64),
	password: z.string().min(8).max(64)
})

export async function action({request}: {request: Request}) {
	const formData = await request.formData()
	const data = toObjectLiteral(formData)
	const parsedFormData = await registerSchema.safeParseAsync(data)
	if (!parsedFormData.success) {
		const errors = parsedFormData.error.flatten()
		return {validationErrors: errors}
	}
	let {email, password, name} = parsedFormData.data
	const hashedPassword = await hash(password, 10)
	await prisma.user.create({data: {email, name, hashedPassword, role: UserRole.STANDARD}})
	return redirect('/')
}

export default function Register() {
	const action = useActionData() as {validationErrors?: z.typeToFlattenedError<z.infer<typeof registerSchema>> | undefined}
	const transition = useTransition()

	return (
		<>
			<RemixForm method="post">
				<Form.Field>
					<Form.Label>Name</Form.Label>
					<Form.Control>
						<Form.Input color={action?.validationErrors?.fieldErrors.name ? "danger" : undefined} placeholder="Username" name="name" />
					</Form.Control>
					{action?.validationErrors?.fieldErrors.name ? <Form.Help color="danger">{action.validationErrors?.fieldErrors.name.join(' ')}</Form.Help> : null}
				</Form.Field>
				<Form.Field>
					<Form.Label>Email</Form.Label>
					<Form.Control>
						<Form.Input color={action?.validationErrors?.fieldErrors.email ? "danger" : undefined} placeholder="Email" name="email" type="text"/>
					</Form.Control>
					{action?.validationErrors?.fieldErrors.email ? <Form.Help color="danger">{action.validationErrors?.fieldErrors.email.join(' ')}</Form.Help> : null}
				</Form.Field>
				<Form.Field>
					<Form.Label>Password</Form.Label>
					<Form.Control>
						<Form.Input color={action?.validationErrors?.fieldErrors.password ? "danger" : undefined} placeholder="Password" name="password" type="password" />
					</Form.Control>
					{action?.validationErrors?.fieldErrors.password ? <Form.Help color="danger">{action.validationErrors?.fieldErrors.password.join(' ')}</Form.Help> : null}
				</Form.Field>
				<Button.Group>
					<Button disabled={transition.state === 'submitting'} fullwidth rounded color="primary" type='submit'>{transition.state === 'submitting' ? 'Submitting' : 'Register'}</Button>
				</Button.Group>
			</RemixForm>
		</>
	)
}