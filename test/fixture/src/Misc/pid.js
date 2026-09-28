// GET /pid

export default async function (req, res) {
	return { pid: process.pid };
}
