import { NextResponse } from "next/server";
import crypto from "crypto";

const VT_BASE = "https://www.virustotal.com/api/v3";

async function vtGet(path: string) {
  const res = await fetch(VT_BASE + path, { headers: { "x-apikey": process.env.VT_API_KEY || "" } });
  return res;
}

async function vtPostFile(file: { name: string; buffer: Buffer; type?: string }) {
  const fd = new FormData();
  // @ts-ignore - Blob is available in Node 18+
  fd.append("file", new Blob([file.buffer], { type: file.type || "application/octet-stream" }), file.name || "upload.bin");
  const res = await fetch(VT_BASE + "/files", { method: "POST", headers: { "x-apikey": process.env.VT_API_KEY || "" }, body: fd });
  return res;
}

function isHash(s: string): boolean {
  return /^([a-fA-F0-9]{32}|[a-fA-F0-9]{40}|[a-fA-F0-9]{64})$/.test(s || "");
}

export async function POST(req: Request) {
  if (!process.env.VT_API_KEY) return NextResponse.json({ error: "Missing VT_API_KEY. Add it to .env.local" }, { status: 500 });

  const ctype = req.headers.get("content-type") || "";
  if (ctype.includes("application/json")) {
    // Hash-only mode
    const { hash } = await req.json();
    if (!isHash(hash || "")) return NextResponse.json({ error: "Provide a valid MD5/SHA1/SHA256 hash" }, { status: 400 });
    const res = await vtGet(`/files/${hash}`);
    if (!res.ok) return NextResponse.json({ error: `VT query failed: ${res.status} ${await res.text()}` }, { status: 500 });
    const j = await res.json();
    const attrs = j?.data?.attributes || {};
    const stats = attrs?.last_analysis_stats || {};
    const results = attrs?.last_analysis_results || {};
    const flags: { engine: string; category: string; result?: string }[] = [];
    for (const [engine, info] of Object.entries(results as any)) {
      const i:any = info;
      if (i?.category && i.category !== "undetected" && i.category !== "harmless") {
        flags.push({ engine, category: i.category, result: i.result });
      }
    }
    const permalink = j?.data?.links?.self || `https://www.virustotal.com/gui/file/${j?.data?.id || ""}`;
    return NextResponse.json({ stats, flags, sha256: j?.data?.id, permalink });
  }

  // File upload mode
  const form = await req.formData();
  const f = form.get("file");
  if (!f || !(f as any).arrayBuffer) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const file = f as File;
  const maxBytes = 32 * 1024 * 1024; // 32MB
  if (file.size > maxBytes) return NextResponse.json({ error: "File too large for free VirusTotal API (max 32MB)" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const sha256 = crypto.createHash("sha256").update(buf).digest("hex");

  // 1) Try to fetch existing report
  let res = await vtGet(`/files/${sha256}`);
  if (res.status === 404) {
    // 2) Upload file for analysis
    res = await vtPostFile({ name: file.name || "upload.bin", buffer: buf, type: file.type || "application/octet-stream" });
    if (!res.ok) return NextResponse.json({ error: `VT upload failed: ${res.status} ${await res.text()}` }, { status: 500 });

    const data = await res.json();
    const analysisId = data?.data?.id;
    if (!analysisId) return NextResponse.json({ error: "No analysis id from VT" }, { status: 500 });

    // 3) Poll analysis status
    const deadline = Date.now() + 30000; // 30s
    let status = "queued";
    let fileHash = sha256;
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 2000));
      const ares = await vtGet(`/analyses/${analysisId}`);
      if (!ares.ok) break;
      const aj = await ares.json();
      status = aj?.data?.attributes?.status;
      fileHash = aj?.meta?.file_info?.sha256 || fileHash;
      if (status === "completed") break;
    }
    // Re-fetch final file report
    res = await vtGet(`/files/${fileHash}`);
  }

  if (!res.ok) return NextResponse.json({ error: `VT query failed: ${res.status} ${await res.text()}` }, { status: 500 });

  const j = await res.json();
  const attrs = j?.data?.attributes || {};
  const stats = attrs?.last_analysis_stats || {};
  const results = attrs?.last_analysis_results || {};
  const flags: { engine: string; category: string; result?: string }[] = [];
  for (const [engine, info] of Object.entries(results as any)) {
    const i:any = info;
    if (i?.category && i.category !== "undetected" && i.category !== "harmless") {
      flags.push({ engine, category: i.category, result: i.result });
    }
  }
  const permalink = j?.data?.links?.self || `https://www.virustotal.com/gui/file/${j?.data?.id || ""}`;
  return NextResponse.json({ stats, flags, sha256, permalink });
}
