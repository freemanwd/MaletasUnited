import { NextResponse } from "next/server";
import { fetchSignupSheet, SHEET_REVALIDATE_SECONDS } from "@/lib/sheets/fetch";

const SHEET_ID_RE = /^[a-zA-Z0-9-_]{20,80}$/;
const GID_RE = /^[0-9]+$/;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sheetId = (url.searchParams.get("sheetId") ?? "").trim();
  const gid = (url.searchParams.get("gid") ?? "0").trim() || "0";
  if (!SHEET_ID_RE.test(sheetId) || !GID_RE.test(gid)) {
    return NextResponse.json({ error: "Invalid sheet" }, { status: 400 });
  }
  try {
    const snapshot = await fetchSignupSheet(sheetId, gid);
    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": `public, s-maxage=${SHEET_REVALIDATE_SECONDS}, stale-while-revalidate=60`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not load the sign-up sheet." }, { status: 502 });
  }
}
