import "fastify";
import "@fastify/jwt";

declare function maxserver(...args: any[]): any;
export default maxserver;

declare global {

	var global: typeof globalThis;

	var ENV: NodeJS.ProcessEnv & {
		development: boolean;
		production: boolean;
	};

	/** Casts a string ID to a MongoDB ObjectId using the global helper. */
	var oid: (id?: string) => import("mongodb").ObjectId;

	/** Access to the global MongoDB database instance. */
	var db: import("mongodb").Db;

	/**
	 * Creates an Error object with an attached HTTP status code.
	 * Fastify catches this to return a structured JSON response.
	 * @param code The HTTP status code (e.g., 400, 401, 403, 404).
	 * @param message The specific failure reason returned in the JSON body.
	 */
	var createError: (code: number, message: string) => Error;
}

declare module "fastify" {
	interface FastifyInstance {
		maxserver: {
			env?: string;
			cors?: string | boolean | RegExp | Array<string | RegExp>;
			secret?: string;
			mongodb?: string;
			static?: string;
			errorLogger?: boolean;
		};
	}

	interface FastifyRequest {
		userId: string | null;
	}

	interface FastifyContextConfig {
		auth?: boolean;
	}

	interface RouteShorthandOptions {
		config?: FastifyContextConfig;
	}
}

declare module "@fastify/jwt" {
	interface FastifyJWT {
		user: {
			sub?: string;
			userId?: string;
			userid?: string;
			id?: string;
			[key: string]: unknown;
		};
	}
}

export { };