export default {
	summary: "Test post hello",
	description: "Receives a name in the body and returns a personalized hello message.",
	tags: ["Tests"],
	body: {
		type: "object",
		properties: {
			name: {
				type: "string",
				example: "John Doe"
			}
		},
		required: ["name"]
	},
	response: {
		200: {
			type: "object",
			properties: {
				message: {
					type: "string",
					example: "Hello John Doe again 🙋‍♂️"
				}
			},
			required: ["message"]
		}
	}
};