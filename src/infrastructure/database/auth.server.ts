import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { createServerClient } from "./supabase.client";

export async function requireAuth(req: NextRequest): Promise<
  | { ok: true; client: SupabaseClient; user: User }
  | { ok: false; response: NextResponse }
> {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? null;
  const client = createServerClient(token);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { ok: true, client, user };
}
