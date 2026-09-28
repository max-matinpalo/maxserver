export default {
	summary: "Response does not match schema",
	response: { 200: { type: "object", properties: { count: { type: "integer" } } } },
};
