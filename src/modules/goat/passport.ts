/**
 * Generates a printable PDF "Digital Passport" for a goat on-device
 * (expo-print) and opens the share sheet (expo-sharing). No backend needed.
 */
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

type WeightEntry = { weightKg: number; recordedAt: string };
type PassportGoat = {
  goatId: string;
  name?: string;
  earTagNo?: string;
  breed?: string;
  color?: string;
  gender?: string;
  dateOfBirth?: string | null;
  healthStatus?: string;
  latestWeight?: number | null;
  weightHistory?: WeightEntry[];
  ownership?: { type?: string; clientName?: string };
};

function ageFrom(dob?: string | null) {
  if (!dob) return "—";
  const months = Math.max(
    0,
    Math.round(
      (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.4),
    ),
  );
  if (months < 12) return `${months} mo`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m ? `${y}y ${m}m` : `${y}y`;
}

const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(d);
  }
};

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>]/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;",
  );

function buildHtml(
  goat: PassportGoat,
  photoUrl?: string,
  qrDataUrl?: string,
): string {
  const title = esc(goat.name || goat.goatId);
  const owner =
    goat.ownership?.type === "client"
      ? `Ad Pali — ${esc(goat.ownership?.clientName || "Client")}`
      : "Farm-owned";
  const rows: [string, string][] = [
    ["Goat ID", esc(goat.goatId)],
    ["Ear tag", esc(goat.earTagNo || "—")],
    ["Breed", esc(goat.breed || "—")],
    ["Colour", esc(goat.color || "—")],
    ["Gender", esc(goat.gender || "—")],
    ["Date of birth", fmtDate(goat.dateOfBirth)],
    ["Age", ageFrom(goat.dateOfBirth)],
    [
      "Current weight",
      goat.latestWeight != null ? `${goat.latestWeight} kg` : "—",
    ],
    ["Health", esc((goat.healthStatus || "—").replace("_", " "))],
    ["Ownership", owner],
  ];
  const detailRows = rows
    .map(([k, v]) => `<tr><td class="k">${k}</td><td class="v">${v}</td></tr>`)
    .join("");

  const history = (goat.weightHistory || [])
    .slice()
    .reverse()
    .map(
      (w) =>
        `<tr><td>${fmtDate(w.recordedAt)}</td><td class="r">${w.weightKg} kg</td></tr>`,
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; }
    body { margin: 0; color: #1A1A1C; }
    .page { padding: 36px 40px; }
    .top { display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 3px solid #1A1A1C; padding-bottom: 14px; }
    .brand { font-size: 13px; letter-spacing: 2px; font-weight: 800; text-transform: uppercase; color:#5E5E64; }
    .doc { font-size: 26px; font-weight: 800; margin-top: 2px; }
    .hero { display:flex; gap:20px; margin-top: 22px; }
    .photo { width: 200px; height: 240px; border:3px solid #1A1A1C; border-radius:10px; object-fit:cover; background:#EEE; }
    .title { font-size: 30px; font-weight: 800; margin:0; }
    .sub { color:#5E5E64; margin-top:4px; font-size: 14px; }
    .chips { margin-top:12px; }
    .chip { display:inline-block; border:2px solid #1A1A1C; border-radius:6px; padding:4px 10px; font-size:12px; font-weight:700; margin-right:8px; }
    .clay { background:#A2522D; color:#fff; }
    table { width:100%; border-collapse: collapse; margin-top: 8px; }
    .grid { margin-top: 26px; display:flex; gap: 28px; }
    .col { flex:1; }
    h3 { font-size: 13px; letter-spacing:1px; text-transform:uppercase; color:#5E5E64; margin:0 0 8px; }
    td { padding: 7px 0; font-size: 14px; border-bottom: 1px solid #EAE6DC; }
    td.k { color:#5E5E64; } td.v { text-align:right; font-weight:600; }
    td.r { text-align:right; font-weight:600; }
    .qr { width: 120px; height:120px; border:2px solid #1A1A1C; border-radius:8px; }
    .foot { margin-top: 30px; color:#9A9AA0; font-size: 11px; text-align:center; border-top:1px solid #EAE6DC; padding-top:12px; }
  </style></head>
  <body><div class="page">
    <div class="top">
      <div><div class="brand">GoatKeep</div><div class="doc">Digital Passport</div></div>
      ${qrDataUrl ? `<img class="qr" src="${qrDataUrl}" />` : ""}
    </div>
    <div class="hero">
      ${photoUrl ? `<img class="photo" src="${esc(photoUrl)}" />` : ""}
      <div>
        <h1 class="title">${title}</h1>
        <div class="sub">${esc(goat.goatId)}${goat.earTagNo ? ` · Tag ${esc(goat.earTagNo)}` : ""}</div>
        <div class="chips">
          <span class="chip">${owner}</span>
          <span class="chip clay">${esc((goat.healthStatus || "").replace("_", " ") || "—")}</span>
        </div>
      </div>
    </div>
    <div class="grid">
      <div class="col"><h3>Details</h3><table>${detailRows}</table></div>
      <div class="col"><h3>Weight history</h3><table>${history || "<tr><td>No records</td></tr>"}</table></div>
    </div>
    <div class="foot">Generated by GoatKeep · ${fmtDate(new Date().toISOString())}</div>
  </div></body></html>`;
}

export async function exportGoatPassport(args: {
  goat: PassportGoat;
  photoUrl?: string;
  qrDataUrl?: string;
}) {
  const html = buildHtml(args.goat, args.photoUrl, args.qrDataUrl);
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `${args.goat.name || args.goat.goatId} — Passport`,
      UTI: "com.adobe.pdf",
    });
  }
  return uri;
}
