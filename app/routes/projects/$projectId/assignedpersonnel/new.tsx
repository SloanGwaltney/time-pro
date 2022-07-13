import { UserRole } from '@prisma/client'
import type { ActionFunction, LoaderFunction} from '@remix-run/node';
import { redirect} from '@remix-run/node';
import { json } from '@remix-run/node'
import {Form as RemixForm, useTransition} from '@remix-run/react'
import { prisma } from 'prisma/prisma.server'
import { Button, Form } from 'react-bulma-components'
import { z } from 'zod'
import { authorizeOrRedirect } from '~/lib/auth'
import { parseFormData, validateBodyOrReturnResponse } from '~/lib/form'
import { getSession } from '~/session'

const assignPersonnelSchema = z.object({
	email: z.string().email()
})

export const loader: LoaderFunction = async ({request}) => {
	const session = await getSession(request.headers.get('Cookie'))
	await authorizeOrRedirect(session, UserRole.PROJECT_MANAGER, 'Assign Personnel to a Project')
	return null
}

export const action: ActionFunction = async ({request, params}) => {
	const session = await getSession(request.headers.get('Cookie'))
	await authorizeOrRedirect(session, UserRole.PROJECT_MANAGER, 'Assign Personnel to a Project')
	const body = await parseFormData(request)
	console.log(body)
	const validationResult = await validateBodyOrReturnResponse(body, assignPersonnelSchema)
	console.log(validationResult)
	const user = await prisma.user.findUnique({where: {email: validationResult.data.email}, select: {id: true}})
	if (!user) return json({validationError: {email: 'Invalid Email'}})
	await prisma.projectPersonnel.create({data: {assignedUserId: user.id, projectId: Number(params.projectId)}})
	return redirect(`/projects/${params.projectId}`)
}

const NewProjectPersonnel: React.FC<{}> = () => {
	const transition = useTransition()

	return (
		<div>
			<RemixForm method='post'>
				<Form.Field>
					<Form.Label>Email</Form.Label>
					<Form.Control>
						<Form.Input name="email" />
					</Form.Control>
				</Form.Field>
				<Button disabled={transition.state === 'submitting'} fullwidth rounded color="primary" type='submit'>{transition.state === 'submitting' ? 'Submitting' : 'Assign Personnel'}</Button>
			</RemixForm>
		</div>
	)
}

export default NewProjectPersonnel