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
    @keyframes k404fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes k404fadeOnly {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes k404pulse {
      0%, 100% { box-shadow: 0 0 12px rgba(200,164,93,0.06); }
      50% { box-shadow: 0 0 24px rgba(200,164,93,0.18); }
    }
    @keyframes k404glow {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
    @keyframes k404scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    @keyframes k404slideIn {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes k404borderGlow {
      0%, 100% { border-color: rgba(200,164,93,0.25); }
      50% { border-color: rgba(200,164,93,0.55); }
    }
    .k404-card-enter { animation: k404fadeIn 0.4s ease-out both; }
    .k404-doc-enter { animation: k404slideIn 0.5s ease-out both; }
    .k404-fade { animation: k404fadeOnly 0.6s ease-out both; }
    .k404-pulse { animation: k404pulse 3s ease-in-out infinite; }
    .k404-glow { animation: k404glow 2s ease-in-out infinite; }
    .k404-border-glow { animation: k404borderGlow 2.5s ease-in-out infinite; }
    .k404-stagger-1 { animation: k404fadeIn 0.4s ease-out 0.05s both; }
    .k404-stagger-2 { animation: k404fadeIn 0.4s ease-out 0.1s both; }
    .k404-stagger-3 { animation: k404fadeIn 0.4s ease-out 0.15s both; }
    .k404-stagger-4 { animation: k404fadeIn 0.4s ease-out 0.2s both; }
    .k404-stagger-5 { animation: k404fadeIn 0.4s ease-out 0.25s both; }
    .k404-stagger-6 { animation: k404fadeIn 0.4s ease-out 0.3s both; }
  `;
  document.head.appendChild(style);
};

/* ─── PALETTE ─── */
const C = {
  gold: "#C8A45D",
  goldSoft: "rgba(200,164,93,0.14)",
  goldBorder: "rgba(200,164,93,0.35)",
  goldGlow: "rgba(200,164,93,0.10)",
  red: "#9F4F46",
  redSoft: "rgba(159,79,70,0.12)",
  green: "#6F8F72",
  greenSoft: "rgba(111,143,114,0.12)",
  bg: "#0E0D0B",
  card: "#151210",
  panel: "#1A1610",
  bdr: "rgba(200,164,93,0.12)",
  bdrStrong: "rgba(200,164,93,0.25)",
  txt: "#E7DED0",
  muted: "#B5ADA0",
  dim: "#968C80",
  sans: "'IBM Plex Sans', 'Helvetica Neue', sans-serif",
  mono: "'IBM Plex Mono', 'Courier New', monospace",
  serif: "'Georgia', serif",
};

/* ─── DATA ─── */
const CLUES = [
  {
    id: 1, code: "DOC-01", title: "Commercial Invoice", observationKey: "multi_refs",
    question: {
      prompt: "Vilken detalj kan skapa problem längre fram i kedjan?",
      options: [
        { text: "Att Incoterms DAP kan påverka ansvarsfördelningen efter ankomst", key: "a" },
        { text: "Att invoice ref, PO reference och customer ref används parallellt", key: "b" },
        { text: "Att varukoden kan kräva extra intern dokumentkontroll", key: "c" },
        { text: "Att värdet i GBP kan påverka importunderlaget", key: "d" },
      ],
      correctKey: "b",
      insight: "Rätt. Flera parallella referenser kan skapa problem när transportör, tullombud, 3PL och kund matchar mot olika system.",
      wrongHint: "Tänk på vad som händer när varje aktör i kedjan använder olika referensnummer för samma sändning.",
    },
    docTitle: "COMMERCIAL INVOICE — Northbridge Components Ltd",
    fields: [
      { label: "Seller", value: "Northbridge Components Ltd, Manchester" },
      { label: "Buyer", value: "NordAxel Manufacturing AB, Värnamo" },
      { label: "Invoice No", value: "NCL-88421", ck: "multi_refs" },
      { label: "PO reference", value: "PO-7749-A", ck: "multi_refs" },
      { label: "Customer ref", value: "URGENT-LINE-7", ck: "multi_refs" },
      { label: "Incoterms", value: "DAP Värnamo" },
      { label: "HS Code", value: "8483.90" },
      { label: "Goods", value: "Gear housing assembly" },
      { label: "Value", value: "18 400 GBP" },
      { label: "Origin", value: "United Kingdom" },
    ],
  },
  {
    id: 2, code: "LOG-02", title: "Transportstatus", observationKey: "delivery_scope",
    question: {
      prompt: "Vad är riskabelt att anta utifrån transportstatusen?",
      options: [
        { text: "Att materialet automatiskt är tillgängligt för produktionen", key: "a" },
        { text: "Att transportören aldrig levererade till 3PL", key: "b" },
        { text: "Att importdeklarationen saknas", key: "c" },
        { text: "Att kundens PO är felaktig", key: "d" },
      ],
      correctKey: "a",
      insight: "Rätt. Transportörens leveransstatus visar att transportuppdraget är avslutat vid leveranspunkten. Den bevisar inte att materialet är plockbart eller operativt tillgängligt i kundens produktionsflöde.",
      wrongHint: "Tänk på vad transportörens uppdrag faktiskt omfattar — och var det uppdraget slutar.",
    },
    docTitle: "TRANSPORT STATUS — Carrier Event Log",
    tracking: [
      { time: "15 apr  08:44", status: "Arrived at import terminal", loc: "" },
      { time: "15 apr  09:31", status: "Handed to local distribution", loc: "" },
      { time: "15 apr  10:06", status: "Delivered to 3PL inbound", loc: "ScanDist 3PL, Värnamo" },
      { time: "15 apr  13:42", status: "Delivery event closed", loc: "" },
      { time: "15 apr  16:18", status: "Customer reports material missing", loc: "NordAxel Manufacturing" },
    ],
  },
  {
    id: 3, code: "IMP-03", title: "Importunderlag", observationKey: "decl_vs_release",
    question: {
      prompt: "Vilken tolkning är mest korrekt?",
      options: [
        { text: "Deklarationsstatus Frigjord betyder att materialet är produktionsklart", key: "a" },
        { text: "Deklarationen är frigjord, men interna 3PL-kontroller kan fortfarande återstå", key: "b" },
        { text: "Frigjord betyder att WMS automatiskt matchar inleveransen", key: "c" },
        { text: "Frigjord betyder att kunden har mottagit materialet", key: "d" },
      ],
      correctKey: "b",
      insight: "Rätt. Deklarationsstatus Frigjord innebär att varorna kan lämnas ut ur importflödet. Det betyder inte att 3PL:s interna referensmatchning, dokumentkontroll eller lagerrelease är färdig.",
      wrongHint: "Deklarationsstatusen gäller importflödet. Men det finns fler steg innan materialet är operativt tillgängligt.",
    },
    docTitle: "IMPORTUNDERLAG — ScanBroker Customs AB",
    fields: [
      { label: "MRN", value: "26SE0001128891" },
      { label: "Deklarationstyp", value: "Importdeklaration" },
      { label: "Deklarant / Ombud", value: "ScanBroker Customs AB" },
      { label: "Importör", value: "NordAxel Manufacturing AB" },
      { label: "Varukod", value: "8483.90" },
      { label: "Förfarande", value: "Övergång till fri omsättning" },
      { label: "Deklarationsstatus", value: "Frigjord", ck: "decl_vs_release" },
      { label: "Statusdatum", value: "15 apr 09:18" },
      { label: "Intern notering (ScanBroker)", value: "Ursprungsförsäkran inväntar verifiering hos importör" },
    ],
  },
  {
    id: 4, code: "WMS-04", title: "3PL Receiving Log", observationKey: "wms_blocked",
    question: {
      prompt: "Var finns glappet i WMS-loggen?",
      options: [
        { text: "Godset är mottaget men inte internt releasat", key: "a" },
        { text: "Godset har aldrig anlänt till 3PL", key: "b" },
        { text: "Transportören har levererat till fel land", key: "c" },
        { text: "Tullombudet saknar MRN", key: "d" },
      ],
      correctKey: "a",
      insight: "Rätt. WMS visar mottaget gods, men enheten ligger på avvikelseplats i väntan på referensmatchning och intern release.",
      wrongHint: "Titta på lagerplats och WMS-status. Mottaget är inte samma sak som tillgängligt.",
    },
    docTitle: "WMS RECEIVING LOG — ScanDist 3PL Värnamo",
    fields: [
      { label: "Mottagen", value: "15 apr 10:06" },
      { label: "Inbound unit", value: "1 crate" },
      { label: "Skannad ref", value: "NCL-88421", ck: "wms_blocked" },
      { label: "Förväntad ref", value: "PO-7749-A", ck: "wms_blocked" },
      { label: "Customer ref", value: "URGENT-LINE-7" },
      { label: "Lagerplats", value: "AVV-03 (avvikelseplats)" },
      { label: "WMS-status", value: "Mottagen / ej matchad mot förväntad inleverans", ck: "wms_blocked" },
      { label: "Intern release", value: "Spärrad", ck: "wms_blocked" },
      { label: "Orsak", value: "Referensmatchning saknas" },
    ],
  },
  {
    id: 5, code: "MAIL-05", title: "Intern 3PL-konversation", observationKey: "internal_block",
    question: {
      prompt: "Vad säger meddelandet egentligen?",
      options: [
        { text: "Att godset är stoppat av Tullverket", key: "a" },
        { text: "Att 3PL inväntar intern klarering på grund av referensmatchning och dokumentkontroll", key: "b" },
        { text: "Att transportören inte har levererat", key: "c" },
        { text: "Att kunden har avbokat reservdelen", key: "d" },
      ],
      correctKey: "b",
      insight: "Rätt. Importdeklarationen är frigjord, men 3PL håller enheten i avvikelseplats tills referensen och den interna dokumentkontrollen är bekräftad.",
      wrongHint: "Läs noga — vem är det som håller godset, och varför? Det är inte Tullverket.",
    },
    docTitle: "INTERNAL MESSAGE — ScanDist 3PL",
    email: {
      from: "inbound.vmo@scandist3pl.com",
      to: "controltower@scandist3pl.com",
      date: "15 apr 2026, 10:41",
      subject: "NCL-88421 / PO missing?",
      body: "Part arrived under invoice ref NCL-88421.\nExpected receipt is registered under PO-7749-A.\n\nImport declaration status: Frigjord, but internal document check is not closed on our side.\n\nKeeping unit in exception location until owner confirms release.",
    },
  },
  {
    id: 6, code: "OUT-06", title: "Outbound Order", observationKey: "priority_gap",
    question: {
      prompt: "Vilket beslut skapade störst operativ konsekvens?",
      options: [
        { text: "Att ordern skapades som standard replenishment med normal prioritet", key: "a" },
        { text: "Att godset skickades från Storbritannien", key: "b" },
        { text: "Att fakturavärdet var i GBP", key: "c" },
        { text: "Att varukoden fanns på fakturan", key: "d" },
      ],
      correctKey: "a",
      insight: "Rätt. När materialet väl kunde kopplas till rätt PO skapades outbound-flödet som normal påfyllnad — trots att kundnoteringen visade att det var produktionskritiskt före 14:00. Vid 14:32 var tidsfönstret redan passerat.",
      wrongHint: "Titta på order type, priority och ship date. Jämför med kundnoteringen. Stämmer prioriteten?",
    },
    docTitle: "OUTBOUND ORDER — ScanDist 3PL",
    fields: [
      { label: "Order type", value: "Standard replenishment", ck: "priority_gap" },
      { label: "Created", value: "15 apr 14:32" },
      { label: "Ship date", value: "16 apr" },
      { label: "Priority", value: "Normal", ck: "priority_gap" },
      { label: "Linked PO", value: "PO-7749-A" },
      { label: "Customer note", value: "Production critical before 14:00" },
      { label: "Carrier service", value: "Scheduled next-day" },
    ],
  },
];

const THEORY_QS = [
  { id: "location", prompt: "Var fanns godset när kunden rapporterade att materialet saknades?", options: [
    { text: "Hos transportören i Stockholm", key: "a" },
    { text: "Hos 3PL på avvikelseplats", key: "b" },
    { text: "Hos Tullverket", key: "c" },
    { text: "På väg tillbaka till Storbritannien", key: "d" },
  ], correctKey: "b" },
  { id: "assumption", prompt: "Varför trodde kunden att materialet var levererat?", options: [
    { text: "För att importdeklarationen var frigjord", key: "a" },
    { text: "För att transportörens leveransstatus avsåg leverans till 3PL", key: "b" },
    { text: "För att 3PL hade skickat materialet till produktionen", key: "c" },
    { text: "För att PO:n var stängd", key: "d" },
  ], correctKey: "b" },
  { id: "block", prompt: "Varför släpptes materialet inte vidare i 3PL-flödet?", options: [
    { text: "För att det saknade fysisk etikett", key: "a" },
    { text: "För att referensen inte matchade förväntad inleverans och intern dokumentkontroll inte var stängd", key: "b" },
    { text: "För att transportören tappade bort det", key: "c" },
    { text: "För att kunden hade fel leveransadress", key: "d" },
  ], correctKey: "b" },
  { id: "cost", prompt: "Vilket beslut skapade den faktiska följdkostnaden?", options: [
    { text: "Att godset skickades från Storbritannien", key: "a" },
    { text: "Att importdeklarationen hade status Frigjord", key: "b" },
    { text: "Att outbound-ordern bokades som normal påfyllnad istället för akut produktionsmaterial", key: "c" },
    { text: "Att fakturavärdet var i GBP", key: "d" },
  ], correctKey: "c" },
];

const PROFILES = [
  { min: 85, title: "THE DATA HUNTER", text: "Du hittade sambanden mellan referensmatchning, WMS-status och outbound-prioritet.\nDu litade inte på att \"levererat\" och \"frigjord\" betydde samma sak i alla system.\n\nDet är där många avvikelser blir synliga:\ninte i en enskild status,\nutan i glappet mellan flera." },
  { min: 65, title: "THE OPERATIONS DETECTIVE", text: "Du såg de praktiska glappen mellan systemstatus och operativ verklighet.\nImportdeklaration, transportstatus, WMS-release — tre system, tre sanningar.\n\nDu förstår att verkligheten ofta sker mellan systemen." },
  { min: 45, title: "THE COST CONTROLLER", text: "Du såg att fallet inte bara handlade om var materialet fanns,\nutan om vad som hände när kedjan inte kommunicerade prioritet.\n\nKostnaden sitter sällan i själva glappet —\nutan i allt som händer efteråt." },
  { min: 0, title: "THE BLAME GAME SURVIVOR", text: "Du fastnade först i fel spår, men hittade delar av rotorsaken.\n\nDet är ofta precis så verkliga logistikcase ser ut:\ntre system som alla visar grönt,\noch en produktion som står still." },
];

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

/* ─── COMPONENT ─── */

export default function Kolli404() {
  useEffect(() => { loadFonts(); }, []);

  const [phase, setPhase] = useState("intro");
  const [openedClues, setOpenedClues] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [observations, setObservations] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [clueState, setClueState] = useState({});
  const [currentPick, setCurrentPick] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [theoryAnswers, setTheoryAnswers] = useState({});
  const [theoryLocked, setTheoryLocked] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTheoryPanel, setShowTheoryPanel] = useState(false);
  const [caseExpanded, setCaseExpanded] = useState(false);
  const ref = useRef(null);

  const scroll = () => setTimeout(() => ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" }), 100);
  const ac = CLUES.find(c => c.id === activeId);
  const answeredCount = Object.values(clueState).filter(s => s.answered).length;
  const canTheory = answeredCount >= 4 && !theoryLocked;
  const canLock = Object.keys(theoryAnswers).length === 4;
  const theoryRight = THEORY_QS.filter(q => theoryAnswers[q.id] === q.correctKey).length;
  const obsCount = observations.length;
  const score = Math.max(0, Math.min(100, obsCount * 15 + theoryRight * 10 - wrongGuesses * 5));
  const profile = PROFILES.find(p => score >= p.min) || PROFILES[PROFILES.length - 1];

  function openClue(id) {
    if (!openedClues.includes(id)) setOpenedClues(p => [...p, id]);
    setActiveId(id);
    setCurrentPick(null);
    setFeedback(null);
    scroll();
  }

  function attempt(clue, key) {
    const st = clueState[clue.id] || { attempts: 0, answered: false, correct: false };
    if (st.answered) return;
    setCurrentPick(key);
    const correct = key === clue.question.correctKey;
    const newAttempts = st.attempts + 1;
    if (correct) {
      if (!observations.includes(clue.observationKey)) setObservations(p => [...p, clue.observationKey]);
      setClueState(p => ({ ...p, [clue.id]: { attempts: newAttempts, answered: true, correct: true } }));
      setFeedback("correct");
    } else {
      setWrongGuesses(p => p + 1);
      if (newAttempts >= 2) {
        setClueState(p => ({ ...p, [clue.id]: { attempts: newAttempts, answered: true, correct: false } }));
        setFeedback("locked");
      } else {
        setClueState(p => ({ ...p, [clue.id]: { ...st, attempts: newAttempts } }));
        setFeedback("wrong");
      }
    }
    scroll();
  }

  function copyResult() {
    const t = `Jag löste Kolli 404 och blev ${profile.title}.\nImportdeklarationen hade status Frigjord. Transportören hade levererat. 3PL hade tagit emot.\nProduktionen saknade fortfarande materialet.\n\nKan du hitta glappet?`;
    navigator.clipboard?.writeText(t).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2400); });
  }

  /* ─── RENDER HELPERS ─── */

  const Btn = ({ children, onClick, disabled, variant = "primary", glow = false }) => (
    <button onClick={onClick} disabled={disabled}
      className={glow ? "k404-border-glow" : ""}
      style={{
        display: "block", width: "100%", fontFamily: C.mono, fontSize: 12, letterSpacing: "0.18em",
        padding: "14px 0", cursor: disabled ? "default" : "pointer", fontWeight: 500, marginTop: 8,
        transition: "all 0.3s",
        ...(variant === "primary"
          ? { background: C.goldSoft, border: `1px solid ${C.goldBorder}`, color: C.gold }
          : { background: "transparent", border: `1px solid ${C.bdr}`, color: C.muted }),
        ...(disabled ? { opacity: 0.4 } : {}),
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = "rgba(200,164,93,0.12)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(200,164,93,0.08)"; } }}
      onMouseLeave={e => { e.currentTarget.style.background = variant === "primary" ? C.goldSoft : "transparent"; e.currentTarget.style.boxShadow = "none"; }}
    >{children}</button>
  );

  function renderFields(fields) {
    return fields.map((f, i) => {
      const found = f.ck && observations.includes(f.ck);
      return (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.bdr}`, flexWrap: "wrap", gap: 4 }}>
          <span style={{ fontFamily: C.mono, fontSize: 11, color: C.dim, letterSpacing: "0.05em", minWidth: 90 }}>{f.label}</span>
          <span style={{ fontFamily: C.mono, fontSize: 12, color: found ? C.gold : C.txt, textAlign: "right", flex: 1, fontWeight: found ? 600 : 400, transition: "color 0.3s" }}>{f.value}</span>
        </div>
      );
    });
  }

  function renderTracking(data) {
    return data.map((t, i) => (
      <div key={i} style={{ display: "flex", alignItems: "flex-start", position: "relative", paddingBottom: 16, paddingLeft: 22 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", border: `1.5px solid ${C.muted}`, position: "absolute", left: 0, top: 5, background: "transparent" }} />
        {i < data.length - 1 && <div style={{ position: "absolute", left: 2.5, top: 14, width: 1, height: "calc(100% - 8px)", background: C.bdr }} />}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontFamily: C.mono, fontSize: 11, color: C.dim }}>{t.time}</span>
          <span style={{ fontFamily: C.sans, fontSize: 13, color: C.txt, fontWeight: 500 }}>{t.status}</span>
          {t.loc && <span style={{ fontFamily: C.sans, fontSize: 11, color: C.dim, fontStyle: "italic" }}>{t.loc}</span>}
        </div>
      </div>
    ));
  }

  function renderEmail(em) {
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
      </div>
    );
  }

  function renderClue(clue) {
    return (
      <div style={{ background: C.card, border: `1px solid ${C.bdr}`, padding: "22px 22px", marginBottom: 12 }}>
        <div style={{ fontFamily: C.mono, fontSize: 11, letterSpacing: "0.15em", color: C.muted, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.bdr}` }}>{clue.docTitle}</div>
        {clue.fields && renderFields(clue.fields)}
        {clue.tracking && <div style={{ paddingLeft: 4, paddingTop: 4 }}>{renderTracking(clue.tracking)}</div>}
        {clue.email && renderEmail(clue.email)}
      </div>
    );
  }

  function renderQuestion(clue) {
    const cs = clueState[clue.id] || { attempts: 0, answered: false };
    const q = clue.question;
    const isActive = activeId === clue.id;
    return (
      <div style={{ background: C.panel, border: `1px solid ${C.bdr}`, padding: "20px 20px 16px" }}>
        <p style={{ fontFamily: C.sans, fontSize: 14, color: C.txt, marginBottom: 4, fontWeight: 500 }}>{q.prompt}</p>
        {!cs.answered && <p style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, marginBottom: 14, letterSpacing: "0.05em" }}>
          {cs.attempts === 0 ? "Du har två försök." : "Sista försöket."}
        </p>}
        {cs.answered && <div style={{ height: 12 }} />}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {q.options.map(opt => {
            const sel = currentPick === opt.key && isActive;
            const isCorr = opt.key === q.correctKey;
            let bgC = C.card, brd = C.bdr, col = C.txt;
            if (cs.answered && isActive) {
              if (isCorr) { bgC = C.greenSoft; brd = C.green; col = "#b8d4c0"; }
              else if (sel) { bgC = C.redSoft; brd = C.red; col = "#d4b8a8"; }
            } else if (feedback === "wrong" && sel && isActive) {
              bgC = C.redSoft; brd = C.red; col = "#d4b8a8";
            }
            return (
              <button key={opt.key} disabled={cs.answered}
                style={{ textAlign: "left", fontFamily: C.sans, fontSize: 13, color: col, background: bgC, border: `1px solid ${brd}`, padding: "10px 14px", cursor: cs.answered ? "default" : "pointer", lineHeight: 1.5, transition: "all 0.15s" }}
                onClick={() => attempt(clue, opt.key)}
                onMouseEnter={e => { if (!cs.answered) e.currentTarget.style.borderColor = C.bdrStrong; }}
                onMouseLeave={e => { if (!cs.answered) e.currentTarget.style.borderColor = C.bdr; }}
              >{opt.text}</button>
            );
          })}
        </div>
        {isActive && feedback === "correct" && (
          <div style={{ marginTop: 14, padding: "12px 14px", background: C.greenSoft, border: `1px solid rgba(111,143,114,0.25)`, fontSize: 13, lineHeight: 1.7, color: "#b8d4c0", display: "flex", gap: 10, fontFamily: C.sans }}>
            <span style={{ fontFamily: C.mono, fontWeight: 600, flexShrink: 0 }}>✓</span><span>{q.insight}</span>
          </div>
        )}
        {isActive && feedback === "wrong" && !cs.answered && (
          <div style={{ marginTop: 14, padding: "12px 14px", background: C.redSoft, border: `1px solid rgba(159,79,70,0.25)`, fontSize: 13, lineHeight: 1.7, color: "#d4b8a8", display: "flex", gap: 10, fontFamily: C.sans }}>
            <span style={{ fontFamily: C.mono, fontWeight: 600, flexShrink: 0 }}>—</span><span>{q.wrongHint}</span>
          </div>
        )}
        {isActive && feedback === "locked" && (
          <div style={{ marginTop: 14, padding: "12px 14px", background: C.redSoft, border: `1px solid rgba(159,79,70,0.25)`, fontSize: 13, lineHeight: 1.7, color: "#d4b8a8", display: "flex", gap: 10, fontFamily: C.sans }}>
            <span style={{ fontFamily: C.mono, fontWeight: 600, flexShrink: 0 }}>✗</span><span>Observationen missades. Rätt svar: {q.options.find(o => o.key === q.correctKey)?.text}</span>
          </div>
        )}
      </div>
    );
  }

  /* ─── INTRO ─── */
  if (phase === "intro") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.txt, fontFamily: C.sans, position: "relative", overflow: "hidden" }}>
        {/* Subtle background grid */}
        <div style={{ position: "fixed", inset: 0, opacity: 0.025, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(200,164,93,0.4) 1px, transparent 0)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
        {/* Slow scanline */}
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(200,164,93,0.15) 50%, transparent 100%)", animation: "k404scanline 8s linear infinite", pointerEvents: "none", zIndex: 1 }} />
        
        <div style={{ maxWidth: 580, margin: "0 auto", padding: "52px 28px 60px", position: "relative", zIndex: 2 }}>
          <div className="k404-fade" style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.2em", color: C.gold, marginBottom: 24 }}>LOGISTIKGÅTA</div>
          <h1 className="k404-card-enter" style={{ fontFamily: C.mono, fontSize: "clamp(28px,8vw,42px)", fontWeight: 600, color: C.txt, letterSpacing: "0.08em", margin: "0 0 6px", lineHeight: 1.15 }}>KOLLI 404</h1>
          <p className="k404-card-enter" style={{ fontFamily: C.mono, fontSize: 11, color: C.dim, letterSpacing: "0.12em", marginBottom: 28 }}>FRIGJORD DEKLARATION, SAKNAT MATERIAL</p>

          {/* Hero image */}
          <div className="k404-doc-enter" style={{ marginBottom: 28, position: "relative", overflow: "hidden", border: `1px solid ${C.bdr}` }}>
            <img src="/public/hero-intro.png" alt="" style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

          <div className="k404-doc-enter" style={{ background: C.card, border: `1px solid ${C.bdr}`, padding: "32px 28px", marginBottom: 36 }}>
            <div style={{ textAlign: "right", marginBottom: 18 }}>
              <span className="k404-border-glow" style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.2em", color: C.red, border: `1px solid ${C.red}`, padding: "3px 12px", display: "inline-block" }}>OLÖST</span>
            </div>

            <div style={{ fontFamily: C.mono, fontSize: 9, color: C.dim, letterSpacing: "0.08em", lineHeight: 2, marginBottom: 18, borderBottom: `1px solid ${C.bdr}`, paddingBottom: 14 }}>
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

            {/* ── Visual flow diagram ── */}
            <div className="k404-doc-enter" style={{ margin: "20px 0 24px", padding: "20px 16px", background: C.bg, border: `1px solid ${C.bdr}`, borderRadius: 2 }}>
              <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.15em", color: C.dim, marginBottom: 16 }}>LEVERANSKEDJA</div>
              
              {/* Flow nodes */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 4 }}>
                {[
                  { label: "AVSÄNDARE", sub: "Manchester, UK", status: "ok" },
                  { label: "IMPORT", sub: "Terminal SE", status: "ok" },
                  { label: "3PL", sub: "Värnamo", status: "warn" },
                  { label: "PRODUKTION", sub: "NordAxel", status: "fail" },
                ].map((node, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%", margin: "0 auto 6px",
                        background: node.status === "ok" ? C.green : node.status === "warn" ? "#B8963C" : C.red,
                        boxShadow: node.status === "fail" ? `0 0 10px ${C.red}66` : node.status === "ok" ? `0 0 8px ${C.green}44` : "none",
                        animation: node.status === "fail" ? "k404glow 2s ease-in-out infinite" : "none",
                      }} />
                      <div style={{ fontFamily: C.mono, fontSize: 9, color: node.status === "fail" ? C.red : C.muted, letterSpacing: "0.08em", marginBottom: 2 }}>{node.label}</div>
                      <div style={{ fontFamily: C.sans, fontSize: 10, color: C.dim }}>{node.sub}</div>
                    </div>
                    {i < 3 && (
                      <div style={{ width: 24, height: 1, background: i < 2 ? C.green : `${C.red}88`, flexShrink: 0, margin: "0 2px", marginBottom: 16 }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Status summary */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  { sys: "Transportör", status: "Levererat till 3PL", color: C.green },
                  { sys: "Tullombud", status: "Deklaration Frigjord", color: C.green },
                  { sys: "3PL WMS", status: "Mottaget / ej releasat", color: "#B8963C" },
                  { sys: "Produktion", status: "Material saknas", color: C.red },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: i === 3 ? C.redSoft : "transparent", border: `1px solid ${i === 3 ? `${C.red}33` : C.bdr}` }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: C.mono, fontSize: 9, color: C.dim, letterSpacing: "0.05em" }}>{s.sys}</div>
                      <div style={{ fontFamily: C.sans, fontSize: 11, color: s.color === C.red ? C.red : C.muted }}>{s.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p style={{ fontFamily: C.sans, fontSize: 14, color: C.muted, lineHeight: 1.9, marginBottom: 0 }}>Ändå finns materialet inte tillgängligt för produktionen.</p>

            <p style={{ fontFamily: C.serif, fontStyle: "italic", color: C.gold, marginTop: 24, fontSize: 15 }}>Alla system visar något som ser korrekt ut. Ingen status visar hela kedjan.</p>

            <div style={{ height: 1, background: C.bdr, margin: "26px 0" }} />

            <div style={{ fontFamily: C.sans, fontSize: 14, color: C.muted, lineHeight: 1.9 }}>
              <p style={{ marginBottom: 8 }}>Du har fått tillgång till interna underlag från transportör, tullombud, 3PL och kund.</p>
              <p style={{ marginTop: 16, fontWeight: 500, color: C.txt }}>Din uppgift: hitta vilken kedja av händelser som gjorde att alla kunde säga "vi gjorde rätt" — samtidigt som leveransen blev fel.</p>
            </div>
          </div>

          <Btn glow onClick={() => setPhase("investigate")}>ÖPPNA CASE FILE</Btn>
        </div>
      </div>
    );
  }

  /* ─── INVESTIGATE / THEORY / SOLUTION ─── */
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.txt, fontFamily: C.sans, position: "relative", overflow: "hidden" }}>
      {/* Background grid */}
      <div style={{ position: "fixed", inset: 0, opacity: 0.025, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(200,164,93,0.4) 1px, transparent 0)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
      {/* Scanline */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(200,164,93,0.12) 50%, transparent 100%)", animation: "k404scanline 8s linear infinite", pointerEvents: "none", zIndex: 1 }} />
      
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: `1px solid ${C.bdr}`, background: C.bg, position: "sticky", top: 0, zIndex: 10 }}>
        <span style={{ fontFamily: C.mono, fontSize: 11, letterSpacing: "0.15em", color: C.gold, fontWeight: 500 }}>K404-2026</span>
        {/* Observation dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: "50%",
              background: i < obsCount ? C.gold : "transparent",
              border: `1.5px solid ${i < obsCount ? C.gold : C.dim}`,
              transition: "all 0.5s ease",
              boxShadow: i < obsCount ? `0 0 8px ${C.goldGlow}` : "none",
            }} />
          ))}
          <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.08em", marginLeft: 6 }}>{obsCount}/6</span>
        </div>
      </header>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 22px 80px", overflowY: "auto", maxHeight: "calc(100vh - 48px)" }} ref={ref}>

        {!showSolution && (
          <>
            {/* Evidence overview image */}
            <div className="k404-fade" style={{ marginBottom: 18, overflow: "hidden", border: `1px solid ${C.bdr}`, position: "relative" }}>
              <img src="/public/hero-evidence.png" alt="" style={{ width: "100%", height: "auto", display: "block", opacity: 0.9 }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: `linear-gradient(transparent, ${C.bg})` }} />
            </div>

            {/* Case context — expandable */}
            <div className="k404-fade" style={{ background: C.card, border: `1px solid ${C.bdr}`, padding: "16px 18px", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, cursor: "pointer" }} onClick={() => setCaseExpanded(!caseExpanded)}>
                <div style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.15em", color: C.gold }}>ÄRENDET</div>
                <span style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, letterSpacing: "0.08em" }}>{caseExpanded ? "DÖLJ ▴" : "VISA MER ▾"}</span>
              </div>
              <p style={{ fontFamily: C.serif, fontSize: 14, fontStyle: "italic", color: C.txt, lineHeight: 1.6, marginBottom: 12, borderLeft: `2px solid ${C.goldBorder}`, paddingLeft: 14 }}>
                "Ni säger att materialet är levererat. Men vår lina står fortfarande utan reservdelen."
              </p>

              {/* Expanded: full case details */}
              {caseExpanded && (
                <div className="k404-fade" style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.bdr}` }}>
                  <p style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, lineHeight: 1.8, marginBottom: 10 }}>
                    En akut reservdel från Storbritannien (Northbridge Components, Manchester) skulle vara på plats i produktionen hos NordAxel Manufacturing i Värnamo före 14:00.
                  </p>
                  <p style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, lineHeight: 1.8, marginBottom: 10 }}>
                    Godset kräver importhantering eftersom det kommer från land utanför EU. Tullombudet ScanBroker hanterar importdeklarationen. ScanDist 3PL i Värnamo tar emot och lagerhanterar.
                  </p>
                  <p style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, lineHeight: 1.8, marginBottom: 10 }}>
                    Alla system visar grön status. Men materialet är inte operativt tillgängligt för produktionen.
                  </p>
                  <p style={{ fontFamily: C.sans, fontSize: 13, color: C.txt, lineHeight: 1.8, fontWeight: 500 }}>
                    Din uppgift: hitta vilken kedja av händelser som gjorde att alla kunde säga "vi gjorde rätt" — samtidigt som leveransen blev fel.
                  </p>
                </div>
              )}

              {/* Compact inline flow */}
              <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", marginTop: caseExpanded ? 12 : 6 }}>
                {[
                  { label: "Transportör", ok: true },
                  { label: "Tullombud", ok: true },
                  { label: "3PL WMS", ok: null },
                  { label: "Produktion", ok: false },
                ].map((n, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", background: n.ok === false ? C.redSoft : "transparent", borderRadius: 2 }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: n.ok === true ? C.green : n.ok === null ? "#B8963C" : C.red,
                        animation: n.ok === false ? "k404glow 2s ease-in-out infinite" : "none",
                      }} />
                      <span style={{ fontFamily: C.mono, fontSize: 9, color: n.ok === false ? C.red : C.muted, letterSpacing: "0.04em" }}>{n.label}</span>
                    </div>
                    {i < 3 && <span style={{ color: C.dim, fontSize: 10, margin: "0 2px" }}>→</span>}
                  </div>
                ))}
              </div>
            </div>

            <p className="k404-fade" style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.15em", color: C.dim, marginBottom: 14, textTransform: "uppercase" }}>Granska bevis</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 22 }}>
              {CLUES.map((c, idx) => {
                const opened = openedClues.includes(c.id);
                const active = activeId === c.id;
                const cs = clueState[c.id];
                const hasObs = observations.includes(c.observationKey);
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
                    {hasObs && <div style={{ fontFamily: C.mono, fontSize: 9, color: C.green, marginTop: 6, letterSpacing: "0.1em" }}>OBSERVATION HITTAD</div>}
                    {cs?.answered && !hasObs && <div style={{ fontFamily: C.mono, fontSize: 9, color: C.dim, marginTop: 6, letterSpacing: "0.1em" }}>GRANSKAD</div>}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {ac && !showSolution && (
          <div className="k404-doc-enter" key={ac.id} style={{ marginBottom: 20 }}>
            {renderClue(ac)}
            {renderQuestion(ac)}
          </div>
        )}

        {canTheory && !showSolution && !showTheoryPanel && (
          <div className="k404-card-enter" style={{ background: C.card, border: `1px solid ${C.goldBorder}`, padding: "18px 16px", marginBottom: 20 }}>
            <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.15em", color: C.gold, marginBottom: 6 }}>TILLRÄCKLIGT UNDERLAG</div>
            <p style={{ fontFamily: C.sans, fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 12 }}>
              Du har granskat {answeredCount} av 6 underlag. Du kan låsa din teori nu — eller granska fler bevis först.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}><Btn onClick={() => setShowTheoryPanel(true)}>LÅS TEORI</Btn></div>
              <div style={{ flex: 1 }}><Btn variant="secondary" onClick={() => ref.current?.scrollTo({ top: 0, behavior: "smooth" })}>GRANSKA FLER</Btn></div>
            </div>
          </div>
        )}

        {showTheoryPanel && !theoryLocked && !showSolution && (
          <div style={{ background: C.card, border: `1px solid ${C.goldBorder}`, padding: "22px 18px", marginBottom: 20 }}>
            <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.15em", color: C.gold, marginBottom: 4 }}>TEORILÅSNING</div>
            <p style={{ fontFamily: C.sans, fontSize: 12, color: C.muted, marginBottom: 20 }}>Lås din teori innan du öppnar lösningen.</p>
            {THEORY_QS.map(tq => (
              <div key={tq.id} style={{ marginBottom: 20 }}>
                <p style={{ fontFamily: C.sans, fontSize: 12, color: C.txt, marginBottom: 8, fontWeight: 500 }}>{tq.prompt}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {tq.options.map(o => (
                    <button key={o.key}
                      style={{
                        textAlign: "left", fontFamily: C.sans, fontSize: 11, lineHeight: 1.5,
                        color: theoryAnswers[tq.id] === o.key ? C.txt : C.muted,
                        background: theoryAnswers[tq.id] === o.key ? C.goldSoft : C.bg,
                        border: `1px solid ${theoryAnswers[tq.id] === o.key ? C.goldBorder : C.bdr}`,
                        padding: "8px 12px", cursor: "pointer", transition: "all 0.15s",
                      }}
                      onClick={() => setTheoryAnswers(p => ({ ...p, [tq.id]: o.key }))}
                    >{o.text}</button>
                  ))}
                </div>
              </div>
            ))}
            {canLock && <Btn onClick={() => { setTheoryLocked(true); scroll(); }}>LÅS TEORI</Btn>}
          </div>
        )}

        {theoryLocked && !showSolution && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <p style={{ fontFamily: C.mono, fontSize: 11, color: C.dim, letterSpacing: "0.15em", marginBottom: 16 }}>TEORI LÅST</p>
            <Btn glow onClick={() => { setShowSolution(true); setActiveId(null); scroll(); }}>ÖPPNA LÖSNINGEN</Btn>
          </div>
        )}

        {/* ─── SOLUTION ─── */}
        {showSolution && (
          <div className="k404-doc-enter" style={{ paddingBottom: 40 }}>
            <div style={{ background: C.card, border: `1px solid ${C.goldBorder}`, padding: "28px 22px", textAlign: "center", marginBottom: 34 }}>
              <div style={{ fontFamily: C.mono, fontSize: 9, color: C.dim, letterSpacing: "0.15em", marginBottom: 4 }}>Teori: {theoryRight} av 4 rätt</div>
              <div style={{ fontFamily: C.mono, fontSize: 9, color: C.dim, letterSpacing: "0.15em", marginBottom: 16 }}>Observationer: {obsCount} av 6 hittade</div>
              <h2 style={{ fontFamily: C.mono, fontSize: 18, color: C.gold, fontWeight: 600, marginBottom: 14, letterSpacing: "0.1em" }}>{profile.title}</h2>
              <p style={{ fontFamily: C.sans, fontSize: 12, lineHeight: 1.8, color: C.muted, maxWidth: 400, margin: "0 auto", whiteSpace: "pre-line" }}>{profile.text}</p>
              <div style={{ height: 3, background: C.bdr, marginTop: 22, borderRadius: 1, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${score}%`, background: `linear-gradient(90deg, ${C.gold}, #A88A44)`, transition: "width 1.2s ease" }} />
              </div>
              <p style={{ fontFamily: C.mono, fontSize: 9, color: C.dim, marginTop: 8, letterSpacing: "0.1em" }}>UTREDNINGSPOÄNG: {score}</p>
              <div style={{ marginTop: 18 }}>
                <button onClick={copyResult} style={{
                  fontFamily: C.mono, fontSize: 9, letterSpacing: "0.15em", color: copied ? C.green : C.gold,
                  background: "transparent", border: `1px solid ${copied ? C.green : C.goldBorder}`, padding: "8px 18px", cursor: "pointer", transition: "all 0.2s",
                }}>{copied ? "KOPIERAT" : "KOPIERA RESULTAT"}</button>
              </div>
            </div>

            {/* Closure image */}
            <div style={{ marginBottom: 28, overflow: "hidden", border: `1px solid ${C.bdr}`, position: "relative" }}>
              <img src="/public/hero-closure.png" alt="" style={{ width: "100%", height: "auto", display: "block" }} />
            </div>

            <div style={{ marginBottom: 34 }}>
              <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.2em", color: C.dim, marginBottom: 6 }}>CASE CLOSURE</div>
              <h2 style={{ fontFamily: C.mono, fontSize: 14, letterSpacing: "0.1em", color: C.txt, marginBottom: 26, paddingBottom: 14, borderBottom: `1px solid ${C.bdr}`, fontWeight: 500 }}>KOLLI 404</h2>

              {[
                { num: "01", title: "UTGÅNGSLÄGE", text: "Godset var aldrig fysiskt försvunnet.\n\nImportdeklarationen hade status Frigjord. Transportören hade levererat till 3PL. 3PL hade tagit emot kollit i WMS.\n\nMen materialet var inte operativt tillgängligt för produktionen.\n\nFelet låg inte i en enskild status, utan i antagandet att statusarna betydde samma sak." },
                { num: "02", title: "REFERENSGLAPPET", text: "3PL matchade inleveransen mot invoice ref NCL-88421, medan kundens förväntade inleverans låg på PO-7749-A.\n\nUtan matchning mot förväntad inleverans placerades enheten på avvikelseplats med spärrad intern release." },
                { num: "03", title: "STATUSGLAPPET", text: "Transportörens leveransstatus avsåg leverans till 3PL, men tolkades som att materialet var tillgängligt för produktionen.\n\nImportdeklarationen hade status Frigjord. Det innebar att varorna kunde lämnas ut ur importflödet, men inte att 3PL:s interna dokumentkontroll, referensmatchning eller lagerrelease var stängd.\n\nTre system — transportör, tullombud, 3PL — visade var sin \"rätt\" status. Ingen visade hela kedjan." },
                { num: "04", title: "PRIORITETSGLAPPET", text: "När ärendet till slut kopplades till rätt PO skapades outbound-ordern som standard replenishment med normal prioritet.\n\nTidsfönstret — produktionskritiskt före 14:00 — var redan passerat vid 14:32.\n\nÄven om ordern hade flaggats som urgent vid den tidpunkten hade materialet inte nått produktionslinan i tid." },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: 22 }}>
                  <div style={{ fontFamily: C.mono, fontSize: 9, color: C.gold, letterSpacing: "0.1em", marginBottom: 6 }}>{s.num} — {s.title}</div>
                  <p style={{ fontFamily: C.sans, fontSize: 12, lineHeight: 1.8, color: C.muted, whiteSpace: "pre-line" }}>{s.text}</p>
                </div>
              ))}
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.bdr}`, padding: "20px 18px", marginBottom: 34 }}>
              <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.15em", color: C.dim, marginBottom: 6 }}>05 — KOSTNADSEFFEKT</div>
              <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.1em", color: C.muted, marginBottom: 14 }}>DEN SYNLIGA KOSTNADEN</div>
              {COSTS_VISIBLE.map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: C.mono, fontSize: 11, color: c.bold ? C.gold : C.txt, padding: "5px 0", borderBottom: c.bold ? "none" : `1px solid ${C.bdr}`, fontWeight: c.bold ? 600 : 400, ...(c.bold ? { borderTop: `1px solid ${C.bdr}`, marginTop: 6, paddingTop: 10 } : {}) }}>
                  <span>{c.l}</span><span>{c.v}</span>
                </div>
              ))}
              <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.1em", color: C.muted, marginTop: 26, marginBottom: 10 }}>DEN DOLDA KOSTNADEN</div>
              {COSTS_HIDDEN.map((c, i) => <p key={i} style={{ fontFamily: C.sans, fontSize: 12, color: C.dim, fontStyle: "italic", marginBottom: 3 }}>{c}</p>)}
            </div>

            <div style={{ textAlign: "center", padding: "28px 0 16px" }}>
              <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.15em", color: C.dim, marginBottom: 18 }}>06 — NOTERING</div>
              <p style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, marginBottom: 4 }}>Det här var ett fiktivt fall.</p>
              <p style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, marginBottom: 16 }}>Men mönstret är verkligt.</p>
              <div style={{ fontFamily: C.sans, fontSize: 13, color: C.muted, lineHeight: 1.8, marginBottom: 16 }}>
                <p style={{ marginBottom: 3 }}>Importdeklarationen hade status Frigjord.</p>
                <p style={{ marginBottom: 3 }}>Transportören hade levererat.</p>
                <p style={{ marginBottom: 3 }}>3PL hade tagit emot.</p>
                <p style={{ marginTop: 10, marginBottom: 0 }}>Produktionen saknade fortfarande materialet.</p>
              </div>
              <p style={{ fontFamily: C.serif, fontSize: 14, fontStyle: "italic", color: C.txt, marginBottom: 24, lineHeight: 1.6 }}>Alla hade rätt i sitt system.<br />Ingen hade hela bilden.</p>
              <div style={{ height: 1, background: C.bdr, maxWidth: 60, margin: "0 auto 18px" }} />
              <p style={{ fontFamily: C.mono, fontSize: 12, letterSpacing: "0.2em", color: C.gold, fontWeight: 500, marginBottom: 4 }}>DearPriceHunter</p>
              <p style={{ fontFamily: C.mono, fontSize: 9, color: C.dim, letterSpacing: "0.1em" }}>Beslutsstöd för kostnad, risk och logistikdata.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
