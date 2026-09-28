export default {
	summary: "Test welcome",
	description: "Returns a friendly welcome message to verify the server is operational.",
	tags: ["Test"],
	response: {
		200: {
			type: "object",
			properties: {
				message: {
					type: "string",
					example: "Weclome to maxserver 😉 - Updated"
				}
			},
			required: ["message"]
		}
	}
};