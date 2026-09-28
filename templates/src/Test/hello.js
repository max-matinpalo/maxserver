// POST /hello

export default async function handler(req, res) {

	console.log("POST /hello");

	return {
		message: `Hello ${req.body.name} again 🙋‍♂️`,
	};
}



// Try POST with and without name, to see how the schema works