import type { ChargeCode, Project, ProjectPersonnel, User} from "@prisma/client";
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
	const project = await prisma.project.findUnique({where: {id: Number(params.projectId)}, include: {chargeCodes: true, assignedPersonnel: {include: {assignedUser: true}}}})
	if (!project) throw new Response("Not Found", {status: 404})
	return {project}
}

export default function ProjectView() {
	const loaderData = useLoaderData() as {project: Project & {chargeCodes: ChargeCode[], assignedPersonnel: (ProjectPersonnel & {assignedUser: User})[]}}

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
			<h3>Assigned Personnel To Project</h3>
			<AssignedPersonnelTable assignedPersonnel={loaderData.project.assignedPersonnel} />
		</div>
	)
}

const ChargeCodeTable: React.FC<{chargeCodes: ChargeCode[]}> = ({chargeCodes}) => (
	<Table>
		<thead>
			<tr>
				<td>Number</td>
				<td>Name</td>
				<td>Description</td>
			</tr>
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

const AssignedPersonnelTable: React.FC<{assignedPersonnel: (ProjectPersonnel & {assignedUser: User})[]}> = ({assignedPersonnel}) => (
	<Table>
		<thead>
			<tr>
				<td>Name</td>
				<td>Assigned At</td>
			</tr>
		</thead>
		<tbody>
			{assignedPersonnel.map((val, i) => (
				<tr key={i}>
					<td>{val.assignedUser.name}</td>
					<td>{val.assignedAt}</td>
				</tr>	
			))}
		</tbody>
	</Table>
)