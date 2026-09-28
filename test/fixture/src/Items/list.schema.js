export default {
	tags: ["Items"],
	summary: "List items",
	order: 1,
	querystring: {
		type: "object",
		required: ["q"],
		properties: {
			q: { type: "string" },
			limit: { type: "integer", default: 10 },
			tags: { type: "array", items: { type: "string" } },
			owner: { $ref: "User#/properties/email" },
		},
	},
};
