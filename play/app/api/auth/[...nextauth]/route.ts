import type { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { realSignupEnabled } from "@/lib/beta/flag";

const off = () => new Response("Not found", { status: 404 });

export async function GET(request: NextRequest) {
  if (!realSignupEnabled()) return off();
  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  if (!realSignupEnabled()) return off();
  return handlers.POST(request);
}
