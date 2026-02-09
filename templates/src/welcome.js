// GET /welcome

export default async function handler(req, rep) {

	console.log("GET /welcome");
	return {
		message: "Weclome to maxserver 😉",
	};

}


// Remember the very first line of the file must be the ROUTE COMMENT
// other imports if needed after it