export default {
	$id: "User",
	summary: "User Profile",
	description: "Internal user profile including team memberships.",
	tags: ["User"],
	auth: true,
	type: "object",
	additionalProperties: false,
	properties: {
		id: { type: "string" },
		email: { type: "string" },
	}
};
