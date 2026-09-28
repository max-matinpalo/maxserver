import Ajv from "ajv";
import addFormats from "ajv-formats";
import { createError } from "./errors.js";

const PARTS = ["params", "querystring", "headers", "body"];


/**
 * Two ajv instances:
 * - request: same options as Fastify defaults, changes data (coerce, defaults, remove)
 * - response: never changes data, only reports
 */
export function createValidators(models = []) {
	const request = new Ajv({ coerceTypes: "array", useDefaults: true, removeAdditional: true, strict: false });
	const response = new Ajv({ allErrors: true, strict: false });

	for (const ajv of [request, response]) {
		addFormats(ajv);
		for (const model of models) ajv.addSchema(model);
	}

	return { request, response };
}


/**
 * Fastify shorthand: params / querystring / headers may list properties directly.
 */
function normalize(part, schema) {
	if (part !== "body" && !schema.type && !schema.properties && !schema.$ref)
		schema = { type: "object", properties: schema };
	return part === "headers" ? lowercaseHeaders(schema) : schema;
}


/**
 * Request header names are lowercase, so schema names must be too (as in Fastify).
 */
function lowercaseHeaders(schema) {
	const out = { ...schema };
	if (schema.properties)
		out.properties = Object.fromEntries(Object.entries(schema.properties).map(([k, v]) => [k.toLowerCase(), v]));
	if (schema.required) out.required = schema.required.map(k => k.toLowerCase());
	return out;
}


/**
 * Compiles all validators of one route once at startup.
 */
export function compileRoute(schema, ajvs, dev) {
	const out = { request: {}, response: {} };

	// 1. Request parts
	for (const part of PARTS) {
		const s = part === "querystring" ? (schema.querystring || schema.query) : schema[part];
		if (s) out.request[part] = ajvs.request.compile(normalize(part, s));
	}

	// 2. Response schemas, only needed in development
	if (dev && schema.response)
		for (const [status, s] of Object.entries(schema.response))
			out.response[status] = ajvs.response.compile(s);

	return out;
}


/**
 * Validates one request part, throws 400 like Fastify: "body/name must be string".
 */
export function validatePart(validate, part, data) {
	if (validate(data)) return;
	const e = validate.errors[0];
	throw createError(400, `${part}${e.instancePath} ${e.message}`);
}


/**
 * Development: checks the response against its schema, returns error text or null.
 */
export function checkResponse(validators, status, data) {
	const validate = validators[status] || validators[`${String(status)[0]}xx`] || validators.default;
	if (!validate) return null;

	const json = data === undefined ? undefined : JSON.parse(JSON.stringify(data));
	if (validate(json)) return null;

	return validate.errors.map(e => `response${e.instancePath} ${e.message}`).join(", ");
}
