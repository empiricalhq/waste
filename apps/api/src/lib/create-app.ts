import { Hono } from 'hono';
import type { AuthType } from '@/lib/auth';

export function createRouter() {
  return new Hono<AuthType>({
    strict: false,
  });
}

export default function createApp() {
  return new Hono<AuthType>({
    strict: false,
  });
}
