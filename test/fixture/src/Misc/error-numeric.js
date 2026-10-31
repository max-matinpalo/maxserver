// GET /error-numeric

export default async function (req, res) {
	const err = createError(409, "Numeric code");
	err.code = 23505;
	err.vars = new Map([["a", 1]]);
	throw err;
}
