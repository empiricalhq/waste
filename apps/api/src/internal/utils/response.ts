import type { Context } from 'hono';
import { type ContentfulStatusCode, HttpStatus } from './http-status';

export function success<T>(c: Context, data: T, statusCode: ContentfulStatusCode = HttpStatus.OK) {
  return c.json({ data }, statusCode);
}

export function created<T>(c: Context, data: T) {
  return c.json({ data }, HttpStatus.CREATED);
}

export function noContent(c: Context) {
  return c.body(null, HttpStatus.NO_CONTENT);
}

export function error(c: Context, error: string, statusCode: ContentfulStatusCode = HttpStatus.INTERNAL_SERVER_ERROR) {
  return c.json({ error }, statusCode);
}

export function validationError(c: Context, formErrors: string[] = [], fieldErrors: Record<string, string[]> = {}) {
  return c.json({ error: 'Validation failed', formErrors, fieldErrors }, HttpStatus.BAD_REQUEST);
}

export function notFound(c: Context, message = 'Not found') {
  return c.json({ error: message }, HttpStatus.NOT_FOUND);
}

export function unauthorized(c: Context, message = 'Unauthorized') {
  return c.json({ error: message }, HttpStatus.UNAUTHORIZED);
}

export function forbidden(c: Context, message = 'Forbidden') {
  return c.json({ error: message }, HttpStatus.FORBIDDEN);
}

export function conflict(c: Context, message = 'Conflict') {
  return c.json({ error: message }, HttpStatus.CONFLICT);
}
