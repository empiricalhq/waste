import { pgEnum } from 'drizzle-orm/pg-core';

export const role = pgEnum('role', ['admin', 'supervisor', 'citizen', 'driver', 'user']);
