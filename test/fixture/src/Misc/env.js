// GET /env

export default async function (req, res) {
	return { nodeEnv: process.env.NODE_ENV, production: ENV.production };
}
