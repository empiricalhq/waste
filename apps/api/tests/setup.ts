import { beforeEach } from 'bun:test';
import { db } from './db.ts';
import { auth } from './auth.ts';

beforeEach(async () => {
  await db.clean();
  auth.clear();
});
