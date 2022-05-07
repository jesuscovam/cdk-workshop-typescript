import { DynamoDB, Lambda } from "aws-sdk"
import { UpdateItemInput } from "aws-sdk/clients/dynamodb"

const HEADERS = { "Content-Type": "text/plain" } as const

export async function handler(event: any) {
	console.log("request", JSON.stringify(event, undefined, 2))
	event.event
	const dynamo = new DynamoDB()
	const lambda = new Lambda()

	const { HITS_TABLE_NAME, DOWNSTREAM_FUNCTION_NAME } = process.env

	if (!HITS_TABLE_NAME || !DOWNSTREAM_FUNCTION_NAME) {
		return {
			statusCode: 500,
			headers: HEADERS,
			body: "Hace falta acceso a variable de entorno :(",
		}
	}

	const input: UpdateItemInput = {
		TableName: HITS_TABLE_NAME,
		Key: { path: { S: event.path } },
		UpdateExpression: "ADD hits :incr",
		ExpressionAttributeValues: { ":incr": { N: "1" } },
	}

	try {
		await dynamo.updateItem(input).promise()
		const resp = await lambda
			.invoke({
				FunctionName: DOWNSTREAM_FUNCTION_NAME,
				Payload: JSON.stringify(event),
			})
			.promise()

		console.log("downstream response: ", JSON.stringify(resp, undefined, 2))

		return JSON.parse(resp.Payload as unknown as string)
	} catch (error) {
		console.error("Error en hitcounter lambda", { error })
		return {
			statusCode: 500,
			headers: HEADERS,
			body: JSON.stringify(error, undefined, 2),
		}
	}
}
