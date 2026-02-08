// POST /hello

export default async function handler(req, rep) {

	console.log("POST /hello");

	return {
		message: `Hello ${req.body.name}`,
		user: req.user || null,
	};
}