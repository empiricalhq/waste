"use server";

import { db } from "@/db";
import { user, UserType } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function getMe(): Promise<UserType | null | undefined> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return null;
  }

  const me = (
    await db.select().from(user).where(eq(user.id, session.user.id))
  )[0];
  if (!me) {
    return null;
  }
  if (me.role !== "admin" && me.role !== "supervisor") {
    return null;
  }

  return me;
}
