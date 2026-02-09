export default {

	// These 3 fields are for the documentation
	// Not must have, but your auto generated documentation will be great

	tags: ["Test"],
	summary: "Post hello",
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
			},
		},
	},
};

// Hint - You don't need to write these ourself
// Just ask chat gpt or gemini to generate them
// In docs you will find little instruction for it