import { spawn, type ChildProcess } from "child_process";
import * as readline from "readline";
import type { Readable } from "stream";
import * as fs from "fs";

let proc: ChildProcess | null = null;
let rl: readline.Interface | null = null;
let last: any = null;

export function debugEnv() {
  return process.env.VC_AMBRIDGE_EXE || null;
}

function exePath(): string {
  const p = process.env.VC_AMBRIDGE_EXE;
  if (!p || !fs.existsSync(p)) throw new Error("VC_AMBRIDGE_EXE 未設定/不正: " + (p ?? "(未設定)"));
  return p;
}

export function startBridge() {
  if (proc) return { ok: true, note: "already running" as const, pid: proc.pid };
  const exe = exePath();

  proc = spawn(exe, [], { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });

  const out = proc.stdout as Readable | null;
  if (!out) throw new Error("stdout not available");

  // 文字化け/分割対策
  (out as any).setEncoding?.("utf8");
  rl = readline.createInterface({ input: out, crlfDelay: Infinity, terminal: false });

  rl.on("line", (line: string) => {
    try { last = JSON.parse(line); } catch {}
  });

  proc.stderr?.on("data", d => console.error("[AMBridge][stderr]", String(d)));
  proc.on("error", e => console.error("[AMBridge] spawn error:", e));
  proc.on("exit", () => { try { rl?.close(); } catch {} rl = null; proc = null; });

  return { ok: true, pid: proc.pid, path: exe };
}

export function stopBridge() {
  try { rl?.close(); } catch {}
  rl = null;
  try { proc?.kill(); } catch {}
  proc = null;
  return { ok: true };
}

export function fetchCached() { return last; }

export function fetchOnce(timeoutMs = 5000): Promise<any> {
  if (!proc) startBridge();
  const p = proc; const r = rl;
  if (!p || !p.stdout || !r) throw new Error("readline/stdout not initialized");
  const out = p.stdout as Readable;

  return new Promise(resolve => {
    const done = (v: any) => { cleanup(); try { clearTimeout(t); } catch {} resolve(v); };
    const onLine = (line: string) => { try { done(JSON.parse(line)); } catch {} };
    const onData = (buf: Buffer | string) => {
      const s = typeof buf === "string" ? buf : buf.toString("utf8");
      for (const part of s.split(/\r?\n/)) {
        const p = part.trim();
        if (p.startsWith("{") && p.endsWith("}")) { try { done(JSON.parse(p)); return; } catch {} }
      }
    };
    const cleanup = () => { r.off("line", onLine); out.off("data", onData as any); };
    r.on("line", onLine);
    out.on("data", onData as any);
    const t = setTimeout(() => done({ timeout: true }), timeoutMs);
  });
}



//口リ巨乳