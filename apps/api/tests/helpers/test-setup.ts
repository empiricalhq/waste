import { db } from './db.ts';
import { auth } from './auth.ts';

export async function setup() {
  await db.clean();
  auth.clear();
}
