export async function handler(event: any) {
	console.log("request:", JSON.stringify(event, undefined, 2))
	return {
		statusCode: 200,
		headers: { "Content-Type": "text/plain" },
		body: `Hola CDK buenas tardes, has encontrado ${event.path}\n`,
	}
}
