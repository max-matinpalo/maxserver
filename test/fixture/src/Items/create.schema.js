export default {
	tags: ["Items"],
	summary: "Create item",
	body: {
		type: "object",
		additionalProperties: false,
		required: ["name"],
		properties: {
			name: { type: "string" },
			email: { type: "string", format: "email" },
			when: { type: "string", format: "date-time" },
		},
	},
	response: {
		201: { type: "object", properties: { name: { type: "string" } } },
	},
};
