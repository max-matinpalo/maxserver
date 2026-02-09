// POST /hello

export default async function handler(req, rep) {

	console.log("POST /hello");

	return {
		message: `Hello ${req.body.name} 🙋‍♂️`,
	};
}



// Try POST with and without name, to see how the schema works