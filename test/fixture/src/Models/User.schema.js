export default {
	$id: "User",
	type: "object",
	additionalProperties: false,
	required: ["email"],
	properties: {
		id: { type: "string" },
		email: { type: "string", format: "email" },
	},
};
