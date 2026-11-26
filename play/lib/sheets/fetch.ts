import { SHEET_REVALIDATE_SECONDS, parseSignupSheet, sheetExportUrl, type ParsedSignupSheet } from "./parse";

export { SHEET_REVALIDATE_SECONDS, sheetEditUrl, sheetExportUrl } from "./parse";
export type { ParsedSignupSheet } from "./parse";

export interface SheetSnapshot extends ParsedSignupSheet {
  syncedAt: string;
  editUrl: string;
}

export async function fetchSignupSheet(sheetId: string, gid = "0"): Promise<SheetSnapshot> {
  const url = sheetExportUrl(sheetId, gid);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "MaletasPlay (maletasunited@gmail.com)",
        Accept: "text/csv, text/plain;q=0.9, */*;q=0.1",
      },
      next: { revalidate: SHEET_REVALIDATE_SECONDS },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`Sheet export failed (${res.status})`);
    const type = res.headers.get("content-type") ?? "";
    const body = await res.text();
    if (/html/i.test(type) || /^\s*<!doctype/i.test(body) || /^\s*<html/i.test(body)) {
      throw new Error("Sheet export did not return CSV");
    }
    const parsed = parseSignupSheet(body);
    return {
      ...parsed,
      syncedAt: new Date().toISOString(),
      editUrl: `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/edit`,
    };
  } finally {
    clearTimeout(t);
  }
}
