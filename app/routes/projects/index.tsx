import type { Project} from "@prisma/client";
import { UserRole } from "@prisma/client";
import type { Request } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { prisma } from "prisma/prisma.server";
import { Button, Table } from "react-bulma-components";
import { authorizeOrRedirect } from "~/lib/auth";
import { getSessionFromCookieHeader } from "~/session";

const itemsPerPage = 20

export async function loader({request}: {request: Request}) {
	const session = await getSessionFromCookieHeader(request)
	await authorizeOrRedirect(session, UserRole.PROJECT_MANAGER, 'View created projects')
	const url = new URL(request.url);
  	const page = url.searchParams.get("page") || 1;
	console.log(page)
	const pageNumber = Number(page)
	// TODO: Need pagination
	const projects = await prisma.project.findMany({skip: itemsPerPage * (pageNumber - 1), take: itemsPerPage})
	return {projects}
}

export default function ProjectIndexPage() {
	const loader = useLoaderData() as undefined | {projects: Project[]}

	return (
		<Table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Number</th>
					<th>Description</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{loader?.projects?.map((project: Project, i: number) => (
					<tr key={i}>
						<td>{project.name}</td>
						<td>{project.number}</td>
						<td>{project.description}</td>
						<td>
							<Link to={`/projects/${project.id}`}><Button>Go To Project</Button></Link>
						</td>
					</tr>
				))}
			</tbody>
		</Table>
	)
}