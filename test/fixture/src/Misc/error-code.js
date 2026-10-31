// GET /error-code

export default async function (req, res) {
	const err = createError(422, "Too many items");
	err.code = "ITEMS_LIMIT";
	err.vars = { max: 5 };
	err.secret = "internal";
	throw err;
}
