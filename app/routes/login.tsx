import type { Request } from "@remix-run/node";
import { redirect } from "@remix-run/node"
import { Form as RemixForm, useActionData, useTransition } from "@remix-run/react"
import { compare } from "bcryptjs"
import { prisma } from "prisma/prisma.server"
import { Button, Form } from "react-bulma-components"
import { z } from "zod"
import { toObjectLiteral } from "~/lib/form"
import { commitSession, getSession } from "~/session"


const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8).max(64)
})

export async function loader({request}: {request: Request}) {
	const session = await getSession(request.headers.get("Cookie"))
	if (session.get('userId')) return redirect('/')
	return null
}

export async function action({request}: {request: Request}) {
	const formData = await request.formData()
	const data = toObjectLiteral(formData)
	const parsedData = await loginSchema.safeParseAsync(data)
	if (!parsedData.success) {
		return {validationErrors: parsedData.error.flatten()}
	}
	const {email, password} = parsedData.data
	const user = await prisma.user.findUnique({where: {email: email}})
	if (!user) {
		return {errors: ['Invalid email or password']}
	}
	const validPass = await compare(password, user.hashedPassword)
	if (!validPass) {
		return {errors: ['Invalid email or password']}
	}
	const session = await getSession(request.headers.get("Cookie"))
	session.set('userId', user.id)
	session.set('userRole', user.role)
	const cookie = await commitSession(session)
	return redirect('/', {headers: {'Set-Cookie': cookie}})
}

export default function Login() {
	const action = useActionData()
	const transition = useTransition()

	return (
		<RemixForm method="post">
			<h1>{action?.errors?.join()}</h1>
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
	)
}