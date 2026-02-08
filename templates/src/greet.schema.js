export const schema = {
	tags: ["Test"],
	summary: "Create greeting",
	description: "Accepts a name and returns a greeting.",

	body: {
		type: "object",
		required: ["name"],
		properties: {
			name: {
				type: "string",
				example: "Max",
			},
		},
	},

	response: {
		200: {
			type: "object",
			properties: {
				message: {
					type: "string",
					example: "Hello Max",
				},
				user: {
					type: "object",
					example: {
						userId: "64f1c2e9b1a2c3d4e5f67890",
					},
				},
			},
		},
	},
};
