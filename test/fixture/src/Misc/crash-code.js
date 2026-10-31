// GET /crash-code

export default async function (req, res) {
	const err = new Error("db down");
	err.code = "ECONNREFUSED";
	throw err;
}
