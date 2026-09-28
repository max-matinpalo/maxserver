// GET /crash

export default async function (req, res) {
	throw new Error("secret detail");
}
