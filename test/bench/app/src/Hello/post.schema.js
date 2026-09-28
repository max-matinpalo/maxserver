export default {
	body: {
		type: "object",
		properties: {
			name: { type: "string" },
			age: { type: "integer" },
		},
		required: ["name"],
	},
	response: {
		200: {
			type: "object",
			properties: { message: { type: "string" } },
		},
	},
};
