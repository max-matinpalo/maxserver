// GET /hello

export default async function handler(req, rep) {

	console.log("GET /hello");

	return { message: `Hello`, };
}