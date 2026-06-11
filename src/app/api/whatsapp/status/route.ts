import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getOpenWaStatus } from "@/lib/openwa";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const status = await getOpenWaStatus();
  return NextResponse.json(status);
}
