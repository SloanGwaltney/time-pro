import { json } from "@remix-run/node"
import type { z, ZodRawShape } from "zod"

export function toObjectLiteral(formData: FormData) {
	const obj: {[key: string]: any} = {}
	formData.forEach((val, key) => {
		obj[key] = val
	})
	return obj
}

export async function parseFormData(request: Request) {
	return toObjectLiteral(await request.formData())
}

export async function validateBodyOrReturnResponse<T extends ZodRawShape>(data: any, schema: z.ZodObject<T>): Promise<{data: { [k in keyof z.objectUtil.addQuestionMarks<{ [k in keyof T]: T[k]["_output"]; }>]: z.objectUtil.addQuestionMarks<{ [k in keyof T]: T[k]["_output"]; }>[k]; }}> {
	const parsedBody = await schema.safeParseAsync(data)
	if (!parsedBody.success) throw json({validationErrors: parsedBody.error.flatten()})
	return ({data: parsedBody.data})
}