/** Minimal Garmin FIT reader for session / lap totals. Runs in the browser. */

interface FieldDef {
  num: number;
  size: number;
  base: number;
}

interface LocalMesg {
  architecture: 0 | 1;
  global: number;
  fields: FieldDef[];
}

const SESSION = 18;
const LAP = 19;

function u16(view: DataView, offset: number, be: boolean): number {
  return be ? view.getUint16(offset, false) : view.getUint16(offset, true);
}
function u32(view: DataView, offset: number, be: boolean): number {
  return be ? view.getUint32(offset, false) : view.getUint32(offset, true);
}

function readValue(view: DataView, offset: number, size: number, base: number, be: boolean): number | null {
  const type = base & 0x1f;
  try {
    if (type === 1 && size >= 1) {
      const v = view.getInt8(offset);
      return v === 0x7f ? null : v;
    }
    if ((type === 0 || type === 2 || type === 10 || type === 13) && size >= 1) {
      const v = view.getUint8(offset);
      return v === 0xff ? null : v;
    }
    if (type === 0x03 && size >= 2) {
      const v = be ? view.getInt16(offset, false) : view.getInt16(offset, true);
      return v === 0x7fff ? null : v;
    }
    if ((type === 4 || type === 0x0b) && size >= 2) {
      const v = u16(view, offset, be);
      return v === 0xffff ? null : v;
    }
    if (type === 5 && size >= 4) {
      const v = be ? view.getInt32(offset, false) : view.getInt32(offset, true);
      return v === 0x7fffffff ? null : v;
    }
    if ((type === 6 || type === 0x0c) && size >= 4) {
      const v = u32(view, offset, be);
      return v === 0xffffffff ? null : v;
    }
    if (type === 8 && size >= 4) {
      const v = be ? view.getFloat32(offset, false) : view.getFloat32(offset, true);
      return Number.isFinite(v) ? v : null;
    }
    if (type === 9 && size >= 8) {
      const v = be ? view.getFloat64(offset, false) : view.getFloat64(offset, true);
      return Number.isFinite(v) ? v : null;
    }
  } catch {
    return null;
  }
  return null;
}

export interface FitTotals {
  calories?: number;
  distanceMeters?: number;
  durationSeconds?: number;
  activeSeconds?: number;
}

export function parseFit(buffer: ArrayBuffer): FitTotals | null {
  const view = new DataView(buffer);
  if (view.byteLength < 14) return null;
  const headerSize = view.getUint8(0);
  if (headerSize < 12 || headerSize + 2 > view.byteLength) return null;
  const sig = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
  if (sig !== ".FIT") return null;
  const dataSize = view.getUint32(4, true);
  const dataEnd = Math.min(headerSize + dataSize, view.byteLength);
  const locals = new Map<number, LocalMesg>();
  const sessions: FitTotals[] = [];
  const laps: FitTotals[] = [];
  let offset = headerSize;

  function takeTotals(global: number, values: Map<number, number>) {
    const totals: FitTotals = {};
    const elapsed = values.get(7);
    const timer = values.get(8);
    if (typeof timer === "number") totals.activeSeconds = timer / 1000;
    if (typeof elapsed === "number") totals.durationSeconds = elapsed / 1000;
    else if (totals.activeSeconds) totals.durationSeconds = totals.activeSeconds;
    const distance = values.get(9);
    if (typeof distance === "number") totals.distanceMeters = distance / 100;
    const calories = values.get(11);
    if (typeof calories === "number") totals.calories = calories;
    if (global === SESSION) sessions.push(totals);
    if (global === LAP) laps.push(totals);
  }

  while (offset < dataEnd) {
    const header = view.getUint8(offset);
    offset += 1;
    if (header & 0x80) {
      // Compressed timestamp header — skip if we don't know the local definition size.
      const localNum = (header >> 5) & 0x03;
      const def = locals.get(localNum);
      if (!def) break;
      offset += def.fields.reduce((n, f) => n + f.size, 0);
      continue;
    }
    const localNum = header & 0x0f;
    const isDef = Boolean(header & 0x40);
    const hasDev = Boolean(header & 0x20);
    if (isDef) {
      if (offset + 5 > dataEnd) break;
      offset += 1; // reserved
      const architecture = view.getUint8(offset) ? 1 : 0;
      offset += 1;
      const global = u16(view, offset, architecture === 1);
      offset += 2;
      const fieldCount = view.getUint8(offset);
      offset += 1;
      const fields: FieldDef[] = [];
      for (let i = 0; i < fieldCount; i += 1) {
        if (offset + 3 > dataEnd) break;
        fields.push({
          num: view.getUint8(offset),
          size: view.getUint8(offset + 1),
          base: view.getUint8(offset + 2),
        });
        offset += 3;
      }
      if (hasDev) {
        if (offset >= dataEnd) break;
        const devCount = view.getUint8(offset);
        offset += 1;
        offset += devCount * 3;
      }
      locals.set(localNum, { architecture, global, fields });
      continue;
    }
    const def = locals.get(localNum);
    if (!def) break;
    const values = new Map<number, number>();
    for (const field of def.fields) {
      if (offset + field.size > dataEnd) {
        offset = dataEnd;
        break;
      }
      const value = readValue(view, offset, field.size, field.base, def.architecture === 1);
      if (value != null) values.set(field.num, value);
      offset += field.size;
    }
    if (def.global === SESSION || def.global === LAP) takeTotals(def.global, values);
  }

  if (sessions.length) {
    return sessions.reduce(mergeTotals, {});
  }
  if (laps.length) {
    return laps.reduce(mergeTotals, {});
  }
  return null;
}

function mergeTotals(acc: FitTotals, row: FitTotals): FitTotals {
  return {
    calories: (acc.calories ?? 0) + (row.calories ?? 0) || acc.calories,
    distanceMeters: (acc.distanceMeters ?? 0) + (row.distanceMeters ?? 0) || acc.distanceMeters,
    durationSeconds: (acc.durationSeconds ?? 0) + (row.durationSeconds ?? 0) || acc.durationSeconds,
    activeSeconds: (acc.activeSeconds ?? 0) + (row.activeSeconds ?? 0) || acc.activeSeconds,
  };
}
