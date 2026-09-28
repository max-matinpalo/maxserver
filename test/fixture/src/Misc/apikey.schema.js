export default {
	summary: "Header validation with mixed case names",
	headers: { type: "object", required: ["X-Api-Key"], properties: { "X-Api-Key": { type: "string" } } },
};
