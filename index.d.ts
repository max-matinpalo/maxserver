import "fastify";
import "@fastify/jwt";

declare function maxserver(...args: any[]): any;
export default maxserver;

declare global {
	var oid: (id: string) => import("mongodb").ObjectId;
	var db: import("mongodb").Db;
}

declare module "fastify" {
	interface FastifyInstance {
		maxserver: {
			env?: string;
			cors?: string | boolean | RegExp | Array<string | RegExp>;
			secret?: string;
			mongodb?: string;
			static?: string;
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