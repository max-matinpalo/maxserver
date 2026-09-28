/// <reference types="bun" />

/** maxserver options, plus any Bun.serve option (reusePort, idleTimeout, tls, maxRequestBodySize, ...) */
export interface MaxserverConfig {
	port?: number;
	secret?: string;
	/** "*" or comma separated origins */
	cors?: string;
	docs?: boolean;
	env?: string;
	static?: string;
	public?: boolean;
	openapiInfo?: { title: string; version: string;[key: string]: unknown };
	/** Extra Scalar configuration */
	scalar?: Record<string, unknown>;
	/** Passed to Bun.serve, default 1 MiB */
	maxRequestBodySize?: number;
	reusePort?: boolean;
	[key: string]: unknown;
}

export interface MaxserverServer {
	config: MaxserverConfig;
	/** Bun server, set after start() */
	bun: import("bun").Server | null;
	/** Server URL, set after start() */
	url: string | null;
	start(): Promise<MaxserverServer>;
	stop(): Promise<void>;
}

export interface RouteSchema {
	tags?: string[];
	summary?: string;
	description?: string;
	/** Requires a valid JWT */
	auth?: boolean;
	/** Sorts routes in docs within one folder, default 999 */
	order?: number;
	params?: object;
	querystring?: object;
	headers?: object;
	body?: object;
	response?: Record<string | number, object>;
	[key: string]: unknown;
}

/** Request passed to handlers: Bun request + parsed fields */
export interface MaxRequest extends Request {
	params: Record<string, any>;
	query: Record<string, any>;
	body: any;
	cookies: import("bun").CookieMap;
	/** Verified JWT payload on auth routes */
	user?: { sub?: string; userId?: string; userid?: string; id?: string;[key: string]: unknown };
	userId?: string | null;
}

/** Response helper passed to handlers */
export interface MaxResponse {
	statusCode: number;
	headers: Headers;
	status(code: number): MaxResponse;
	header(name: string, value: string): MaxResponse;
}

export type Handler = (req: MaxRequest, res: MaxResponse) => unknown | Promise<unknown>;

declare function maxserver(config?: MaxserverConfig): Promise<MaxserverServer>;
export default maxserver;

/** Called by the generated setup.js */
export function register(input: {
	routes: { method: string; path: string; file: string; handler: Handler; schema?: RouteSchema }[];
	models: { file: string; schema: object }[];
}): void;

/** Creates a HS256 JWT signed with the server secret */
export function signJwt(payload: Record<string, unknown>, options?: { expiresIn?: number | string }): string;

/** Verifies a HS256 JWT, throws 401 error if invalid or expired */
export function verifyJwt(token: string, secret?: string): Record<string, any>;

export function createError(code: number, message: string): Error & { statusCode: number };

declare global {
	var ENV: Record<string, string | undefined> & {
		development: boolean;
		production: boolean;
	};

	/**
	 * Creates an Error with an HTTP status code.
	 * Returned as JSON { statusCode, error, message }.
	 */
	var createError: (code: number, message: string) => Error & { statusCode: number };
}
