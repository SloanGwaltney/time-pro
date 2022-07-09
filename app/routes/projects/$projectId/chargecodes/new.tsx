import { UserRole } from '@prisma/client'
import type { ActionFunction, LoaderFunction} from '@remix-run/node';
import { redirect } from '@remix-run/node'
import {Form as RemixForm, useActionData, useTransition} from '@remix-run/react'
import { prisma } from 'prisma/prisma.server'
import { Button, Form } from 'react-bulma-components'
import { z } from 'zod'
import { authorizeOrRedirect, requireUserId } from '~/lib/auth'
import { parseFormData, validateBodyOrReturnResponse } from '~/lib/form'
import { getSessionFromCookieHeader } from '~/session'


const chargeCodeSchema = z.object({
	number: z.string().min(3).max(64),
	name: z.string().min(3).max(128),
	description: z.string().min(3).max(256)
})

export const loader: LoaderFunction = async ({request}) => {
	const session = await getSessionFromCookieHeader(request)
	await authorizeOrRedirect(session, UserRole.PROJECT_MANAGER, 'Create a Charge Code')
	return null
}

export const action: ActionFunction = async ({request, params}) => {
	const session = await getSessionFromCookieHeader(request)
	const userId = await requireUserId(session)
	const data = await parseFormData(request)
	const body = await validateBodyOrReturnResponse(data, chargeCodeSchema)
	await prisma.chargeCode.create({data: {...body.data, projectId: Number(params.projectId), createdById: userId}})
	return redirect(`/projects/${params.projectId}`)
}

export default function ChargeCode() {
	const action = useActionData()
	const transition = useTransition()

	return (
		<div>
			<h1>Create Charge Code</h1>
			<RemixForm method='post'>
				<Form.Field>
					<Form.Label>Charge Code Number</Form.Label>
					<Form.Control>
						<Form.Input color={action?.validationErrors?.fieldErrors.number ? 'danger' : undefined} name="number"></Form.Input>
					</Form.Control>
					{action?.validationErrors?.fieldErrors.number ? <Form.Help color="danger">{action?.validationErrors?.fieldErrors.number.join(' ')}</Form.Help> : null}
				</Form.Field>
				<Form.Field>
					<Form.Label>Charge Code Name</Form.Label>
					<Form.Control>
						<Form.Input color={action?.validationErrors?.fieldErrors.name ? 'danger' : undefined} name="name"></Form.Input>
					</Form.Control>
					{action?.validationErrors?.fieldErrors.name ? <Form.Help color="danger">{action?.validationErrors?.fieldErrors.name.join(' ')}</Form.Help> : null}
				</Form.Field>
				<Form.Field>
					<Form.Label>Charge Code Description</Form.Label>
					<Form.Control>
						<Form.Input color={action?.validationErrors?.fieldErrors.description ? 'danger' : undefined} name="description"></Form.Input>
					</Form.Control>
					{action?.validationErrors?.fieldErrors.description ? <Form.Help color="danger">{action?.validationErrors?.fieldErrors.description.join(' ')}</Form.Help> : null}
				</Form.Field>
				<Button disabled={transition.state === 'submitting'} fullwidth rounded color="primary" type='submit'>{transition.state === 'submitting' ? 'Submitting' : 'Create Charge Code'}</Button>
			</RemixForm>
		</div>
	)
}