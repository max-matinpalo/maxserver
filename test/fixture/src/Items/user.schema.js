export default {
	tags: ["Users"],
	summary: "Create user",
	body: { $ref: "User" },
	response: { 200: { $ref: "User" } },
};
