export function toObjectLiteral(formData: FormData) {
	const obj: {[key: string]: any} = {}
	formData.forEach((val, key) => {
		obj[key] = val
	})
	return obj
}