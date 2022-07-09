import type { ChargeCode, Project} from "@prisma/client";
import { UserRole } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "prisma/prisma.server";
import { Table } from "react-bulma-components";
import { authorizeOrRedirect } from "~/lib/auth";
import { getSessionFromCookieHeader } from "~/session";

export const loader: LoaderFunction = async ({request, params}) => {
	const session = await getSessionFromCookieHeader(request)
	await authorizeOrRedirect(session, UserRole.PROJECT_MANAGER, 'View a project')
	const project = await prisma.project.findUnique({where: {id: Number(params.projectId)}, include: {chargeCodes: true}})
	if (!project) throw new Response("Not Found", {status: 404})
	return {project}
}

export default function ProjectView() {
	const loaderData = useLoaderData() as {project: Project & {chargeCodes: ChargeCode[]}}

	return (
		<div>
			<h1>Project: {loaderData.project.number}</h1>
			<div>
				Name: {loaderData.project.name}
			</div>
			<div>
				Number: {loaderData.project.number}
			</div>
			<div>
				Description: {loaderData.project.description}
			</div>
			<h3>Charge Codes</h3>
			<ChargeCodeTable chargeCodes={loaderData.project.chargeCodes} />
		</div>
	)
}

const ChargeCodeTable: React.FC<{chargeCodes: ChargeCode[]}> = ({chargeCodes}) => (
	<Table>
		<thead>
			<td>Number</td>
			<td>Name</td>
			<td>Description</td>
		</thead>
		<tbody>
			{chargeCodes.map((code, i) => (
				<tr key={i}>
					<td>{code.number}</td>
					<td>{code.name}</td>
					<td>{code.description}</td>
				</tr>
			))}
		</tbody>
	</Table>
)