import type { Project} from "@prisma/client";
import { UserRole } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "prisma/prisma.server";
import { authorizeOrRedirect } from "~/lib/auth";
import { getSessionFromCookieHeader } from "~/session";

export const loader: LoaderFunction = async ({request, params}) => {
	const session = await getSessionFromCookieHeader(request)
	await authorizeOrRedirect(session, UserRole.PROJECT_MANAGER, 'View a project')
	const project = await prisma.project.findUnique({where: {id: Number(params.projectId)}})
	if (!project) throw new Response("Not Found", {status: 404})
	return {project}
}

export default function ProjectView() {
	const loaderData = useLoaderData() as {project: Project} | undefined

	return (
		<div>
			<h1>Project: {loaderData?.project.number}</h1>
			<div>
				Name: {loaderData?.project.name}
			</div>
			<div>
				Number: {loaderData?.project.number}
			</div>
			<div>
				Description: {loaderData?.project.description}
			</div>
		</div>
	)
}