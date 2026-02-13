export default {
	summary: "Test get welcome",
	description: "Returns a friendly welcome message to verify the server is operational.",
	tags: ["Tests"],
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