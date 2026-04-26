import { useState, useRef, useEffect } from "react";

/* ─── FONTS & ANIMATIONS ─── */
const loadFonts = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("k404-fonts")) return;
  const link = document.createElement("link");
  link.id = "k404-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap";
  document.head.appendChild(link);
  if (document.getElementById("k404-css")) return;
  const style = document.createElement("style");
  style.id = "k404-css";
  style.textContent = `
    @keyframes k404fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes k404fadeOnly { from { opacity:0; } to { opacity:1; } }
    @keyframes k404pulse { 0%,100% { box-shadow:0 0 12px rgba(200,164,93,0.06); } 50% { box-shadow:0 0 24px rgba(200,164,93,0.18); } }
    @keyframes k404glow { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
    @keyframes k404scanline { 0% { transform:translateY(-100%); } 100% { transform:translateY(100vh); } }
    @keyframes k404slideIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes k404borderGlow { 0%,100% { border-color:rgba(200,164,93,0.25); } 50% { border-color:rgba(200,164,93,0.55); } }
    @keyframes k404shake { 0%,100% { transform:translateX(0); } 20% { transform:translateX(-4px); } 40% { transform:translateX(4px); } 60% { transform:translateX(-2px); } 80% { transform:translateX(2px); } }
    @keyframes k404successFlash { 0% { background:rgba(111,143,114,0.25); } 100% { background:rgba(111,143,114,0.08); } }
    .k404-card-enter { animation:k404fadeIn 0.4s ease-out both; }
    .k404-doc-enter { animation:k404slideIn 0.5s ease-out both; }
    .k404-fade { animation:k404fadeOnly 0.6s ease-out both; }
    .k404-pulse { animation:k404pulse 3s ease-in-out infinite; }
    .k404-glow { animation:k404glow 2s ease-in-out infinite; }
    .k404-border-glow { animation:k404borderGlow 2.5s ease-in-out infinite; }
    .k404-shake { animation:k404shake 0.4s ease-out; }
    .k404-success { animation:k404successFlash 1.5s ease-out; }
    .k404-stagger-1 { animation:k404fadeIn 0.4s ease-out 0.05s both; }
    .k404-stagger-2 { animation:k404fadeIn 0.4s ease-out 0.1s both; }
    .k404-stagger-3 { animation:k404fadeIn 0.4s ease-out 0.15s both; }
    .k404-stagger-4 { animation:k404fadeIn 0.4s ease-out 0.2s both; }
    .k404-stagger-5 { animation:k404fadeIn 0.4s ease-out 0.25s both; }
    .k404-stagger-6 { animation:k404fadeIn 0.4s ease-out 0.3s both; }
    .k404-evidence-btn { cursor:pointer; transition:all 0.25s ease; position:relative; }
    .k404-evidence-btn:hover { background:rgba(200,164,93,0.06) !important; }
  `;
  document.head.appendChild(style);
};

/* ─── PALETTE ─── */
const C = {
  gold: "#C8A45D", goldSoft: "rgba(200,164,93,0.14)", goldBorder: "rgba(200,164,93,0.35)",
  goldGlow: "rgba(200,164,93,0.10)", red: "#9F4F46", redSoft: "rgba(159,79,70,0.12)",
  green: "#6F8F72", greenSoft: "rgba(111,143,114,0.12)",
  bg: "#0E0D0B", card: "#1A1714", panel: "#201C16",
  bdr: "rgba(200,164,93,0.18)", bdrStrong: "rgba(200,164,93,0.35)",
  txt: "#F0E8DC", muted: "#CCC4B6", dim: "#B0A898",
  sans: "'IBM Plex Sans','Helvetica Neue',sans-serif",
  mono: "'IBM Plex Mono','Courier New',monospace",
  serif: "'Georgia',serif",
};

/* ─── EVIDENCE LABELS ─── */
const EV_LABELS = {
  invoice_ref: "Fakturanr: NCL-88421",
  invoice_po: "PO-referens: PO-7749-A",
  invoice_urgent: "Kundreferens: URGENT-LINE-7",
  carrier_delivered: "Transportstatus: Levererat till 3PL",
  decl_frigjord: "Deklarationsstatus: Frigjord",
  wms_scanned: "Skannad ref: NCL-88421",
  wms_expected_po: "Förväntad ref: PO-7749-A",
  wms_blocked: "WMS: Spärrad / ej matchad",
  mail_no_match: "3PL: Referens ej auto-matchad",
  outbound_normal: "Prioritet: Normal",
  outbound_standard: "Ordertyp: Standard replenishment",
  deadline_note: "Kundnotering: Produktionskritiskt före 14:00",
};

/* ─── CLUES ─── */
const CLUES = [
  {
    id: 1, code: "DOC-01", title: "Commercial Invoice",
    docTitle: "COMMERCIAL INVOICE — Northbridge Components Ltd",
    stamp: "COPY",
    fields: [
      { label: "Seller", value: "Northbridge Components Ltd, Manchester" },
      { label: "Buyer", value: "NordAxel Manufacturing AB, Värnamo" },
      { label: "Invoice No", value: "NCL-88421", eid: "invoice_ref" },
      { label: "PO reference", value: "PO-7749-A", eid: "invoice_po" },
      { label: "Customer ref", value: "URGENT-LINE-7", eid: "invoice_urgent" },
      { label: "Incoterms", value: "DAP Värnamo" },
      { label: "HS Code", value: "8483.90" },
      { label: "Goods", value: "Gear housing assembly" },
      { label: "Value", value: "18 400 GBP" },
      { label: "Origin", value: "United Kingdom" },
    ],
  },
  {
    id: 2, code: "LOG-02", title: "Transportstatus",
    docTitle: "TRANSPORT STATUS — Carrier Event Log",
    tracking: [
      { time: "15 apr  08:44", status: "Arrived at import terminal", loc: "" },
      { time: "15 apr  09:31", status: "Handed to local distribution", loc: "" },
      { time: "15 apr  10:06", status: "Delivered to 3PL inbound", loc: "ScanDist 3PL, Värnamo", eid: "carrier_delivered" },
      { time: "15 apr  13:42", status: "Delivery event closed", loc: "" },
      { time: "15 apr  16:18", status: "Customer reports material missing", loc: "NordAxel Manufacturing" },
    ],
  },
  {
    id: 3, code: "IMP-03", title: "Importunderlag",
    docTitle: "IMPORTUNDERLAG — ScanBroker Customs AB",
    fields: [
      { label: "MRN", value: "26SE0001128891" },
      { label: "Deklarationstyp", value: "Importdeklaration" },
      { label: "Deklarant / Ombud", value: "ScanBroker Customs AB" },
      { label: "Importör", value: "NordAxel Manufacturing AB" },
      { label: "Varukod", value: "8483.90" },
      { label: "Förfarande", value: "Övergång till fri omsättning" },
      { label: "Deklarationsstatus", value: "Frigjord", eid: "decl_frigjord" },
      { label: "Statusdatum", value: "15 apr 09:18" },
      { label: "Intern notering (ScanBroker)", value: "Ursprungsförsäkran inväntar verifiering hos importör" },
    ],
  },
  {
    id: 4, code: "WMS-04", title: "3PL Receiving Log",
    docTitle: "WMS RECEIVING LOG — ScanDist 3PL Värnamo",
    fields: [
      { label: "Mottagen", value: "15 apr 10:06" },
      { label: "Inbound unit", value: "1 crate" },
      { label: "Skannad ref", value: "NCL-88421", eid: "wms_scanned" },
      { label: "Förväntad ref", value: "PO-7749-A", eid: "wms_expected_po" },
      { label: "Customer ref", value: "URGENT-LINE-7" },
      { label: "Lagerplats", value: "AVV-03 (avvikelseplats)" },
      { label: "WMS-status", value: "Mottagen / ej matchad mot förväntad inleverans", eid: "wms_blocked" },
      { label: "Intern release", value: "Spärrad" },
      { label: "Orsak", value: "Referensmatchning saknas" },
    ],
  },
  {
    id: 5, code: "MAIL-05", title: "Intern 3PL-konversation",
    docTitle: "INTERNAL MESSAGE — ScanDist 3PL",
    email: {
      from: "inbound.vmo@scandist3pl.com",
      to: "controltower@scandist3pl.com",
      date: "15 apr 2026, 10:41",
      subject: "NCL-88421 / PO missing?",
      body: "Part arrived under invoice ref NCL-88421.\nExpected receipt is registered under PO-7749-A.\n\nImport declaration status: Frigjord, but internal document check is not closed on our side.\n\nKeeping unit in exception location until owner confirms release.",
    },
    tags: [
      { label: "Referens ej auto-matchad", eid: "mail_no_match" },
    ],
  },
  {
    id: 6, code: "OUT-06", title: "Outbound Order",
    docTitle: "OUTBOUND ORDER — ScanDist 3PL",
    fields: [
      { label: "Order type", value: "Standard replenishment", eid: "outbound_standard" },
      { label: "Created", value: "15 apr 14:32" },
      { label: "Ship date", value: "16 apr" },
      { label: "Priority", value: "Normal", eid: "outbound_normal" },
      { label: "Linked PO", value: "PO-7749-A" },
      { label: "Customer note", value: "Production critical before 14:00", eid: "deadline_note" },
      { label: "Carrier service", value: "Scheduled next-day" },
    ],
  },
];

/* ─── BREAKTHROUGHS ─── */
const BREAKTHROUGHS = [
  {
    id: "reference_gap",
    requires: ["invoice_ref", "wms_expected_po"],
    title: "REFERENSGLAPP",
    text: "3PL matchar inleveransen mot fakturanummer NCL-88421, men systemet väntar på PO-7749-A. Utan matchning placeras enheten på avvikelseplats.",
    icon: "⟁",
  },
  {
    id: "status_gap",
    requires: ["carrier_delivered", "wms_blocked"],
    title: "STATUSGLAPP",
    text: "Transportören har kvitterat leverans till 3PL, men godset ligger spärrat på avvikelseplats i WMS. Statusen \"levererad\" avser transportuppdraget — inte operativ tillgänglighet.",
    icon: "⟁",
  },
  {
    id: "priority_gap",
    requires: ["outbound_normal", "deadline_note"],
    title: "PRIORITETSGLAPP",
    text: "Ordern bokades som standard replenishment med normal prioritet, trots att kundnoteringen anger produktionskritiskt före 14:00. Vid 14:32 var tidsfönstret redan passerat.",
    icon: "⟁",
  },
];

/* ─── COST & CLOSURE DATA ─── */
const COSTS_VISIBLE = [
  { l: "Stilleståndsrisk / linjestopp", v: "42 000 kr" },
  { l: "Akut kurir från 3PL till fabrik", v: "6 800 kr" },
  { l: "Extra tullombuds-/importhantering", v: "1 900 kr" },
  { l: "Intern felsökning", v: "5 600 kr" },
  { l: "Kredit / eskalering mot 3PL", v: "3 500 kr" },
  { l: "Total synlig följdkostnad", v: "59 800 kr", bold: true },
];

const COSTS_HIDDEN = [
  "Produktion väntade på material som fanns i byggnaden.",
  "Tre system visade grönt.",
  "Ingen ägde hela kedjan.",
];

const PROFILES = [
  { min: 3, title: "THE DATA HUNTER", text: "Du hittade alla tre glappen — referens, status och prioritet.\nDu litade inte på att \"levererat\" och \"frigjord\" betydde samma sak i alla system.\n\nDet är där avvikelser blir synliga:\ninte i en enskild status,\nutan i glappet mellan flera." },
  { min: 2, title: "THE OPERATIONS DETECTIVE", text: "Du hittade två av tre glapp.\nDu såg att systemen var osynkroniserade — men ett mönster undgick dig.\n\nI verkliga utredningar är det ofta det tredje sambandet som förklarar varför ingen agerade." },
  { min: 1, title: "THE COST CONTROLLER", text: "Du hittade ett glapp.\nDu såg att något inte stämde, men kedjan var svår att överblicka.\n\nI verkliga logistikcase ser det ofta ut exakt så." },
  { min: 0, title: "THE BLAME GAME SURVIVOR", text: "Du öppnade underlagen men hittade inte glappen.\n\nDet är inte ovanligt. Varje system visade rätt.\nDet är i mellanrummen sanningen sitter." },
];

/* ─── COMPONENT ─── */
export default function Kolli404() {
  useEffect(() => { loadFonts(); }, []);

  const [phase, setPhase] = useState("intro");
  const [openedClues, setOpenedClues] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState([]);
  const [unlockedBreakthroughs, setUnlockedBreakthroughs] = useState([]);
  const [connectResult, setConnectResult] = useState(null); // null | "success" | "fail"
  const [lastBreakthrough, setLastBreakthrough] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [caseExpanded, setCaseExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  const scroll = () => setTimeout(() => ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" }), 100);
  const ac = CLUES.find(c => c.id === activeId);
  const btCount = unlockedBreakthroughs.length;
  const allFound = btCount === 3;
  const profile = PROFILES.find(p => btCount >= p.min) || PROFILES[PROFILES.length - 1];

  function openClue(id) {
    if (!openedClues.includes(id)) setOpenedClues(p => [...p, id]);
    setActiveId(id);
    scroll();
  }

  function toggleEvidence(eid) {
    setConnectResult(null);
    setSelectedEvidence(prev => {
      if (prev.includes(eid)) return prev.filter(e => e !== eid);
      if (prev.length >= 2) return [prev[1], eid];
      return [...prev, eid];
    });
  }

  function connectEvidence() {
    if (selectedEvidence.length !== 2) return;
    const sorted = [...selectedEvidence].sort();
    const match = BREAKTHROUGHS.find(b => {
      const req = [...b.requires].sort();
      return req[0] === sorted[0] && req[1] === sorted[1];
    });
    if (match && !unlockedBreakthroughs.includes(match.id)) {
      setUnlockedBreakthroughs(p => [...p, match.id]);
      setLastBreakthrough(match);
      setConnectResult("success");
      setSelectedEvidence([]);
      scroll();
    } else if (match && unlockedBreakthroughs.includes(match.id)) {
      setConnectResult("already");
      setTimeout(() => setConnectResult(null), 2000);
    } else {
      setConnectResult("fail");
      setTimeout(() => setConnectResult(null), 2500);
    }
  }

  function copyResult() {
    const t = `Jag löste Kolli 404 och blev ${profile.title}.\nImportdeklarationen hade status Frigjord. Transportören hade levererat. 3PL hade tagit emot.\nProduktionen saknade fortfarande materialet.\n\nKan du hitta glappen?\nkolli404.vercel.app`;
    navigator.clipboard?.writeText(t).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2400); });
  }

  /* ─── RENDER HELPERS ─── */

  const Btn = ({ children, onClick, disabled, variant = "primary", glow = false }) => (
    <button onClick={onClick} disabled={disabled} className={glow ? "k404-border-glow" : ""}
      style={{
        display: "block", width: "100%", fontFamily: C.mono, fontSize: 12, letterSpacing: "0.18em",
        padding: "14px 0", cursor: disabled ? "default" : "pointer", fontWeight: 500, marginTop: 8,
        transition: "all 0.3s",
        ...(variant === "primary"
          ? { background: C.goldSoft, border: `1px solid ${C.goldBorder}`, color: C.gold }
          : variant === "success"
          ? { background: C.greenSoft, border: `1px solid ${C.green}`, color: C.green }
          : { background: "transparent", border: `1px solid ${C.bdr}`, color: C.muted }),
        ...(disabled ? { opacity: 0.4 } : {}),
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.boxShadow = "0 0 24px rgba(200,164,93,0.08)"; } }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
    >{children}</button>
  );

  function isSelected(eid) { return selectedEvidence.includes(eid); }
  function isPartOfBreakthrough(eid) {
    return unlockedBreakthroughs.some(bId => {
      const b = BREAKTHROUGHS.find(x => x.id === bId);
      return b && b.requires.includes(eid);
    });
  }

  function fieldStyle(eid) {
    if (!eid) return {};
    const sel = isSelected(eid);
    const found = isPartOfBreakthrough(eid);
    return {
      cursor: "pointer",
      transition: "all 0.25s",
      background: sel ? "rgba(200,164,93,0.12)" : found ? C.greenSoft : "transparent",
      borderLeft: sel ? `3px solid ${C.gold}` : found ? `3px solid ${C.green}` : "3px solid transparent",
      paddingLeft: 8,
      marginLeft: -11,
      borderRadius: 2,
    };
  }

  function renderFields(fields) {
    return fields.map((f, i) => {
      const sel = f.eid && isSelected(f.eid);
      const found = f.eid && isPartOfBreakthrough(f.eid);
      return (
        <div key={i}
          className={f.eid ? "k404-evidence-btn" : ""}
          onClick={f.eid ? () => toggleEvidence(f.eid) : undefined}
          style={{
            display: "flex", justifyContent: "space-between", padding: "8px 8px 8px 11px",
            borderBottom: `1px solid ${C.bdr}`, flexWrap: "wrap", gap: 4,
            ...fieldStyle(f.eid),
          }}>
          <span style={{ fontFamily: C.mono, fontSize: 11, color: C.dim, letterSpacing: "0.05em", minWidth: 90 }}>{f.label}</span>
          <span style={{
            fontFamily: C.mono, fontSize: 12, textAlign: "right", flex: 1, fontWeight: sel || found ? 600 : 400,
            color: sel ? C.gold : found ? C.green : C.txt,
            transition: "color 0.3s",
          }}>{f.value}{sel && " ◆"}</span>
        </div>
      );
    });
  }

  function renderTracking(data) {
    return data.map((t, i) => {
      const sel = t.eid && isSelected(t.eid);
      const found = t.eid && isPartOfBreakthrough(t.eid);
      return (
        <div key={i}
          className={t.eid ? "k404-evidence-btn" : ""}
          onClick={t.eid ? () => toggleEvidence(t.eid) : undefined}
          style={{
            display: "flex", alignItems: "flex-start", position: "relative", paddingBottom: 16, paddingLeft: 22,
            ...fieldStyle(t.eid),
            marginLeft: t.eid ? -11 : 0, paddingLeft: t.eid ? 30 : 22,
          }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", border: `1.5px solid ${sel ? C.gold : found ? C.green : C.muted}`, position: "absolute", left: t.eid ? 8 : 0, top: 5, background: sel ? C.gold : found ? C.green : "transparent", transition: "all 0.3s" }} />
          {i < data.length - 1 && <div style={{ position: "absolute", left: t.eid ? 10.5 : 2.5, top: 14, width: 1, height: "calc(100% - 8px)", background: C.bdr }} />}
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontFamily: C.mono, fontSize: 11, color: C.dim }}>{t.time}</span>
            <span style={{ fontFamily: C.sans, fontSize: 13, color: sel ? C.gold : found ? C.green : C.txt, fontWeight: 500, transition: "color 0.3s" }}>{t.status}{sel && " ◆"}</span>
            {t.loc && <span style={{ fontFamily: C.sans, fontSize: 11, color: C.dim, fontStyle: "italic" }}>{t.loc}</span>}
          </div>
        </div>
      );
    });
  }

  function renderEmail(em, tags) {
    return (
      <div>
        {[["From", em.from], ["To", em.to], ["Date", em.date]].map(([l, v], i) => (
          <div key={i} style={{ marginBottom: 5, fontSize: 13 }}>
            <span style={{ fontFamily: C.mono, color: C.dim, fontSize: 11 }}>{l}:</span>{" "}
            <span style={{ fontFamily: C.mono, color: C.muted }}>{v}</span>
          </div>
        ))}
        <div style={{ marginBottom: 5, fontSize: 13 }}>
          <span style={{ fontFamily: C.mono, color: C.dim, fontSize: 11 }}>Subject:</span>{" "}
          <span style={{ fontFamily: C.mono, color: C.gold, fontSize: 12 }}>{em.subject}</span>
        </div>
        <div style={{ fontFamily: C.sans, fontSize: 13, color: C.txt, lineHeight: 1.8, marginTop: 16, padding: "16px 18px", background: C.bg, borderLeft: `2px solid ${C.bdr}`, whiteSpace: "pre-wrap" }}>{em.body}</div>
        {tags && tags.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {tags.map((tag, i) => {
              const sel = isSelected(tag.eid);
              const found = isPartOfBreakthrough(tag.eid);
              return (
                <button key={i} className="k404-evidence-btn" onClick={() => toggleEvidence(tag.eid)}
                  style={{
                    fontFamily: C.mono, fontSize: 10, letterSpacing: "0.05em",
                    padding: "6px 12px", border: `1px solid ${sel ? C.gold : found ? C.green : C.bdr}`,
                    background: sel ? C.goldSoft : found ? C.greenSoft : C.card,
                    color: sel ? C.gold : found ? C.green : C.muted,
                    cursor: "pointer", transition: "all 0.25s",
                  }}>
                  {sel && "◆ "}{tag.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function renderClue(clue) {
    return (
      <div style={{ background: C.card, border: `1px solid ${C.bdr}`, padding: "22px 22px", marginBottom: 12, position: "relative", transform: `rotate(${clue.id % 2 === 0 ? -0.3 : 0.2}deg)`, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
        {clue.stamp && (
          <div style={{ position: "absolute", top: 14, right: 16, fontFamily: C.mono, fontSize: 11, letterSpacing: "0.2em", color: C.red, border: `1.5px solid ${C.red}`, padding: "3px 12px", opacity: 0.75, transform: "rotate(3deg)" }}>{clue.stamp}</div>
        )}
        <div style={{ fontFamily: C.mono, fontSize: 11, letterSpacing: "0.15em", color: C.muted, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.bdr}` }}>{clue.docTitle}</div>
        {clue.fields && renderFields(clue.fields)}
        {clue.tracking && <div style={{ paddingLeft: 4, paddingTop: 4 }}>{renderTracking(clue.tracking)}</div>}
        {clue.email && renderEmail(clue.email, clue.tags)}
      </div>
    );
  }

  /* ─── INTRO ─── */
  if (phase === "intro") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.txt, fontFamily: C.sans, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "fixed", inset: 0, opacity: 0.025, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(200,164,93,0.4) 1px, transparent 0)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(200,164,93,0.15) 50%, transparent 100%)", animation: "k404scanline 8s linear infinite", pointerEvents: "none", zIndex: 1 }} />

        <div style={{ maxWidth: 580, margin: "0 auto", padding: "52px 28px 60px", position: "relative", zIndex: 2 }}>
          <div className="k404-fade" style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.2em", color: C.gold, marginBottom: 24 }}>LOGISTIKGÅTA</div>
          <h1 className="k404-card-enter" style={{ fontFamily: C.mono, fontSize: "clamp(28px,8vw,42px)", fontWeight: 600, color: C.txt, letterSpacing: "0.08em", margin: "0 0 6px", lineHeight: 1.15 }}>KOLLI 404</h1>
          <p className="k404-card-enter" style={{ fontFamily: C.mono, fontSize: 11, color: C.dim, letterSpacing: "0.12em", marginBottom: 28 }}>FRIGJORD DEKLARATION, SAKNAT MATERIAL</p>

          <div className="k404-doc-enter" style={{ marginBottom: 28, position: "relative", overflow: "hidden", border: `1px solid ${C.bdr}` }}>
            <img src="/public/hero-intro.png" alt="" style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

          <div className="k404-doc-enter" style={{ background: C.card, border: `1px solid ${C.bdr}`, padding: "32px 28px", marginBottom: 36 }}>
            <div style={{ textAlign: "right", marginBottom: 18 }}>
              <span className="k404-border-glow" style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.2em", color: C.red, border: `1px solid ${C.red}`, padding: "3px 12px", display: "inline-block" }}>OLÖST</span>
            </div>

            <div style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.08em", lineHeight: 2, marginBottom: 18, borderBottom: `1px solid ${C.bdr}`, paddingBottom: 14 }}>
              <div>CASE ID: K404-2026</div>
              <div>STATUS: DELIVERED TO 3PL — NOT AVAILABLE FOR PRODUCTION</div>
              <div>VALUE AT RISK: 18 400 GBP</div>
              <div>ROUTE: MANCHESTER → IMPORTTERMINAL SE → 3PL VÄRNAMO</div>
              <div>MODE: IMPORT / CROSS-DOCK / 3PL</div>
            </div>

            <p style={{ fontFamily: C.mono, fontSize: 12, color: C.dim, lineHeight: 1.6, marginBottom: 8 }}>16:18 ringer produktionschefen.</p>
            <p style={{ fontFamily: C.serif, fontSize: 17, fontStyle: "italic", color: C.txt, margin: "16px 0 24px", lineHeight: 1.7, borderLeft: `2px solid ${C.goldBorder}`, paddingLeft: 18 }}>
              "Ni säger att materialet är levererat.<br />
              Tullombudet säger att importdeklarationen är frigjord.<br />
              3PL säger att kollit är mottaget i WMS.<br /><br />
              Men vår lina står fortfarande utan reservdelen."
            </p>

            <div style={{ fontFamily: C.sans, fontSize: 14, color: C.muted, lineHeight: 1.9 }}>
              <p style={{ marginBottom: 16 }}>En akut reservdel från Storbritannien skulle vara på plats i produktionen i Värnamo före 14:00.</p>
            </div>

            <div style={{ height: 1, background: C.bdr, margin: "20px 0" }} />

            <div style={{ fontFamily: C.sans, fontSize: 14, color: C.muted, lineHeight: 1.9 }}>
              <p style={{ marginBottom: 8 }}>Du har fått tillgång till sex interna underlag. Granska dem. Hitta detaljerna som inte stämmer överens.</p>
              <p style={{ marginTop: 16, fontWeight: 500, color: C.txt }}>Koppla ihop bevisen. Hitta de tre glappen innan du öppnar lösningen.</p>
            </div>
          </div>

          <Btn glow onClick={() => setPhase("investigate")}>ÖPPNA CASE FILE</Btn>
        </div>
      </div>
    );
  }

  /* ─── INVESTIGATE ─── */
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.txt, fontFamily: C.sans, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, opacity: 0.025, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(200,164,93,0.4) 1px, transparent 0)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(200,164,93,0.12) 50%, transparent 100%)", animation: "k404scanline 8s linear infinite", pointerEvents: "none", zIndex: 1 }} />

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: `1px solid ${C.bdr}`, background: C.bg, position: "sticky", top: 0, zIndex: 10 }}>
        <span style={{ fontFamily: C.mono, fontSize: 11, letterSpacing: "0.15em", color: C.gold, fontWeight: 500 }}>K404-2026</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.08em" }}>GENOMBROTT</span>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: i < btCount ? C.green : "transparent",
              border: `1.5px solid ${i < btCount ? C.green : C.dim}`,
              transition: "all 0.5s ease",
              boxShadow: i < btCount ? `0 0 10px ${C.green}66` : "none",
            }} />
          ))}
        </div>
      </header>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 22px 140px", overflowY: "auto", maxHeight: "calc(100vh - 48px)" }} ref={ref}>

        {!showSolution && (
          <>
            {/* Evidence overview image */}
            <div className="k404-fade" style={{ marginBottom: 18, overflow: "hidden", border: `1px solid ${C.bdr}`, position: "relative" }}>
              <img src="/public/hero-evidence.png" alt="" style={{ width: "100%", height: "auto", display: "block", opacity: 0.9 }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: `linear-gradient(transparent, ${C.bg})` }} />
            </div>

            {/* Expandable case context */}
            <div className="k404-fade" style={{ background: C.card, border: `1px solid ${C.bdr}`, padding: "16px 18px", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, cursor: "pointer" }} onClick={() => setCaseExpanded(!caseExpanded)}>
                <div style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.15em", color: C.gold }}>ÄRENDET</div>
                <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim }}>{caseExpanded ? "DÖLJ ▴" : "VISA MER ▾"}</span>
              </div>
              <p style={{ fontFamily: C.serif, fontSize: 14, fontStyle: "italic", color: C.txt, lineHeight: 1.6, marginBottom: 8, borderLeft: `2px solid ${C.goldBorder}`, paddingLeft: 14 }}>
                "Ni säger att materialet är levererat. Men vår lina står fortfarande utan reservdelen."
              </p>
              {caseExpanded && (
                <div className="k404-fade" style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.bdr}` }}>
                  <p style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, lineHeight: 1.8, marginBottom: 8 }}>Akut reservdel, Northbridge Components (UK) → NordAxel Manufacturing (Värnamo). Produktionskritiskt före 14:00. Transportör, tullombud och 3PL visar alla grön status — men materialet är inte operativt tillgängligt.</p>
                  <p style={{ fontFamily: C.sans, fontSize: 13, color: C.txt, fontWeight: 500, lineHeight: 1.8 }}>Granska underlagen. Hitta detaljer som inte stämmer överens. Koppla ihop dem för att låsa upp genombrott.</p>
                </div>
              )}
            </div>

            {/* Unlocked breakthroughs */}
            {unlockedBreakthroughs.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                {unlockedBreakthroughs.map(bId => {
                  const b = BREAKTHROUGHS.find(x => x.id === bId);
                  return (
                    <div key={bId} className="k404-card-enter" style={{ background: C.greenSoft, border: `1px solid rgba(111,143,114,0.25)`, padding: "14px 16px", marginBottom: 8 }}>
                      <div style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.15em", color: C.green, marginBottom: 6 }}>{b.icon} {b.title}</div>
                      <p style={{ fontFamily: C.sans, fontSize: 12, color: "#b8d4c0", lineHeight: 1.7 }}>{b.text}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Clue grid */}
            <p className="k404-fade" style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.15em", color: C.dim, marginBottom: 14 }}>GRANSKA BEVIS</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 22 }}>
              {CLUES.map((c, idx) => {
                const opened = openedClues.includes(c.id);
                const active = activeId === c.id;
                return (
                  <button key={c.id} onClick={() => openClue(c.id)}
                    className={`k404-stagger-${idx + 1}${active ? " k404-pulse" : ""}`}
                    style={{
                      background: active ? C.panel : C.card, border: `1px solid ${active ? C.goldBorder : C.bdr}`,
                      padding: "13px 13px 11px", cursor: "pointer", textAlign: "left", position: "relative",
                      transition: "all 0.3s ease", opacity: !opened ? 0.7 : 1,
                      boxShadow: active ? `0 0 20px ${C.goldGlow}` : "none",
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = C.bdrStrong; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = active ? C.goldBorder : C.bdr; }}
                  >
                    <div style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.2em", color: C.dim, marginBottom: 4 }}>{c.code}</div>
                    <div style={{ fontFamily: C.sans, fontSize: 12, color: opened ? C.txt : C.muted, fontWeight: 500 }}>{opened ? c.title : "Ogranskad"}</div>
                  </button>
                );
              })}
            </div>

            {/* Active document */}
            {ac && (
              <div className="k404-doc-enter" key={ac.id} style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: C.mono, fontSize: 10, color: C.gold, marginBottom: 8, letterSpacing: "0.1em", opacity: 0.8 }}>KLICKA PÅ MARKERADE FÄLT FÖR ATT VÄLJA BEVIS</div>
                {renderClue(ac)}
              </div>
            )}

            {/* All found → show solution button */}
            {allFound && (
              <div className="k404-card-enter" style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.15em", color: C.green, marginBottom: 12 }}>ALLA GENOMBROTT HITTADE</div>
                <Btn glow onClick={() => { setShowSolution(true); setActiveId(null); scroll(); }}>ÖPPNA LÖSNINGEN</Btn>
              </div>
            )}
          </>
        )}

        {/* ─── SOLUTION ─── */}
        {showSolution && (
          <div className="k404-doc-enter" style={{ paddingBottom: 40 }}>
            {/* Profile */}
            <div style={{ background: C.card, border: `1px solid ${C.goldBorder}`, padding: "28px 22px", textAlign: "center", marginBottom: 34 }}>
              <div style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.15em", marginBottom: 16 }}>Genombrott: {btCount} av 3</div>
              <h2 style={{ fontFamily: C.mono, fontSize: 18, color: C.gold, fontWeight: 600, marginBottom: 14, letterSpacing: "0.1em" }}>{profile.title}</h2>
              <p style={{ fontFamily: C.sans, fontSize: 12, lineHeight: 1.8, color: C.muted, maxWidth: 400, margin: "0 auto", whiteSpace: "pre-line" }}>{profile.text}</p>
              <div style={{ marginTop: 18 }}>
                <button onClick={copyResult} style={{
                  fontFamily: C.mono, fontSize: 10, letterSpacing: "0.15em", color: copied ? C.green : C.gold,
                  background: "transparent", border: `1px solid ${copied ? C.green : C.goldBorder}`, padding: "8px 18px", cursor: "pointer", transition: "all 0.2s",
                }}>{copied ? "KOPIERAT" : "KOPIERA RESULTAT"}</button>
              </div>
            </div>

            {/* Closure image */}
            <div style={{ marginBottom: 28, overflow: "hidden", border: `1px solid ${C.bdr}` }}>
              <img src="/public/hero-closure.png" alt="" style={{ width: "100%", height: "auto", display: "block" }} />
            </div>

            {/* Case closure */}
            <div style={{ marginBottom: 34 }}>
              <div style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.2em", color: C.dim, marginBottom: 6 }}>CASE CLOSURE</div>
              <h2 style={{ fontFamily: C.mono, fontSize: 14, letterSpacing: "0.1em", color: C.txt, marginBottom: 26, paddingBottom: 14, borderBottom: `1px solid ${C.bdr}`, fontWeight: 500 }}>KOLLI 404</h2>
              {[
                { num: "01", title: "UTGÅNGSLÄGE", text: "Godset var aldrig fysiskt försvunnet.\n\nImportdeklarationen hade status Frigjord. Transportören hade levererat till 3PL. 3PL hade tagit emot kollit i WMS.\n\nMen materialet var inte operativt tillgängligt för produktionen.\n\nFelet låg inte i en enskild status, utan i antagandet att statusarna betydde samma sak." },
                { num: "02", title: "REFERENSGLAPPET", text: "3PL matchade inleveransen mot invoice ref NCL-88421, medan kundens förväntade inleverans låg på PO-7749-A.\n\nUtan matchning mot förväntad inleverans placerades enheten på avvikelseplats med spärrad intern release." },
                { num: "03", title: "STATUSGLAPPET", text: "Transportörens leveransstatus avsåg leverans till 3PL, men tolkades som att materialet var tillgängligt för produktionen.\n\nImportdeklarationen hade status Frigjord. Det innebar att varorna kunde lämnas ut ur importflödet, men inte att 3PL:s interna dokumentkontroll, referensmatchning eller lagerrelease var stängd.\n\nTre system — transportör, tullombud, 3PL — visade var sin \"rätt\" status. Ingen visade hela kedjan." },
                { num: "04", title: "PRIORITETSGLAPPET", text: "När ärendet till slut kopplades till rätt PO skapades outbound-ordern som standard replenishment med normal prioritet.\n\nTidsfönstret — produktionskritiskt före 14:00 — var redan passerat vid 14:32.\n\nÄven om ordern hade flaggats som urgent vid den tidpunkten hade materialet inte nått produktionslinan i tid." },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: 22 }}>
                  <div style={{ fontFamily: C.mono, fontSize: 10, color: C.gold, letterSpacing: "0.1em", marginBottom: 6 }}>{s.num} — {s.title}</div>
                  <p style={{ fontFamily: C.sans, fontSize: 12, lineHeight: 1.8, color: C.muted, whiteSpace: "pre-line" }}>{s.text}</p>
                </div>
              ))}
            </div>

            {/* Cost */}
            <div style={{ background: C.card, border: `1px solid ${C.bdr}`, padding: "20px 18px", marginBottom: 34 }}>
              <div style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.15em", color: C.dim, marginBottom: 6 }}>05 — KOSTNADSEFFEKT</div>
              <div style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.1em", color: C.muted, marginBottom: 14 }}>DEN SYNLIGA KOSTNADEN</div>
              {COSTS_VISIBLE.map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: C.mono, fontSize: 11, color: c.bold ? C.gold : C.txt, padding: "5px 0", borderBottom: c.bold ? "none" : `1px solid ${C.bdr}`, fontWeight: c.bold ? 600 : 400, ...(c.bold ? { borderTop: `1px solid ${C.bdr}`, marginTop: 6, paddingTop: 10 } : {}) }}>
                  <span>{c.l}</span><span>{c.v}</span>
                </div>
              ))}
              <div style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.1em", color: C.muted, marginTop: 26, marginBottom: 10 }}>DEN DOLDA KOSTNADEN</div>
              {COSTS_HIDDEN.map((c, i) => <p key={i} style={{ fontFamily: C.sans, fontSize: 12, color: C.dim, fontStyle: "italic", marginBottom: 3 }}>{c}</p>)}
            </div>

            {/* DPH */}
            <div style={{ textAlign: "center", padding: "28px 0 16px" }}>
              <div style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.15em", color: C.dim, marginBottom: 18 }}>06 — NOTERING</div>
              <p style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, marginBottom: 4 }}>Det här var ett fiktivt fall.</p>
              <p style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, marginBottom: 16 }}>Men mönstret är verkligt.</p>
              <p style={{ fontFamily: C.serif, fontSize: 14, fontStyle: "italic", color: C.txt, marginBottom: 4, lineHeight: 1.6 }}>Alla hade rätt i sitt system.</p>
              <p style={{ fontFamily: C.serif, fontSize: 14, fontStyle: "italic", color: C.txt, marginBottom: 24, lineHeight: 1.6 }}>Ingen hade hela bilden.</p>
              <div style={{ height: 1, background: C.bdr, maxWidth: 60, margin: "0 auto 18px" }} />
              <p style={{ fontFamily: C.mono, fontSize: 12, letterSpacing: "0.2em", color: C.gold, fontWeight: 500, marginBottom: 4 }}>DearPriceHunter</p>
              <p style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.1em" }}>Beslutsstöd för kostnad, risk och logistikdata.</p>
            </div>
          </div>
        )}
      </div>

      {/* ─── FIXED BOTTOM: EVIDENCE DESK ─── */}
      {!showSolution && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20,
          background: "linear-gradient(transparent, rgba(14,13,11,0.95) 20%)",
          paddingTop: 24,
        }}>
          <div style={{
            maxWidth: 600, margin: "0 auto", padding: "0 22px 16px",
          }}>
            <div style={{
              background: C.card, border: `1px solid ${selectedEvidence.length === 2 ? C.goldBorder : C.bdr}`,
              padding: "14px 18px", transition: "all 0.3s",
              boxShadow: selectedEvidence.length === 2 ? `0 0 20px ${C.goldGlow}` : "0 4px 20px rgba(0,0,0,0.4)",
            }}>
              <div style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.15em", color: C.gold, marginBottom: 10 }}>VALDA BEVIS</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10, minHeight: 32, alignItems: "center" }}>
                {[0, 1].map(i => (
                  <div key={i} style={{
                    flex: 1, fontFamily: C.mono, fontSize: 11, padding: "8px 10px",
                    border: `1px dashed ${selectedEvidence[i] ? C.gold : "rgba(200,164,93,0.3)"}`,
                    color: selectedEvidence[i] ? C.gold : C.muted,
                    background: selectedEvidence[i] ? C.goldSoft : "rgba(200,164,93,0.04)",
                    transition: "all 0.25s", letterSpacing: "0.03em",
                    cursor: selectedEvidence[i] ? "pointer" : "default",
                  }}
                    onClick={() => selectedEvidence[i] && toggleEvidence(selectedEvidence[i])}
                  >
                    {selectedEvidence[i] ? (EV_LABELS[selectedEvidence[i]] || selectedEvidence[i]) : `Bevis ${i + 1} —`}
                  </div>
                ))}
              </div>
              <button
                disabled={selectedEvidence.length !== 2}
                onClick={connectEvidence}
                className={connectResult === "fail" ? "k404-shake" : connectResult === "success" ? "k404-success" : ""}
                style={{
                  display: "block", width: "100%", fontFamily: C.mono, fontSize: 11, letterSpacing: "0.15em",
                  padding: "12px 0", cursor: selectedEvidence.length !== 2 ? "default" : "pointer",
                  fontWeight: 500, transition: "all 0.3s", border: "none",
                  ...(connectResult === "success"
                    ? { background: C.greenSoft, color: C.green, border: `1px solid ${C.green}` }
                    : connectResult === "fail"
                    ? { background: C.redSoft, color: C.red, border: `1px solid ${C.red}` }
                    : connectResult === "already"
                    ? { background: C.goldSoft, color: C.gold, border: `1px solid ${C.goldBorder}` }
                    : selectedEvidence.length === 2
                    ? { background: C.goldSoft, color: C.gold, border: `1px solid ${C.goldBorder}` }
                    : { background: "rgba(200,164,93,0.04)", color: C.muted, border: `1px solid rgba(200,164,93,0.2)`, opacity: 0.7 }),
                }}
              >
                {connectResult === "success" ? "✓ GENOMBROTT HITTAT"
                  : connectResult === "fail" ? "INGEN KORRELATION FUNNEN"
                  : connectResult === "already" ? "REDAN HITTAT"
                  : "KOPPLA BEVIS"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
