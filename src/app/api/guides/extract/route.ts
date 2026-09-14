import { NextRequest, NextResponse } from "next/server";
import { extractGuideRoadmap } from "@/src/lib/backend/sync";
import { requireAuth } from "@/src/lib/backend/backlog/infrastructure";

export async function POST(req: NextRequest) {
  // Auth guard: only authenticated users can trigger guide extraction
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  let body: { url?: string };
  try {
    body = (await req.json()) as { url?: string };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const rawUrl = body?.url?.trim();
  if (!rawUrl) {
    return NextResponse.json(
      { error: "Guide URL is required" },
      { status: 400 },
    );
  }

  const result = await extractGuideRoadmap(rawUrl);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.message },
      { status: 422 },
    );
  }

  return NextResponse.json({ roadmap: result.value });
}
