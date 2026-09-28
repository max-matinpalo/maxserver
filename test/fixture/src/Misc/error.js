// GET /error

export default async function (req, res) {
	throw createError(409, "Conflict here");
}
