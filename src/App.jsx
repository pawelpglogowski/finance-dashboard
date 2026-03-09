import React, { useState, useMemo } from "react";

// ── Developer roster (replace with real names later) ─────────────────────────
const DEVELOPERS = [
  { key:"Dev_Adam",    label:"Adam K.",    color:"#4e342e" },
  { key:"Dev_Tomasz",  label:"Tomasz W.",  color:"#6d4c41" },
  { key:"Dev_Karolina",label:"Karolina S.",color:"#8d6e63" },
  { key:"Dev_Piotr",   label:"Piotr M.",   color:"#795548" },
  { key:"Dev_Ewa",     label:"Ewa B.",     color:"#a1887f" },
];

// ── Category definitions & P&L mapping ──────────────────────────────────────
const INVOICE_CATEGORIES = [
  { key:"Sales",          label:"Sales",          plLine:"Revenue",        type:"income", color:"#1976d2" },
  // Developers — one per person
  ...DEVELOPERS.map(d => ({ key:d.key, label:d.label, plLine:d.label, type:"cost", color:d.color, group:"Developers" })),
  // Operations group
  { key:"Operations",     label:"Operations",     plLine:"Operations",     type:"cost",   color:"#e53935", group:"Operations" },
  { key:"Office",         label:"Office",         plLine:"Office",         type:"cost",   color:"#f57c00", group:"Operations" },
  { key:"Leasing",        label:"Leasing",        plLine:"Leasing",        type:"cost",   color:"#f9a825", group:"Operations" },
  { key:"Legal",          label:"Legal",          plLine:"Legal",          type:"cost",   color:"#6a1b9a", group:"Operations" },
  { key:"Accounting",     label:"Accounting",     plLine:"Accounting",     type:"cost",   color:"#00838f", group:"Operations" },
  { key:"Admin",          label:"Admin",          plLine:"Admin",          type:"cost",   color:"#2e7d32", group:"Operations" },
  // Sales group
  { key:"SalesTools",     label:"Sales Tools",    plLine:"Sales Tools",    type:"cost",   color:"#0277bd", group:"Sales" },
  { key:"BizTrips",       label:"Business Trips", plLine:"Business Trips", type:"cost",   color:"#00695c", group:"Sales" },
  { key:"Maciej",         label:"Maciej",         plLine:"Maciej",         type:"cost",   color:"#4527a0", group:"Sales" },
  // Management group
  { key:"Pawel",          label:"Paweł",          plLine:"Paweł",          type:"cost",   color:"#ad1457", group:"Management" },
  { key:"Michal",         label:"Michał",         plLine:"Michał",         type:"cost",   color:"#558b2f", group:"Management" },
  { key:"Uncategorized",  label:"Uncategorized",  plLine:null,             type:null,     color:"#bdbdbd" },
];
const CAT_MAP = Object.fromEntries(INVOICE_CATEGORIES.map(c => [c.key, c]));

// ── Static seed data ─────────────────────────────────────────────────────────
const MONTHS     = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const ALL_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// 2025 actuals (prior year for Y/Y) — full 12 months
const REV_2025 = [195606,198771,204094,222964,212479,198428,236378,203941,167186,160485,291576,179231];
const YEARLY_REV_TARGET   = 3_200_000; // placeholder — update with real target
const MONTHLY_REV_TARGET  = YEARLY_REV_TARGET / 12;
const TARGET_FTE          = 18;        // placeholder required FTEs to meet target

const seedInvoices = [
  // ── Sales (revenue) invoices ─────────────────────────────────────────────
  { id:"INV-2024-0892", client:"Meridian Corp",     amount:84500,  currency:"EUR", issued:"2024-05-12", due:"2024-06-11", status:"Overdue",  category:"Sales",      projectId:"meridian-corp"     },
  { id:"INV-2024-0891", client:"Vantage Systems",   amount:32100,  currency:"EUR", issued:"2024-05-18", due:"2024-06-17", status:"Overdue",  category:"Sales",      projectId:"vantage-systems"   },
  { id:"INV-2024-0893", client:"Solara Industries", amount:118400, currency:"EUR", issued:"2024-05-28", due:"2024-06-27", status:"Pending",  category:"Sales",      projectId:"solara-industries" },
  { id:"INV-2024-0894", client:"NorthBridge LLC",   amount:47200,  currency:"USD", issued:"2024-06-01", due:"2024-07-01", status:"Pending",  category:"Sales",      projectId:"northbridge-llc"   },
  { id:"INV-2024-0890", client:"Meridian Corp",     amount:71300,  currency:"EUR", issued:"2024-04-15", due:"2024-05-15", status:"Paid",     category:"Sales",      projectId:"meridian-corp"     },
  { id:"INV-2024-0889", client:"ClearPath Tech",    amount:55900,  currency:"GBP", issued:"2024-04-10", due:"2024-05-10", status:"Paid",     category:"Sales",      projectId:"clearpath-tech"    },
  // ── Operations & overhead ────────────────────────────────────────────────
  { id:"INV-2024-0301", client:"AWS",               amount:5200,   currency:"USD", issued:"2024-04-01", due:"2024-04-01", status:"Paid",     category:"Operations" },
  { id:"INV-2024-0302", client:"WeWork",            amount:8500,   currency:"PLN", issued:"2024-04-01", due:"2024-04-15", status:"Paid",     category:"Leasing"    },
  { id:"INV-2024-0303", client:"Kancelaria Nowak",  amount:3000,   currency:"PLN", issued:"2024-03-15", due:"2024-04-15", status:"Paid",     category:"Legal"      },
  { id:"INV-2024-0304", client:"BizAir",            amount:2200,   currency:"PLN", issued:"2024-05-10", due:"2024-05-20", status:"Paid",     category:"BizTrips"   },
  { id:"INV-2024-0305", client:"HubSpot",           amount:5200,   currency:"USD", issued:"2024-05-01", due:"2024-05-01", status:"Paid",     category:"SalesTools" },
  // ── Developer invoices (with project assignments) ────────────────────────
  { id:"DEV-2024-0101", client:"Adam K.",           amount:9800,   currency:"PLN", issued:"2024-04-30", due:"2024-05-15", status:"Paid",     category:"Dev_Adam",     projectId:"meridian-corp",     devDays:14, devUnit:"days" },
  { id:"DEV-2024-0102", client:"Adam K.",           amount:9800,   currency:"PLN", issued:"2024-05-31", due:"2024-06-15", status:"Pending",  category:"Dev_Adam",     projectId:"solara-industries", devDays:12, devUnit:"days" },
  { id:"DEV-2024-0103", client:"Tomasz W.",         amount:11200,  currency:"PLN", issued:"2024-04-30", due:"2024-05-15", status:"Paid",     category:"Dev_Tomasz",   projectId:"meridian-corp",     devDays:16, devUnit:"days" },
  { id:"DEV-2024-0104", client:"Tomasz W.",         amount:5600,   currency:"PLN", issued:"2024-05-31", due:"2024-06-15", status:"Pending",  category:"Dev_Tomasz",   projectId:"clearpath-tech",    devDays:8,  devUnit:"days" },
  { id:"DEV-2024-0105", client:"Karolina S.",       amount:8500,   currency:"PLN", issued:"2024-05-31", due:"2024-06-15", status:"Pending",  category:"Dev_Karolina", projectId:"vantage-systems",   devDays:10, devUnit:"days" },
  { id:"DEV-2024-0106", client:"Piotr M.",          amount:10200,  currency:"PLN", issued:"2024-04-30", due:"2024-05-15", status:"Paid",     category:"Dev_Piotr",    projectId:"northbridge-llc",   devDays:80, devUnit:"hours" },
  { id:"DEV-2024-0107", client:"Piotr M.",          amount:5100,   currency:"PLN", issued:"2024-05-31", due:"2024-06-15", status:"Pending",  category:"Dev_Piotr",    projectId:"solara-industries", devDays:40, devUnit:"hours" },
  { id:"DEV-2024-0108", client:"Ewa B.",            amount:7800,   currency:"PLN", issued:"2024-04-30", due:"2024-05-15", status:"Paid",     category:"Dev_Ewa",      projectId:"clearpath-tech",    devDays:10, devUnit:"days" },
];

const seedPOs = [
  { id:"PO-2024-0341", client:"Vantage Systems",   description:"Backend Development Q2",   amount:48200, startDate:"2024-04-01", endDate:"2024-06-30", status:"Active",    unitType:"days",  totalUnits:60,  monthlyBurn:[0,0,0,12,14,10], projectId:"vantage-systems"   },
  { id:"PO-2024-0342", client:"Solara Industries",  description:"Frontend Sprint — Phase 2", amount:38000, startDate:"2024-04-15", endDate:"2024-07-15", status:"Active",    unitType:"days",  totalUnits:45,  monthlyBurn:[0,0,0,0,8,12],   projectId:"solara-industries" },
  { id:"PO-2024-0343", client:"Meridian Corp",      description:"API Integration Project",  amount:72000, startDate:"2024-05-01", endDate:"2024-08-31", status:"Active",    unitType:"hours", totalUnits:480, monthlyBurn:[0,0,0,0,60,80],  projectId:"meridian-corp"     },
  { id:"PO-2024-0344", client:"NorthBridge LLC",    description:"DevOps & Infra Support",   amount:21500, startDate:"2024-03-01", endDate:"2024-06-30", status:"Completed", unitType:"hours", totalUnits:200, monthlyBurn:[40,40,40,40,40,0],projectId:"northbridge-llc"   },
  { id:"PO-2024-0345", client:"ClearPath Tech",     description:"QA Automation Setup",      amount:35000, startDate:"2024-06-01", endDate:"2024-09-01", status:"Active",    unitType:"days",  totalUnits:30,  monthlyBurn:[0,0,0,0,0,5],    projectId:"clearpath-tech"    },
];

const basePL = {
  "Revenue":        [420000,388000,475000,502000,491000,571500],
  // Developers — individual monthly costs (example placeholder rates)
  "Adam K.":        [9800,  9800,  9800,  9800,  9800,  9800 ],
  "Tomasz W.":      [11200, 11200, 11200, 11200, 11200, 11200],
  "Karolina S.":    [8500,  8500,  8500,  8500,  8500,  8500 ],
  "Piotr M.":       [10200, 10200, 10200, 10200, 10200, 10200],
  "Ewa B.":         [7800,  7800,  9800,  9800,  9800,  9800 ],
  // Operations group
  "Operations":     [18000, 16000, 19000, 21000, 18000, 22000],
  "Office":         [4200,  4200,  4200,  4200,  4200,  4200 ],
  "Leasing":        [8500,  8500,  8500,  8500,  8500,  8500 ],
  "Legal":          [3000,  1500,  6000,  2000,  1000,  4500 ],
  "Accounting":     [2800,  2800,  2800,  2800,  2800,  2800 ],
  "Admin":          [3100,  3100,  3100,  3100,  3100,  3100 ],
  // Sales group
  "Sales Tools":    [5200,  5200,  5200,  5200,  5200,  5200 ],
  "Business Trips": [2200,  800,   3100,  1400,  2900,  3800 ],
  "Maciej":         [8500,  8500,  8500,  8500,  8500,  8500 ],
  // Management
  "Paweł":          [7200,  7200,  7200,  7200,  7200,  7200 ],
  "Michał":         [6800,  6800,  6800,  6800,  6800,  6800 ],
};

const cashflowRows = [
  { label:"Operating Activities",  section:true },
  { label:"Net Income",            values:[114000,104000,139000,152500,151000,184800], indent:true },
  { label:"Depreciation",          values:[12000, 12000, 12000, 12500, 12500, 12500],  indent:true },
  { label:"Changes in AR",         values:[-22000,8000,-31000,-14000,5000,-38000],     indent:true },
  { label:"Changes in AP",         values:[9000,-4000,14000,6000,-3000,11000],         indent:true },
  { label:"Net Operating CF",      values:[113000,120000,134000,157000,165500,170300], bold:true, highlight:true },
  { label:"Investing Activities",  section:true },
  { label:"Capex",                 values:[-25000,-8000,-42000,-15000,-8000,-32000],   indent:true },
  { label:"Asset Disposals",       values:[0,5000,0,0,12000,0],                        indent:true },
  { label:"Net Investing CF",      values:[-25000,-3000,-42000,-15000,4000,-32000],    bold:true },
  { label:"Financing Activities",  section:true },
  { label:"Debt Repayment",        values:[-18000,-18000,-18000,-18000,-18000,-18000], indent:true },
  { label:"Net Financing CF",      values:[-18000,-18000,-18000,-18000,-18000,-18000], bold:true },
  { label:"Net Change in Cash",    values:[70000,99000,74000,124000,151500,120300],    bold:true, highlight:true },
];

// ── Default FX rates to EUR (editable in-app) ────────────────────────────────
const DEFAULT_FX = { EUR:1, PLN:0.2330, USD:0.9210, GBP:1.1720 };
const CURRENCIES = ["EUR","PLN","USD","GBP"];
const CUR_SYMBOLS = { EUR:"€", PLN:"zł", USD:"$", GBP:"£" };

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtCur    = (n, cur, sym) => n == null ? "—" : (sym||"€") + Math.abs(Math.round(n)).toLocaleString("de-DE") + (cur&&cur!=="EUR" ? ` ${cur}` : "");
const fmt       = n => n == null ? "—" : "€" + Math.abs(Math.round(n)).toLocaleString("de-DE");
const fmtSigned = n => n == null ? "" : (n < 0 ? "-€" : "€") + Math.abs(Math.round(n)).toLocaleString("de-DE");
const pct       = (n, d) => d === 0 ? "—" : (n / d * 100).toFixed(1) + "%";
const pctNum    = (n, d) => d === 0 ? 0 : (n / d * 100);

const statusColors = {
  Paid:         { bg:"#e8f5e9", text:"#2e7d32" },
  Pending:      { bg:"#fff8e1", text:"#f57f17" },
  Overdue:      { bg:"#fce4ec", text:"#c62828" },
  Approved:     { bg:"#e3f2fd", text:"#1565c0" },
  "In Transit": { bg:"#f3e5f5", text:"#6a1b9a" },
  Delivered:    { bg:"#e8f5e9", text:"#2e7d32" },
};

function monthIndex(dateStr) {
  if (!dateStr) return -1;
  const m = parseInt(dateStr.split("-")[1], 10) - 1;
  return m >= 0 && m < 6 ? m : -1;
}

// ── AI extraction ────────────────────────────────────────────────────────────
async function extractInvoiceFromPDF(base64Data) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64Data } },
          { type: "text", text: `Extract invoice data and return ONLY a JSON object — no markdown, no explanation:
{"id":"invoice number","client":"client or vendor name","amount":12345,"issued":"YYYY-MM-DD","due":"YYYY-MM-DD","status":"Paid or Pending or Overdue","category":"best guess from the list below"}
Use null for any field not found.
Category options (pick the single best match):
- Sales: revenue invoices issued TO customers
- Developers: software development, coding, IT contractors
- Operations: servers, cloud, hosting, infrastructure, SaaS tools
- Office: supplies, equipment, utilities for the office
- Leasing: rent, office space, vehicle leasing
- Legal: lawyers, legal services, notary
- Accounting: accountants, bookkeeping, audit, tax advisory
- Admin: general administrative costs not covered above
- SalesTools: CRM, sales software, lead generation tools
- BizTrips: flights, hotels, transport for business travel
- Maciej: invoices billed by or for Maciej
- Pawel: invoices billed by or for Paweł
- Michal: invoices billed by or for Michał` }
        ]
      }]
    })
  });
  const data = await res.json();
  const text = data.content.map(b => b.text || "").join("");
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

const TABS = ["Overview", "P&L", "Cash Flow", "Invoices", "Engagements"];

// ── Main component ────────────────────────────────────────────────────────────
export default function FinancialDashboard() {
  const [activeTab,         setActiveTab]         = useState("Overview");
  const [fx,                setFx]                = useState(DEFAULT_FX); // editable FX rates
  const [showFxPanel,       setShowFxPanel]       = useState(false);
  const [invFilter,         setInvFilter]         = useState("All");
  const [catFilter,         setCatFilter]         = useState("All");
  const [invView,           setInvView]           = useState("all");   // "all" | "sales" | "costs"
  const [costCatFilter,     setCostCatFilter]     = useState("All");  // "All" or a category key
  const [poFilter,          setPoFilter]          = useState("All");
  const [invoices,          setInvoices]          = useState(seedInvoices);
  const [pos,               setPos]               = useState(seedPOs);
  const [processingFiles,   setProcessingFiles]   = useState([]);
  const [dragOver,          setDragOver]          = useState(false);
  const [editingCat,        setEditingCat]        = useState(null);
  const [editingPO,         setEditingPO]         = useState(null);
  const [editingProject,    setEditingProject]    = useState(null); // invId being assigned project
  const [editingDevProject, setEditingDevProject] = useState(null); // invId being assigned project for dev inv
  const [expandedPO,        setExpandedPO]        = useState(null);
  const [expandedProject,   setExpandedProject]   = useState(null);
  const [bankAccounts,      setBankAccounts]      = useState([
    { id:"pln", currency:"PLN", label:"PKO Bank (PLN)", balance: 284500  },
    { id:"eur", currency:"EUR", label:"Santander (EUR)", balance: 42300  },
    { id:"gbp", currency:"GBP", label:"Barclays (GBP)",  balance: 18750  },
    { id:"usd", currency:"USD", label:"Chase (USD)",     balance: 31200  },
  ]);
  const [editingBank,       setEditingBank]       = useState(null); // id of account being edited
  const [expandedCfMonth,   setExpandedCfMonth]   = useState(null);
  const [engFilter,         setEngFilter]         = useState("All");

  // ── Forecast state ────────────────────────────────────────────────────────
  const [showForecastPanel, setShowForecastPanel] = useState(false);
  const [forecast, setForecast] = useState({
    months: ALL_MONTHS.map((m, i) => ({
      month: i,
      label: m,
      revenue: 0,
      costs: 0,
    })),
    pipeline: [
      // example seed — remove later
      { id:"p1", client:"Potential Client A", value:80000, currency:"EUR", closeMonth:6, probability:70 },
      { id:"p2", client:"Potential Client B", value:45000, currency:"EUR", closeMonth:7, probability:40 },
    ],
  });
  const [editingForecastMonth, setEditingForecastMonth] = useState(null);
  const [newPipeline, setNewPipeline] = useState({ client:"", value:"", currency:"EUR", closeMonth:6, probability:50 });

  // Convert any amount to EUR using current fx rates
  const toEUR = (amount, currency) => (amount || 0) * (fx[currency || "EUR"] || 1);

  // ── Forecast by month (manual + pipeline weighted) ────────────────────────
  const forecastByMonth = useMemo(() => {
    return ALL_MONTHS.map((m, i) => {
      const fm = forecast.months[i];
      const pipelineRev = forecast.pipeline
        .filter(p => p.closeMonth === i)
        .reduce((s, p) => s + toEUR(p.value, p.currency) * (p.probability / 100), 0);
      return {
        month: i,
        label: m,
        revenue: (fm?.revenue || 0) + pipelineRev,
        costs: fm?.costs || 0,
        pipelineRev,
        manualRev: fm?.revenue || 0,
      };
    });
  }, [forecast, fx]);

  // ── Live P&L from invoices ──────────────────────────────────────────────────
  const dynamicPL = useMemo(() => {
    // Accumulate invoice deltas per plLine per month — all converted to EUR
    const d = {};
    INVOICE_CATEGORIES.forEach(c => { if (c.plLine) d[c.plLine] = [0,0,0,0,0,0]; });
    invoices.forEach(inv => {
      const cat = CAT_MAP[inv.category];
      if (!cat || !cat.plLine) return;
      const mi = monthIndex(inv.issued);
      if (mi < 0) return;
      d[cat.plLine][mi] += toEUR(inv.amount, inv.currency);
    });

    const get = key => MONTHS.map((_, i) => (basePL[key]?.[i] || 0) + (d[key]?.[i] || 0));
    const sum = (...arrs) => MONTHS.map((_, i) => arrs.reduce((s, a) => s + a[i], 0));

    const R   = get("Revenue");

    // Developer rows
    const devRows   = DEVELOPERS.map(dev => ({ key: dev.key, label: dev.label, values: get(dev.label) }));
    const devTotals = sum(...devRows.map(r => r.values));

    // After devs → Margin #1
    const m1 = sum(R, devTotals.map(v => -v));

    // Operations group rows
    const opsKeys   = ["Operations","Office","Leasing","Legal","Accounting","Admin"];
    const opsRows   = opsKeys.map(k => ({ label: k, values: get(k) }));
    const opsTotals = sum(...opsRows.map(r => r.values));

    // After ops → Margin #2
    const m2 = sum(m1, opsTotals.map(v => -v));

    // Sales group rows
    const salesKeys   = ["Sales Tools","Business Trips","Maciej"];
    const salesRows   = salesKeys.map(k => ({ label: k, values: get(k) }));
    const salesTotals = sum(...salesRows.map(r => r.values));

    // After sales → Margin #3
    const m3 = sum(m2, salesTotals.map(v => -v));

    // Management group rows
    const mgmtKeys   = ["Paweł","Michał"];
    const mgmtRows   = mgmtKeys.map(k => ({ label: k, values: get(k) }));
    const mgmtTotals = sum(...mgmtRows.map(r => r.values));

    // After mgmt → Margin #4 (Net)
    const m4  = sum(m3, mgmtTotals.map(v => -v));
    const IT  = MONTHS.map((_, i) => Math.round(Math.max(m4[i], 0) * 0.19));
    const NI  = MONTHS.map((_, i) => m4[i] - IT[i]);

    const section = (label, color) => ({ label, section: true, sectionColor: color });
    const subtotal = (label, values, color) => ({ label, values, bold: true, subtotal: true, sectionColor: color });
    const margin   = (label, values, color) => ({ label, values, bold: true, highlight: true, margin: true, sectionColor: color });
    const row      = (label, values, indent2) => ({ label, values, indent: true, indent2: !!indent2 });

    return [
      { label:"Revenue", values:R, bold:true },

      section("① Developers", "#6d4c41"),
      ...devRows.map(r => row(r.label, r.values)),
      subtotal("Total Developers", devTotals, "#6d4c41"),
      margin("Margin #1 · Dev", m1, "#1976d2"),

      section("② Operations", "#e53935"),
      ...opsRows.map(r => row(r.label, r.values)),
      subtotal("Total Operations", opsTotals, "#e53935"),
      margin("Margin #2 · Ops", m2, "#00838f"),

      section("③ Sales", "#4527a0"),
      ...salesRows.map(r => row(r.label, r.values)),
      subtotal("Total Sales", salesTotals, "#4527a0"),
      margin("Margin #3 · Sales", m3, "#4527a0"),

      section("④ Management", "#ad1457"),
      ...mgmtRows.map(r => row(r.label, r.values)),
      subtotal("Total Management", mgmtTotals, "#ad1457"),
      margin("Margin #4 · Net", m4, "#ad1457"),

      { label:"Tax (19%)", values:IT, indent:true },
      { label:"Net Income", values:NI, bold:true, highlight:true, netIncome:true },
    ];
  }, [invoices, fx]);

  // ── PDF handler ──────────────────────────────────────────────────────────────
  const handleFiles = async (files) => {
    const pdfs = Array.from(files).filter(f => f.type === "application/pdf");
    if (!pdfs.length) return;
    setProcessingFiles(prev => [...prev, ...pdfs.map(f => ({ name: f.name, status: "processing" }))]);
    for (const file of pdfs) {
      try {
        const base64 = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result.split(",")[1]);
          r.onerror = rej;
          r.readAsDataURL(file);
        });
        const extracted = await extractInvoiceFromPDF(base64);
        setInvoices(prev => [...prev, { ...extracted, _filename: file.name }]);
        setProcessingFiles(prev => prev.map(p => p.name === file.name ? { ...p, status: "done" } : p));
      } catch {
        setProcessingFiles(prev => prev.map(p => p.name === file.name ? { ...p, status: "error" } : p));
      }
    }
  };

  const updateCategory = (id, category) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, category } : inv));
    setEditingCat(null);
  };

  const linkInvoiceToPO = (invId, poId) => {
    setInvoices(prev => prev.map(inv => inv.id === invId ? { ...inv, poId: poId || null } : inv));
    setEditingPO(null);
  };

  const linkInvoiceToProject = (invId, projectId) => {
    setInvoices(prev => prev.map(inv => inv.id === invId ? { ...inv, projectId: projectId || null } : inv));
    setEditingProject(null);
    setEditingDevProject(null);
  };

  // ── Projects: auto-created from Sales invoice client names ──────────────────
  const projects = useMemo(() => {
    const map = {};
    // Auto-create project per unique client on Sales invoices
    invoices.forEach(inv => {
      if (inv.category !== "Sales" || !inv.client) return;
      const pid = inv.projectId || inv.client.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
      if (!map[pid]) map[pid] = { id: pid, name: inv.client, salesInvoices: [], devInvoices: [] };
      map[pid].salesInvoices.push(inv);
    });
    // Attach dev invoices by projectId
    invoices.forEach(inv => {
      const cat = CAT_MAP[inv.category];
      if (!cat || cat.group !== "Developers" || !inv.projectId) return;
      if (map[inv.projectId]) map[inv.projectId].devInvoices.push(inv);
    });
    // Compute summary per project
    return Object.values(map).map(p => {
      const totalRevenue  = p.salesInvoices.reduce((s,i) => s+toEUR(i.amount, i.currency), 0);
      const totalDevCost  = p.devInvoices.reduce((s,i) => s+toEUR(i.amount, i.currency), 0);
      const margin        = totalRevenue - totalDevCost;
      const marginPct     = totalRevenue > 0 ? (margin / totalRevenue * 100) : 0;
      // Days/hours billed TO client: derived from sales amount ÷ avg dev rate
      // Days/hours charged BY devs: sum of devDays fields
      const devDaysBilled  = p.devInvoices.filter(i=>i.devUnit==="days").reduce((s,i)=>s+(i.devDays||0),0);
      const devHoursBilled = p.devInvoices.filter(i=>i.devUnit==="hours").reduce((s,i)=>s+(i.devDays||0),0);
      return { ...p, totalRevenue, totalDevCost, margin, marginPct, devDaysBilled, devHoursBilled };
    }).sort((a,b) => b.totalRevenue - a.totalRevenue);
  }, [invoices, fx]);

  // Compute used units per PO from linked Sales invoices
  const poUsage = useMemo(() => {
    const usage = {};
    pos.forEach(po => { usage[po.id] = { invoiceUnits: 0, invoiceAmount: 0, linkedInvoices: [] }; });
    invoices.forEach(inv => {
      if (!inv.poId || !usage[inv.poId]) return;
      const po = pos.find(p => p.id === inv.poId);
      if (!po) return;
      // Derive units from invoice amount proportional to PO rate
      const ratePerUnit = po.amount / po.totalUnits;
      const units = ratePerUnit > 0 ? toEUR(inv.amount, inv.currency) / ratePerUnit : 0;
      usage[inv.poId].invoiceUnits += units;
      usage[inv.poId].invoiceAmount += toEUR(inv.amount, inv.currency);
      usage[inv.poId].linkedInvoices.push(inv);
    });
    return usage;
  }, [invoices, pos]);

  const filteredInvoices = invoices.filter(inv => {
    const cat = CAT_MAP[inv.category];
    if (invView === "sales" && inv.category !== "Sales") return false;
    if (invView === "costs" && cat?.type !== "cost") return false;
    if (invView === "costs" && costCatFilter !== "All" && inv.category !== costCatFilter) return false;
    if (invFilter !== "All" && inv.status !== invFilter) return false;
    return true;
  });
  const filteredPOs = poFilter === "All" ? pos : pos.filter(p => p.status === poFilter);

  const uncatCount = invoices.filter(i => !i.category || i.category === "Uncategorized").length;

  return (
    <div style={{ fontFamily:"'DM Sans','Helvetica Neue',sans-serif", background:"#f7f7f5", minHeight:"100vh", color:"#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#d0cec8;border-radius:4px;}
        .tab-btn{border:none;background:none;cursor:pointer;padding:8px 18px;font-family:inherit;font-size:13.5px;font-weight:500;color:#888;border-radius:8px;transition:all .15s;white-space:nowrap;}
        .tab-btn:hover{color:#333;background:#eeece8;}
        .tab-btn.active{background:#fff;color:#1a1a1a;box-shadow:0 1px 4px rgba(0,0,0,.1);}
        .filter-btn{border:1.5px solid #e0ddd8;background:#fff;cursor:pointer;padding:5px 13px;font-family:inherit;font-size:12px;font-weight:500;color:#666;border-radius:6px;transition:all .15s;display:inline-flex;align-items:center;gap:4px;}
        .filter-btn:hover{border-color:#b0ada8;color:#333;}
        .filter-btn.active{background:#1a1a1a;color:#fff;border-color:#1a1a1a;}
        .card{background:#fff;border-radius:14px;border:1px solid #eceae6;}
        .tbl{width:100%;border-collapse:collapse;font-size:13px;}
        .tbl th{background:#f7f7f5;font-weight:600;font-size:11.5px;text-transform:uppercase;letter-spacing:.06em;color:#999;padding:10px 14px;text-align:left;border-bottom:1px solid #eceae6;}
        .tbl td{padding:9px 14px;border-bottom:1px solid #f2f0ec;vertical-align:middle;}
        .tbl tr:last-child td{border-bottom:none;}
        .tbl tr:hover td{background:#fafaf8;}
        .num{font-family:'DM Mono',monospace;font-size:12.5px;text-align:right;}
        .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:600;}
        .cat-dot{display:inline-block;width:8px;height:8px;border-radius:50%;flex-shrink:0;}
        .cat-pill{display:inline-flex;align-items:center;gap:5px;cursor:pointer;padding:3px 8px;border-radius:6px;border:1.5px dashed #e0ddd8;font-size:12px;transition:border-color .15s;}
        .cat-pill:hover{border-color:#aaa;}
        .cat-select{font-family:inherit;font-size:12px;border:1.5px solid #1a1a1a;border-radius:6px;padding:3px 8px;background:#fff;cursor:pointer;outline:none;}
      `}</style>

      {/* ── Header ── */}
      <div style={{ background:"#fff", borderBottom:"1px solid #eceae6", padding:"0 32px" }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 0 0" }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
              <span style={{ fontSize:20, fontWeight:600, letterSpacing:"-.02em" }}>Finance</span>
              <span style={{ fontSize:13, color:"#aaa" }}>FY 2024 · H1 View</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              {/* FX rates button + inline panel */}
              <div style={{ position:"relative" }}>
                <button onClick={() => setShowFxPanel(v => !v)} style={{
                  fontFamily:"inherit", fontSize:12, fontWeight:600, color: showFxPanel?"#1a1a1a":"#888",
                  background:"none", border:"1.5px solid #e0ddd8", borderRadius:8, padding:"5px 12px",
                  cursor:"pointer", display:"flex", alignItems:"center", gap:6,
                  borderColor: showFxPanel ? "#1a1a1a" : "#e0ddd8"
                }}>
                  ⚙ FX Rates
                  <span style={{ fontFamily:"DM Mono", fontSize:11, color:"#aaa", fontWeight:400 }}>
                    1€ = {fx.PLN}zł
                  </span>
                </button>
                {showFxPanel && (
                  <div style={{
                    position:"absolute", top:"calc(100% + 8px)", right:0, zIndex:100,
                    background:"#fff", border:"1px solid #eceae6", borderRadius:12,
                    boxShadow:"0 8px 32px rgba(0,0,0,.10)", padding:"16px 18px", minWidth:240,
                  }}>
                    <div style={{ fontWeight:700, fontSize:12.5, marginBottom:12, color:"#555" }}>FX Rates to EUR</div>
                    {CURRENCIES.filter(c => c !== "EUR").map(cur => (
                      <div key={cur} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                        <span style={{ fontFamily:"DM Mono", fontSize:12, fontWeight:600, width:32, color:"#555" }}>{cur}</span>
                        <span style={{ fontSize:12, color:"#aaa", flex:1 }}>1 {cur} =</span>
                        <input
                          type="number" step="0.0001" min="0"
                          value={fx[cur]}
                          onChange={e => setFx(prev => ({ ...prev, [cur]: parseFloat(e.target.value) || 0 }))}
                          style={{ fontFamily:"DM Mono", fontSize:13, width:80, border:"1.5px solid #e0ddd8", borderRadius:6, padding:"4px 8px", outline:"none", textAlign:"right" }}
                        />
                        <span style={{ fontSize:12, color:"#aaa" }}>EUR</span>
                      </div>
                    ))}
                    <div style={{ fontSize:11, color:"#bbb", marginTop:8, borderTop:"1px solid #f0eeea", paddingTop:8 }}>
                      All financial figures shown in EUR
                    </div>
                  </div>
                )}
              </div>
              <div style={{ fontSize:12.5, color:"#aaa" }}>Last updated: Jun 8, 2024</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:4, marginTop:14, overflowX:"auto" }}>
            {TABS.map(t => (
              <button key={t} className={`tab-btn${activeTab===t?" active":""}`} onClick={() => { setActiveTab(t); setShowFxPanel(false); }}>
                {t}{t==="Invoices"&&uncatCount>0 ? <span style={{ marginLeft:6, background:"#f57f17", color:"#fff", borderRadius:10, padding:"1px 6px", fontSize:10.5, fontWeight:700 }}>{uncatCount}</span> : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"28px 32px 60px" }}>

        {/* ── OVERVIEW ── */}
        {activeTab === "Overview" && (() => {
          // ── Derived metrics ──────────────────────────────────────────────
          const revByMonth   = dynamicPL.find(r => r.label === "Revenue")?.values || [];
          const totalRevH1   = revByMonth.reduce((s,v) => s+v, 0);
          const avgMonthlyRev= totalRevH1 / MONTHS.length;
          const currentMonth = MONTHS.length; // months elapsed so far

          // Revenue vs target
          const ytdTarget    = MONTHLY_REV_TARGET * currentMonth;
          const achievement  = pctNum(totalRevH1, ytdTarget);
          const progressToYearly = pctNum(totalRevH1, YEARLY_REV_TARGET);

          // Prognosis: actual H1 + forecast H2
          const forecastH2Total = forecastByMonth.slice(MONTHS.length).reduce((s,f) => s+f.revenue, 0);
          const prognosisYearly = forecastH2Total > 0 ? totalRevH1 + forecastH2Total : avgMonthlyRev * 12;

          // Y/Y (compare same months Jan–Jun)
          const rev2025H1    = REV_2025.slice(0, MONTHS.length).reduce((s,v) => s+v, 0);
          const yoyGrowth    = pctNum(totalRevH1 - rev2025H1, rev2025H1);

          // FTE placeholders
          const actualFTE    = 14; // placeholder
          const requiredFTE  = TARGET_FTE;

          // ── Cost groups for margins ──────────────────────────────────────
          const sumFromPL = (labels) => dynamicPL
            .filter(r => labels.includes(r.label) && r.values)
            .reduce((s, r) => s + r.values.reduce((a,b) => a+b, 0), 0);

          const costDevs  = sumFromPL(DEVELOPERS.map(d => d.label));
          const costOps   = sumFromPL(["Operations","Office","Leasing","Legal","Accounting","Admin"]);
          const costSales = sumFromPL(["Sales Tools","Business Trips","Maciej"]);
          const costMgmt  = sumFromPL(["Paweł","Michał"]);

          const m1 = totalRevH1 - costDevs;
          const m2 = m1 - costOps;
          const m3 = m2 - costSales;
          const m4 = m3 - costMgmt;

          const KPICard = ({ label, value, sub, accent, progress, progressColor, tag, wide }) => (
            <div className="card" style={{ padding:"18px 20px", gridColumn: wide ? "span 2" : undefined }}>
              <div style={{ fontSize:11, fontWeight:600, color:"#aaa", textTransform:"uppercase", letterSpacing:".07em", marginBottom:6 }}>{label}</div>
              <div style={{ fontSize:22, fontWeight:700, letterSpacing:"-.02em", fontFamily:"'DM Mono',monospace", color: accent || "#1a1a1a" }}>{value}</div>
              {sub   && <div style={{ fontSize:12, color:"#aaa", marginTop:4 }}>{sub}</div>}
              {tag   && <div style={{ marginTop:6, display:"inline-block", padding:"2px 8px", borderRadius:10, background: tag.bg, color: tag.text, fontSize:11.5, fontWeight:600 }}>{tag.label}</div>}
              {progress != null && (
                <div style={{ marginTop:10 }}>
                  <div style={{ height:5, borderRadius:3, background:"#eceae6", overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:3, background: progressColor||"#1a1a1a", width:`${Math.min(progress,100)}%`, transition:"width .5s" }}/>
                  </div>
                  <div style={{ fontSize:11, color:"#bbb", marginTop:4 }}>{progress.toFixed(1)}%</div>
                </div>
              )}
            </div>
          );

          const MarginRow = ({ label, value, revenue, color }) => {
            const p = pctNum(value, revenue);
            return (
              <div style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom:"1px solid #f2f0ec" }}>
                <div style={{ width:140, fontSize:13, fontWeight:500 }}>{label}</div>
                <div style={{ fontFamily:"DM Mono", fontSize:14, fontWeight:700, width:100, color: value >= 0 ? "#1a1a1a" : "#c62828" }}>{fmt(value)}</div>
                <div style={{ flex:1 }}>
                  <div style={{ height:8, borderRadius:4, background:"#eceae6", overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:4, background: color, width:`${Math.max(0,Math.min(p,100))}%`, transition:"width .5s" }}/>
                  </div>
                </div>
                <div style={{ fontFamily:"DM Mono", fontSize:14, fontWeight:700, width:64, textAlign:"right", color: p >= 0 ? color : "#c62828" }}>{p.toFixed(1)}%</div>
              </div>
            );
          };

          return (
            <div>
              {/* ── Revenue Goal section ── */}
              <div style={{ fontSize:11.5, fontWeight:600, color:"#aaa", textTransform:"uppercase", letterSpacing:".08em", marginBottom:12 }}>Revenue Goals</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
                <KPICard
                  label="Monthly Revenue Target"
                  value={fmt(MONTHLY_REV_TARGET)}
                  sub="Placeholder — update in settings"
                />
                <KPICard
                  label="Achievement vs Monthly Target"
                  value={`${(totalRevH1 / (MONTHLY_REV_TARGET * currentMonth) * 100).toFixed(1)}%`}
                  sub={`${fmt(totalRevH1)} of ${fmt(MONTHLY_REV_TARGET * currentMonth)} YTD`}
                  accent={achievement >= 100 ? "#2e7d32" : achievement >= 80 ? "#f57f17" : "#c62828"}
                  progress={achievement}
                  progressColor={achievement >= 100 ? "#4caf50" : achievement >= 80 ? "#ff9800" : "#f44336"}
                />
                <KPICard
                  label="Progress to Yearly Target"
                  value={pct(totalRevH1, YEARLY_REV_TARGET)}
                  sub={`${fmt(totalRevH1)} of ${fmt(YEARLY_REV_TARGET)}`}
                  progress={progressToYearly}
                  progressColor="#1976d2"
                />
                <KPICard
                  label="Prognosis to Yearly Target"
                  value={fmt(prognosisYearly)}
                  sub={forecastH2Total > 0 ? `Actual H1 + forecast H2` : `Run-rate extrapolation`}
                  accent={prognosisYearly >= YEARLY_REV_TARGET ? "#2e7d32" : "#c62828"}
                  tag={prognosisYearly >= YEARLY_REV_TARGET
                    ? { label:"▲ On Track", bg:"#e8f5e9", text:"#2e7d32" }
                    : { label:"▼ Below Target", bg:"#fce4ec", text:"#c62828" }}
                />
              </div>

              {/* ── Revenue Performance ── */}
              <div style={{ fontSize:11.5, fontWeight:600, color:"#aaa", textTransform:"uppercase", letterSpacing:".08em", marginBottom:12 }}>Revenue Performance</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
                <KPICard
                  label="H1 Revenue"
                  value={fmt(totalRevH1)}
                  sub={`Avg ${fmt(avgMonthlyRev)}/mo`}
                />
                <KPICard
                  label="Y/Y Revenue Growth"
                  value={`${yoyGrowth >= 0 ? "+" : ""}${yoyGrowth.toFixed(1)}%`}
                  sub={`2025 H1: ${fmt(rev2025H1)}`}
                  accent={yoyGrowth >= 0 ? "#2e7d32" : "#c62828"}
                  tag={yoyGrowth >= 0
                    ? { label:`▲ +${fmt(totalRevH1 - rev2025H1)}`, bg:"#e8f5e9", text:"#2e7d32" }
                    : { label:`▼ ${fmt(totalRevH1 - rev2025H1)}`,  bg:"#fce4ec", text:"#c62828" }}
                />
                <KPICard
                  label="Avg Actual FTEs"
                  value={String(actualFTE)}
                  sub="Placeholder — update with real headcount"
                />
                <KPICard
                  label="Required FTEs to Meet Target"
                  value={String(requiredFTE)}
                  sub={`Gap: ${requiredFTE - actualFTE > 0 ? "+" : ""}${requiredFTE - actualFTE} FTE`}
                  accent={actualFTE >= requiredFTE ? "#2e7d32" : "#f57c00"}
                />
              </div>

              {/* ── Monthly Rev vs Target sparkline ── */}
              <div className="card" style={{ padding:"20px 24px", marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <div style={{ fontWeight:600, fontSize:14 }}>Monthly Revenue vs Target · 2026 vs 2025</div>
                  <button onClick={() => setShowForecastPanel(v => !v)} style={{
                    fontFamily:"inherit", fontSize:12, fontWeight:600, cursor:"pointer", borderRadius:8,
                    padding:"5px 14px", border:"1.5px solid", transition:"all .15s",
                    background: showForecastPanel ? "#1a1a1a" : "#fff",
                    color: showForecastPanel ? "#fff" : "#555",
                    borderColor: showForecastPanel ? "#1a1a1a" : "#e0ddd8",
                  }}>✦ Forecast & Pipeline</button>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {ALL_MONTHS.map((m, i) => {
                    const rev26   = revByMonth[i] || 0;
                    const rev25   = REV_2025[i]   || 0;
                    const fcst    = forecastByMonth[i];
                    const isFuture = i >= MONTHS.length;
                    const forecastRev = fcst.revenue;
                    const maxVal  = Math.max(...revByMonth, ...REV_2025, ...forecastByMonth.map(f=>f.revenue), MONTHLY_REV_TARGET) * 1.05 || 1;
                    return (
                      <div key={m} style={{ display:"flex", alignItems:"center", gap:10, opacity: isFuture && forecastRev === 0 ? 0.35 : 1 }}>
                        <span style={{ width:28, fontSize:11.5, color: isFuture ? "#aaa" : "#999", fontWeight:500 }}>{m}</span>
                        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:3 }}>
                          {/* Actual 2026 or forecast bar */}
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            {isFuture ? (
                              // Forecast bar — dashed outline style
                              forecastRev > 0 ? <>
                                <div style={{ height:10, borderRadius:3, background:"transparent", border:"2px dashed #7c5cbf", width:`${(forecastRev/maxVal)*100}%`, minWidth:4 }}/>
                                <span style={{ fontSize:11, color:"#7c5cbf", fontFamily:"DM Mono", whiteSpace:"nowrap", fontWeight:600 }}>{fmt(forecastRev)}</span>
                                {fcst.pipelineRev > 0 && <span style={{ fontSize:10, color:"#7c5cbf", opacity:.7 }}>({fmt(fcst.pipelineRev)} pipeline)</span>}
                              </> : <span style={{ fontSize:11, color:"#ccc", fontStyle:"italic" }}>no forecast set</span>
                            ) : (
                              <>
                                <div style={{ height:10, borderRadius:3, background:"#1a1a1a", width:`${(rev26/maxVal)*100}%`, minWidth:4, transition:"width .4s" }}/>
                                <span style={{ fontSize:11, color:"#555", fontFamily:"DM Mono", whiteSpace:"nowrap" }}>{fmt(rev26)}</span>
                                {rev26 >= MONTHLY_REV_TARGET
                                  ? <span style={{ fontSize:10, color:"#2e7d32", fontWeight:700 }}>✓</span>
                                  : <span style={{ fontSize:10, color:"#c62828", fontWeight:700 }}>✗</span>}
                              </>
                            )}
                          </div>
                          {/* 2025 comparison */}
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div style={{ height:10, borderRadius:3, background:"#b0bec5", width:`${(rev25/maxVal)*100}%`, minWidth: rev25>0?4:0, transition:"width .4s" }}/>
                            {rev25 > 0 && <span style={{ fontSize:11, color:"#aaa", fontFamily:"DM Mono", whiteSpace:"nowrap" }}>{fmt(rev25)}</span>}
                          </div>
                          {/* Target line */}
                          <div style={{ height:1, background:"#e8e6e2", position:"relative" }}>
                            <div style={{ position:"absolute", left:`${(MONTHLY_REV_TARGET/maxVal)*100}%`, top:-4, width:1, height:9, background:"#f57c00" }}/>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop:14, display:"flex", gap:18, flexWrap:"wrap" }}>
                  <span style={{ fontSize:11.5, color:"#888", display:"flex", alignItems:"center", gap:5 }}><span style={{ width:10, height:10, borderRadius:2, background:"#1a1a1a", display:"inline-block" }}/> 2026 Actual</span>
                  <span style={{ fontSize:11.5, color:"#888", display:"flex", alignItems:"center", gap:5 }}><span style={{ width:10, height:10, borderRadius:2, background:"#b0bec5", display:"inline-block" }}/> 2025</span>
                  <span style={{ fontSize:11.5, color:"#888", display:"flex", alignItems:"center", gap:5 }}><span style={{ width:10, height:10, borderRadius:2, background:"transparent", border:"2px dashed #7c5cbf", display:"inline-block" }}/> Forecast</span>
                  <span style={{ fontSize:11.5, color:"#888", display:"flex", alignItems:"center", gap:5 }}><span style={{ width:2, height:10, background:"#f57c00", display:"inline-block" }}/> Monthly Target</span>
                </div>
              </div>

              {/* ── Forecast & Pipeline Panel ── */}
              {showForecastPanel && (
                <div className="card" style={{ marginBottom:20, overflow:"hidden" }}>
                  <div style={{ padding:"16px 24px 12px", borderBottom:"1px solid #f0eeea", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>✦ Forecast & Pipeline</div>
                    <div style={{ fontSize:12, color:"#aaa" }}>Future months only · figures in EUR · shown as dashed bars on chart</div>
                  </div>

                  {/* Monthly forecast table */}
                  <div style={{ padding:"16px 24px" }}>
                    <div style={{ fontWeight:600, fontSize:12.5, color:"#555", marginBottom:10, textTransform:"uppercase", letterSpacing:".06em" }}>Monthly Forecast</div>
                    <table className="tbl" style={{ marginBottom:0 }}>
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th style={{ textAlign:"right" }}>Forecast Revenue</th>
                          <th style={{ textAlign:"right" }}>Forecast Costs</th>
                          <th style={{ textAlign:"right" }}>Pipeline (weighted)</th>
                          <th style={{ textAlign:"right" }}>Total Forecast</th>
                          <th/>
                        </tr>
                      </thead>
                      <tbody>
                        {ALL_MONTHS.map((m, i) => {
                          const isFuture = i >= MONTHS.length;
                          const fm = forecast.months[i];
                          const fc = forecastByMonth[i];
                          const isEditing = editingForecastMonth === i;
                          if (!isFuture && !fm?.revenue && !fm?.costs) return null;
                          return (
                            <tr key={i} style={{ background: isFuture ? "#fafaf8" : "#fff" }}>
                              <td style={{ fontWeight:600, color: isFuture ? "#555" : "#aaa" }}>
                                {m} {isFuture ? <span style={{ fontSize:10.5, color:"#aaa", fontWeight:400 }}>forecast</span> : <span style={{ fontSize:10.5, color:"#2e7d32", fontWeight:400 }}>actual</span>}
                              </td>
                              {isEditing ? (
                                <>
                                  <td className="num">
                                    <input type="number" value={fm?.revenue||0} onChange={e => setForecast(prev => ({ ...prev, months: prev.months.map((mo,j) => j===i ? {...mo, revenue:parseFloat(e.target.value)||0} : mo) }))}
                                      style={{ fontFamily:"DM Mono", fontSize:12, width:110, border:"1.5px solid #1a1a1a", borderRadius:6, padding:"3px 7px", textAlign:"right", outline:"none" }}/>
                                  </td>
                                  <td className="num">
                                    <input type="number" value={fm?.costs||0} onChange={e => setForecast(prev => ({ ...prev, months: prev.months.map((mo,j) => j===i ? {...mo, costs:parseFloat(e.target.value)||0} : mo) }))}
                                      style={{ fontFamily:"DM Mono", fontSize:12, width:110, border:"1.5px solid #e0ddd8", borderRadius:6, padding:"3px 7px", textAlign:"right", outline:"none" }}/>
                                  </td>
                                  <td className="num" style={{ color:"#7c5cbf" }}>{fmt(fc.pipelineRev)}</td>
                                  <td className="num" style={{ fontWeight:700 }}>{fmt(fc.revenue)}</td>
                                  <td><button onClick={() => setEditingForecastMonth(null)} style={{ fontFamily:"inherit", fontSize:11.5, fontWeight:600, background:"#1a1a1a", color:"#fff", border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Save</button></td>
                                </>
                              ) : (
                                <>
                                  <td className="num" style={{ color: fm?.revenue ? "#1a1a1a" : "#ccc" }}>{fm?.revenue ? fmt(fm.revenue) : "—"}</td>
                                  <td className="num" style={{ color: fm?.costs ? "#c62828" : "#ccc" }}>{fm?.costs ? fmt(fm.costs) : "—"}</td>
                                  <td className="num" style={{ color:"#7c5cbf" }}>{fc.pipelineRev > 0 ? fmt(fc.pipelineRev) : "—"}</td>
                                  <td className="num" style={{ fontWeight:700, color: fc.revenue > 0 ? "#7c5cbf" : "#ccc" }}>{fc.revenue > 0 ? fmt(fc.revenue) : "—"}</td>
                                  <td><button onClick={() => setEditingForecastMonth(i)} style={{ fontFamily:"inherit", fontSize:11.5, background:"none", border:"1.5px solid #e0ddd8", borderRadius:6, padding:"3px 10px", cursor:"pointer", color:"#888" }}>✎ Edit</button></td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                        {/* Show all future months even if empty */}
                        {ALL_MONTHS.map((m, i) => {
                          const isFuture = i >= MONTHS.length;
                          const fm = forecast.months[i];
                          if (!isFuture || fm?.revenue || fm?.costs) return null;
                          const fc = forecastByMonth[i];
                          const isEditing = editingForecastMonth === i;
                          return (
                            <tr key={`empty-${i}`} style={{ background:"#fafaf8" }}>
                              <td style={{ fontWeight:600, color:"#555" }}>{m} <span style={{ fontSize:10.5, color:"#aaa", fontWeight:400 }}>forecast</span></td>
                              {isEditing ? (
                                <>
                                  <td className="num"><input type="number" defaultValue={0} onChange={e => setForecast(prev => ({ ...prev, months: prev.months.map((mo,j) => j===i ? {...mo, revenue:parseFloat(e.target.value)||0} : mo) }))} style={{ fontFamily:"DM Mono", fontSize:12, width:110, border:"1.5px solid #1a1a1a", borderRadius:6, padding:"3px 7px", textAlign:"right", outline:"none" }}/></td>
                                  <td className="num"><input type="number" defaultValue={0} onChange={e => setForecast(prev => ({ ...prev, months: prev.months.map((mo,j) => j===i ? {...mo, costs:parseFloat(e.target.value)||0} : mo) }))} style={{ fontFamily:"DM Mono", fontSize:12, width:110, border:"1.5px solid #e0ddd8", borderRadius:6, padding:"3px 7px", textAlign:"right", outline:"none" }}/></td>
                                  <td className="num" style={{ color:"#7c5cbf" }}>{fc.pipelineRev > 0 ? fmt(fc.pipelineRev) : "—"}</td>
                                  <td className="num" style={{ fontWeight:700, color:"#7c5cbf" }}>{fmt(fc.revenue)}</td>
                                  <td><button onClick={() => setEditingForecastMonth(null)} style={{ fontFamily:"inherit", fontSize:11.5, fontWeight:600, background:"#1a1a1a", color:"#fff", border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>Save</button></td>
                                </>
                              ) : (
                                <>
                                  <td className="num" style={{ color:"#ccc" }}>—</td>
                                  <td className="num" style={{ color:"#ccc" }}>—</td>
                                  <td className="num" style={{ color: fc.pipelineRev > 0 ? "#7c5cbf" : "#ccc" }}>{fc.pipelineRev > 0 ? fmt(fc.pipelineRev) : "—"}</td>
                                  <td className="num" style={{ color: fc.revenue > 0 ? "#7c5cbf" : "#ccc" }}>{fc.revenue > 0 ? fmt(fc.revenue) : "—"}</td>
                                  <td><button onClick={() => setEditingForecastMonth(i)} style={{ fontFamily:"inherit", fontSize:11.5, background:"none", border:"1.5px solid #e0ddd8", borderRadius:6, padding:"3px 10px", cursor:"pointer", color:"#888" }}>✎ Set</button></td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pipeline deals */}
                  <div style={{ padding:"0 24px 20px", borderTop:"1px solid #f0eeea" }}>
                    <div style={{ fontWeight:600, fontSize:12.5, color:"#555", margin:"16px 0 10px", textTransform:"uppercase", letterSpacing:".06em" }}>Pipeline · Potential Clients</div>
                    <table className="tbl" style={{ marginBottom:12 }}>
                      <thead>
                        <tr>
                          <th>Client</th>
                          <th style={{ textAlign:"right" }}>Deal Value</th>
                          <th>Currency</th>
                          <th>Expected Close</th>
                          <th style={{ textAlign:"right" }}>Probability</th>
                          <th style={{ textAlign:"right" }}>Weighted EUR</th>
                          <th/>
                        </tr>
                      </thead>
                      <tbody>
                        {forecast.pipeline.map(deal => (
                          <tr key={deal.id}>
                            <td style={{ fontWeight:500 }}>{deal.client}</td>
                            <td className="num">{CUR_SYMBOLS[deal.currency]||"€"}{Math.round(deal.value).toLocaleString("de-DE")}</td>
                            <td style={{ fontSize:12 }}>{deal.currency}</td>
                            <td style={{ fontSize:12 }}>{ALL_MONTHS[deal.closeMonth]} 2026</td>
                            <td className="num">
                              <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                                <span style={{ width:40, height:5, borderRadius:3, background:"#eceae6", display:"inline-block", overflow:"hidden" }}>
                                  <span style={{ display:"block", height:"100%", width:`${deal.probability}%`, background:"#7c5cbf", borderRadius:3 }}/>
                                </span>
                                {deal.probability}%
                              </span>
                            </td>
                            <td className="num" style={{ fontWeight:600, color:"#7c5cbf" }}>{fmt(toEUR(deal.value, deal.currency) * deal.probability / 100)}</td>
                            <td>
                              <button onClick={() => setForecast(prev => ({ ...prev, pipeline: prev.pipeline.filter(d => d.id !== deal.id) }))}
                                style={{ background:"none", border:"none", cursor:"pointer", color:"#ccc", fontSize:14 }}>✕</button>
                            </td>
                          </tr>
                        ))}
                        {/* Add new deal row */}
                        <tr style={{ background:"#fafaf8" }}>
                          <td><input value={newPipeline.client} onChange={e => setNewPipeline(p => ({...p, client:e.target.value}))} placeholder="Client name" style={{ fontFamily:"inherit", fontSize:12, border:"1.5px solid #e0ddd8", borderRadius:6, padding:"4px 8px", outline:"none", width:"100%" }}/></td>
                          <td className="num"><input type="number" value={newPipeline.value} onChange={e => setNewPipeline(p => ({...p, value:e.target.value}))} placeholder="0" style={{ fontFamily:"DM Mono", fontSize:12, border:"1.5px solid #e0ddd8", borderRadius:6, padding:"4px 8px", outline:"none", width:100, textAlign:"right" }}/></td>
                          <td>
                            <select value={newPipeline.currency} onChange={e => setNewPipeline(p => ({...p, currency:e.target.value}))} style={{ fontFamily:"inherit", fontSize:12, border:"1.5px solid #e0ddd8", borderRadius:6, padding:"4px 6px", outline:"none" }}>
                              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                          </td>
                          <td>
                            <select value={newPipeline.closeMonth} onChange={e => setNewPipeline(p => ({...p, closeMonth:parseInt(e.target.value)}))} style={{ fontFamily:"inherit", fontSize:12, border:"1.5px solid #e0ddd8", borderRadius:6, padding:"4px 6px", outline:"none" }}>
                              {ALL_MONTHS.map((m,i) => <option key={i} value={i}>{m} 2026</option>)}
                            </select>
                          </td>
                          <td className="num">
                            <input type="number" min="0" max="100" value={newPipeline.probability} onChange={e => setNewPipeline(p => ({...p, probability:parseInt(e.target.value)||0}))} style={{ fontFamily:"DM Mono", fontSize:12, border:"1.5px solid #e0ddd8", borderRadius:6, padding:"4px 8px", outline:"none", width:60, textAlign:"right" }}/>
                            <span style={{ fontSize:12, color:"#aaa", marginLeft:4 }}>%</span>
                          </td>
                          <td className="num" style={{ color:"#7c5cbf" }}>{newPipeline.value ? fmt(toEUR(parseFloat(newPipeline.value)||0, newPipeline.currency) * newPipeline.probability / 100) : "—"}</td>
                          <td>
                            <button onClick={() => {
                              if (!newPipeline.client || !newPipeline.value) return;
                              setForecast(prev => ({ ...prev, pipeline: [...prev.pipeline, { ...newPipeline, id:`p${Date.now()}`, value:parseFloat(newPipeline.value) }] }));
                              setNewPipeline({ client:"", value:"", currency:"EUR", closeMonth:6, probability:50 });
                            }} style={{ fontFamily:"inherit", fontSize:12, fontWeight:600, background:"#1a1a1a", color:"#fff", border:"none", borderRadius:6, padding:"5px 12px", cursor:"pointer" }}>+ Add</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    {forecast.pipeline.length > 0 && (
                      <div style={{ fontSize:12.5, color:"#aaa" }}>
                        Total pipeline weighted: <strong style={{ color:"#7c5cbf", fontFamily:"DM Mono" }}>{fmt(forecast.pipeline.reduce((s,d) => s + toEUR(d.value, d.currency) * d.probability / 100, 0))}</strong>
                        <span style={{ marginLeft:12 }}>Unweighted: <strong style={{ fontFamily:"DM Mono", color:"#555" }}>{fmt(forecast.pipeline.reduce((s,d) => s + toEUR(d.value, d.currency), 0))}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Margin Waterfall ── */}
              <div style={{ fontSize:11.5, fontWeight:600, color:"#aaa", textTransform:"uppercase", letterSpacing:".08em", marginBottom:12 }}>Margin Waterfall · H1 2026</div>
              <div className="card" style={{ padding:"20px 24px", marginBottom:20 }}>
                <div style={{ marginBottom:4 }}>
                  <MarginRow label="Revenue"            value={totalRevH1} revenue={totalRevH1} color="#1a1a1a" />
                  <div style={{ padding:"8px 0 4px", fontSize:11, color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:".06em" }}>after Developers (−{fmt(costDevs)})</div>
                  <MarginRow label="Margin #1 · Dev"    value={m1}         revenue={totalRevH1} color="#1976d2" />
                  <div style={{ padding:"8px 0 4px", fontSize:11, color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:".06em" }}>after Operations group (−{fmt(costOps)})</div>
                  <MarginRow label="Margin #2 · Ops"    value={m2}         revenue={totalRevH1} color="#00838f" />
                  <div style={{ padding:"8px 0 4px", fontSize:11, color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:".06em" }}>after Sales group (−{fmt(costSales)})</div>
                  <MarginRow label="Margin #3 · Sales"  value={m3}         revenue={totalRevH1} color="#4527a0" />
                  <div style={{ padding:"8px 0 4px", fontSize:11, color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:".06em" }}>after Management (−{fmt(costMgmt)})</div>
                  <MarginRow label="Margin #4 · Mgmt"   value={m4}         revenue={totalRevH1} color="#ad1457" />
                </div>
              </div>

              {/* ── Invoice breakdown + Recent POs ── */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div className="card" style={{ padding:"18px 0" }}>
                  <div style={{ fontWeight:600, fontSize:14, padding:"0 20px 14px", borderBottom:"1px solid #f0eeea" }}>Recent Invoices</div>
                  <table className="tbl">
                    <thead><tr><th>Client</th><th>Category</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                      {invoices.slice(0,6).map((inv,i) => {
                        const cat = CAT_MAP[inv.category] || CAT_MAP["Uncategorized"];
                        return (
                          <tr key={i}>
                            <td style={{ fontWeight:500, fontSize:12.5 }}>{inv.client||"—"}</td>
                            <td><span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11.5 }}><span className="cat-dot" style={{ background:cat.color }}/><span style={{ color:cat.color, fontWeight:500 }}>{cat.label}</span></span></td>
                            <td className="num">{fmt(inv.amount)}</td>
                            <td><span className="badge" style={{ background:statusColors[inv.status]?.bg||"#f5f5f5", color:statusColors[inv.status]?.text||"#666" }}>{inv.status}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="card" style={{ padding:"18px 0" }}>
                  <div style={{ fontWeight:600, fontSize:14, padding:"0 20px 14px", borderBottom:"1px solid #f0eeea" }}>Recent POs</div>
                  <table className="tbl">
                    <thead><tr><th>Vendor</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                      {seedPOs.slice(0,5).map(po => (
                        <tr key={po.id}>
                          <td style={{ fontSize:12.5 }}><div style={{ fontWeight:500 }}>{po.vendor}</div><div style={{ fontSize:11, color:"#aaa" }}>{po.description}</div></td>
                          <td className="num">{fmt(po.amount)}</td>
                          <td><span className="badge" style={{ background:statusColors[po.status]?.bg, color:statusColors[po.status]?.text }}>{po.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── P&L ── */}
        {activeTab === "P&L" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, padding:"10px 16px", background:"#fffde7", borderRadius:10, border:"1px solid #ffe082", fontSize:13, color:"#7a6000" }}>
              ⚡ P&L figures update automatically as you categorize invoices in the Invoices tab.
            </div>
            <div className="card" style={{ overflow:"hidden" }}>
              <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #f0eeea" }}>
                <div style={{ fontWeight:600, fontSize:15 }}>Profit & Loss Statement</div>
                <div style={{ fontSize:12.5, color:"#aaa", marginTop:3 }}>January – June 2024 · Live from invoices</div>
              </div>
              <div style={{ overflowX:"auto" }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th style={{ width:240 }}>Line Item</th>
                      {MONTHS.map(m => <th key={m} style={{ textAlign:"right" }}>{m}</th>)}
                      <th style={{ textAlign:"right" }}>H1 Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dynamicPL.map((row, ri) => {
                      const total = row.values ? row.values.reduce((a,b) => a+b, 0) : null;

                      // Section header row
                      if (row.section) return (
                        <tr key={ri}>
                          <td colSpan={MONTHS.length + 2} style={{
                            padding:"10px 14px 6px", fontSize:11, fontWeight:700,
                            textTransform:"uppercase", letterSpacing:".08em",
                            color: row.sectionColor || "#999",
                            background:"#f7f7f5",
                            borderTop:"2px solid #eceae6",
                          }}>{row.label}</td>
                        </tr>
                      );

                      // Margin highlight row
                      if (row.margin) return (
                        <tr key={ri} style={{ background: row.sectionColor + "12" }}>
                          <td style={{ padding:"10px 14px", fontWeight:700, fontSize:13, color: row.sectionColor, borderTop:`1px solid ${row.sectionColor}30` }}>
                            {row.label}
                            {total != null && <span style={{ marginLeft:8, fontSize:11, fontWeight:500, color:"#aaa" }}>({pct(total, dynamicPL[0].values.reduce((a,b)=>a+b,0))})</span>}
                          </td>
                          {row.values.map((v,i) => (
                            <td key={i} className="num" style={{ fontWeight:700, color: v<0?"#c62828":row.sectionColor, borderTop:`1px solid ${row.sectionColor}30` }}>{fmtSigned(v)}</td>
                          ))}
                          <td className="num" style={{ fontWeight:700, color: total<0?"#c62828":row.sectionColor, borderTop:`1px solid ${row.sectionColor}30` }}>
                            {fmtSigned(total)}
                            <span style={{ display:"block", fontSize:10.5, color:"#aaa", fontWeight:500 }}>{pct(total, dynamicPL[0].values.reduce((a,b)=>a+b,0))}</span>
                          </td>
                        </tr>
                      );

                      // Subtotal row
                      if (row.subtotal) return (
                        <tr key={ri} style={{ background:"#fafaf8" }}>
                          <td style={{ padding:"8px 14px 8px 24px", fontWeight:600, fontSize:12.5, color:"#555" }}>{row.label}</td>
                          {row.values.map((v,i) => (
                            <td key={i} className="num" style={{ fontWeight:600, color:"#555" }}>{fmtSigned(v)}</td>
                          ))}
                          <td className="num" style={{ fontWeight:700, color:"#555" }}>{fmtSigned(total)}</td>
                        </tr>
                      );

                      // Net income row
                      if (row.netIncome) return (
                        <tr key={ri} style={{ background:"#f0f4ff" }}>
                          <td style={{ padding:"11px 14px", fontWeight:700, fontSize:13.5, borderTop:"2px solid #1a1a1a" }}>{row.label}</td>
                          {row.values.map((v,i) => (
                            <td key={i} className="num" style={{ fontWeight:700, fontSize:13, color:v<0?"#c62828":"#1a1a1a", borderTop:"2px solid #1a1a1a" }}>{fmtSigned(v)}</td>
                          ))}
                          <td className="num" style={{ fontWeight:700, fontSize:13, color:total<0?"#c62828":"#1a1a1a", borderTop:"2px solid #1a1a1a" }}>{fmtSigned(total)}</td>
                        </tr>
                      );

                      // Regular / indent row
                      return (
                        <tr key={ri}>
                          <td style={{ paddingLeft: row.indent2 ? 36 : row.indent ? 24 : 14, fontWeight: row.bold ? 600 : 400, fontSize:13 }}>{row.label}</td>
                          {row.values.map((v,i) => (
                            <td key={i} className="num" style={{ fontWeight:row.bold?600:400, color:v<0?"#c62828":"#1a1a1a" }}>{fmtSigned(v)}</td>
                          ))}
                          <td className="num" style={{ fontWeight:row.bold?700:400, color:total<0?"#c62828":"#1a1a1a" }}>{fmtSigned(total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── CASH FLOW ── */}
        {activeTab === "Cash Flow" && (() => {
          const FX_TO_EUR  = fx;
          const CURRENCY_SYMBOLS = { PLN:"zł", EUR:"€", GBP:"£", USD:"$" };
          const totalEUR = bankAccounts.reduce((s, a) => s + a.balance * (FX_TO_EUR[a.currency]||1), 0);

          // ── Pull incoming / outgoing from invoices per due month ───────────
          const pendingStatuses = ["Pending","Overdue"];
          const cfByMonth = {};
          ALL_MONTHS.forEach((m, i) => { cfByMonth[i] = { incoming:[], outgoing:[] }; });

          invoices.forEach(inv => {
            if (!pendingStatuses.includes(inv.status)) return;
            const dateStr = inv.due || inv.issued;
            if (!dateStr) return;
            const mi = parseInt(dateStr.split("-")[1], 10) - 1;
            if (mi < 0 || mi > 11) return;
            const cat = CAT_MAP[inv.category];
            if (inv.category === "Sales") cfByMonth[mi].incoming.push(inv);
            else if (cat?.type === "cost") cfByMonth[mi].outgoing.push(inv);
          });

          // Only show months that have something, sorted
          const activeMonths = ALL_MONTHS.map((m, i) => ({ m, i }))
            .filter(({ i }) => cfByMonth[i].incoming.length > 0 || cfByMonth[i].outgoing.length > 0);

          return (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* ── Bank accounts ── */}
              <div className="card" style={{ padding:"20px 24px" }}>
                <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:18 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:16 }}>Total Balance</div>
                    <div style={{ fontSize:12, color:"#aaa", marginTop:2 }}>All accounts · converted to EUR at your FX rates</div>
                  </div>
                  <div style={{ fontFamily:"DM Mono", fontSize:28, fontWeight:700, letterSpacing:"-.02em" }}>
                    €{Math.round(totalEUR).toLocaleString("de-DE")}
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                  {bankAccounts.map(acc => {
                    const sym = CURRENCY_SYMBOLS[acc.currency] || "";
                    const isEditing = editingBank === acc.id;
                    return (
                      <div key={acc.id} style={{ background:"#f7f7f5", borderRadius:12, padding:"14px 16px", position:"relative" }}>
                        <div style={{ fontSize:11, color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:".07em", marginBottom:6 }}>{acc.label}</div>
                        {isEditing ? (
                          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                            <input
                              type="text"
                              defaultValue={acc.label}
                              placeholder="Account label"
                              style={{ fontFamily:"inherit", fontSize:12, border:"1.5px solid #ddd", borderRadius:6, padding:"4px 8px", outline:"none" }}
                              onChange={e => setBankAccounts(prev => prev.map(a => a.id===acc.id ? {...a, label:e.target.value} : a))}
                            />
                            <input
                              type="number"
                              defaultValue={acc.balance}
                              placeholder="Balance"
                              style={{ fontFamily:"DM Mono", fontSize:13, border:"1.5px solid #1a1a1a", borderRadius:6, padding:"4px 8px", outline:"none" }}
                              onChange={e => setBankAccounts(prev => prev.map(a => a.id===acc.id ? {...a, balance:parseFloat(e.target.value)||0} : a))}
                            />
                            <button onClick={() => setEditingBank(null)} style={{ fontFamily:"inherit", fontSize:12, fontWeight:600, background:"#1a1a1a", color:"#fff", border:"none", borderRadius:6, padding:"5px 0", cursor:"pointer" }}>Done</button>
                          </div>
                        ) : (
                          <>
                            <div style={{ fontFamily:"DM Mono", fontSize:20, fontWeight:700, marginBottom:2 }}>
                              {sym}{Math.round(acc.balance).toLocaleString("de-DE")}
                            </div>
                            {acc.currency !== "EUR" && (
                              <div style={{ fontSize:11, color:"#bbb" }}>≈ €{Math.round(acc.balance * (fx[acc.currency]||1)).toLocaleString("de-DE")}</div>
                            )}
                            <button onClick={() => setEditingBank(acc.id)} style={{ position:"absolute", top:10, right:12, background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#ccc" }}>✎</button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Monthly cash flow ── */}
              <div>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>Expected Cash Flow by Month</div>
                {activeMonths.length === 0 && (
                  <div className="card" style={{ padding:"32px", textAlign:"center", color:"#aaa", fontSize:13 }}>
                    No pending or overdue invoices found. Cash flow will appear here automatically as invoices are added.
                  </div>
                )}
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {activeMonths.map(({ m, i }) => {
                    const { incoming, outgoing } = cfByMonth[i];
                    const totalIn  = incoming.reduce((s,inv) => s+toEUR(inv.amount, inv.currency), 0);
                    const totalOut = outgoing.reduce((s,inv) => s+toEUR(inv.amount, inv.currency), 0);
                    const net      = totalIn - totalOut;
                    const isExpanded = expandedCfMonth === i;

                    // Group outgoing by category
                    const outByCat = {};
                    outgoing.forEach(inv => {
                      const k = inv.category || "Uncategorized";
                      if (!outByCat[k]) outByCat[k] = [];
                      outByCat[k].push(inv);
                    });

                    return (
                      <div key={i} className="card" style={{ overflow:"hidden" }}>
                        {/* Month summary row */}
                        <div
                          onClick={() => setExpandedCfMonth(isExpanded ? null : i)}
                          style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 20px", cursor:"pointer" }}>
                          <div style={{ fontWeight:700, fontSize:14, minWidth:90 }}>{m} 2024</div>

                          {/* Incoming */}
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <span style={{ fontSize:12, color:"#aaa" }}>In</span>
                            <span style={{ fontFamily:"DM Mono", fontSize:14, fontWeight:600, color:"#2e7d32" }}>+{fmt(totalIn)}</span>
                            <span style={{ fontSize:11, color:"#aaa" }}>{incoming.length} inv</span>
                          </div>

                          <div style={{ color:"#ddd" }}>·</div>

                          {/* Outgoing */}
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <span style={{ fontSize:12, color:"#aaa" }}>Out</span>
                            <span style={{ fontFamily:"DM Mono", fontSize:14, fontWeight:600, color:"#c62828" }}>-{fmt(totalOut)}</span>
                            <span style={{ fontSize:11, color:"#aaa" }}>{outgoing.length} inv</span>
                          </div>

                          <div style={{ flex:1 }}/>

                          {/* Net */}
                          <div style={{ textAlign:"right" }}>
                            <span style={{ fontSize:11, color:"#aaa", marginRight:6 }}>Net</span>
                            <span style={{ fontFamily:"DM Mono", fontSize:15, fontWeight:700, color: net >= 0 ? "#2e7d32" : "#c62828" }}>
                              {net >= 0 ? "+" : ""}{fmt(net)}
                            </span>
                          </div>
                          <div style={{ fontSize:16, color:"#ccc", marginLeft:8 }}>{isExpanded ? "▲" : "▼"}</div>
                        </div>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div style={{ borderTop:"1px solid #f0eeea" }}>

                            {/* Incoming invoices */}
                            {incoming.length > 0 && (
                              <div style={{ borderBottom:"1px solid #f0eeea" }}>
                                <div style={{ padding:"10px 20px 8px", background:"#f0faf2", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                  <span style={{ fontWeight:700, fontSize:12, color:"#2e7d32", textTransform:"uppercase", letterSpacing:".07em" }}>💰 Incoming · Awaiting Payment</span>
                                  <span style={{ fontFamily:"DM Mono", fontSize:13, fontWeight:700, color:"#2e7d32" }}>{fmt(totalIn)}</span>
                                </div>
                                <table className="tbl">
                                  <thead>
                                    <tr>
                                      <th>Invoice #</th><th>Client</th>
                                      <th style={{ textAlign:"right" }}>Amount</th>
                                      <th>Due date</th><th>Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {incoming.map((inv, ii) => (
                                      <tr key={ii}>
                                        <td style={{ fontFamily:"DM Mono", fontSize:12, color:"#666" }}>{inv.id||"—"}</td>
                                        <td style={{ fontWeight:500 }}>{inv.client||"—"}</td>
                                        <td className="num" style={{ fontWeight:600, color:"#2e7d32" }}>
                                          {fmt(toEUR(inv.amount, inv.currency))}
                                          {inv.currency && inv.currency !== "EUR" && (
                                            <div style={{ fontSize:10.5, color:"#aaa", fontWeight:400 }}>{CUR_SYMBOLS[inv.currency]||""}{Math.round(inv.amount).toLocaleString("de-DE")} {inv.currency}</div>
                                          )}
                                        </td>
                                        <td style={{ fontSize:12, color: inv.status==="Overdue"?"#c62828":"#888", fontWeight: inv.status==="Overdue"?600:400 }}>{inv.due||inv.issued||"—"}</td>
                                        <td><span className="badge" style={{ background:statusColors[inv.status]?.bg, color:statusColors[inv.status]?.text }}>{inv.status}</span></td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* Outgoing invoices grouped by category */}
                            {outgoing.length > 0 && (
                              <div>
                                <div style={{ padding:"10px 20px 8px", background:"#fff5f5", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                  <span style={{ fontWeight:700, fontSize:12, color:"#c62828", textTransform:"uppercase", letterSpacing:".07em" }}>💸 Outgoing · To Be Paid</span>
                                  <span style={{ fontFamily:"DM Mono", fontSize:13, fontWeight:700, color:"#c62828" }}>{fmt(totalOut)}</span>
                                </div>
                                <table className="tbl">
                                  <thead>
                                    <tr>
                                      <th>Invoice #</th><th>Vendor / Person</th>
                                      <th style={{ textAlign:"right" }}>Amount</th>
                                      <th>Category</th><th>Due date</th><th>Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Object.entries(outByCat).map(([catKey, catInvs]) => {
                                      const cat = CAT_MAP[catKey];
                                      const catTotal = catInvs.reduce((s,i)=>s+toEUR(i.amount, i.currency),0);
                                      return (
                                        <React.Fragment key={catKey}>
                                          <tr>
                                            <td colSpan={6} style={{ padding:"6px 16px 5px", background:"#fafaf8", borderTop:"1px solid #eceae6" }}>
                                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                                <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:600, color:cat?.color||"#666" }}>
                                                  <span style={{ width:7, height:7, borderRadius:"50%", background:cat?.color||"#aaa", display:"inline-block" }}/>
                                                  {cat?.label||catKey}
                                                </span>
                                                <span style={{ fontFamily:"DM Mono", fontSize:12, color:"#888" }}>{fmt(catTotal)}</span>
                                              </div>
                                            </td>
                                          </tr>
                                          {catInvs.map((inv, ii) => (
                                            <tr key={ii}>
                                              <td style={{ fontFamily:"DM Mono", fontSize:12, color:"#666" }}>{inv.id||"—"}</td>
                                              <td style={{ fontWeight:500 }}>{inv.client||"—"}</td>
                                              <td className="num" style={{ fontWeight:600, color:"#c62828" }}>
                                                {fmt(toEUR(inv.amount, inv.currency))}
                                                {inv.currency && inv.currency !== "EUR" && (
                                                  <div style={{ fontSize:10.5, color:"#aaa", fontWeight:400 }}>{CUR_SYMBOLS[inv.currency]||""}{Math.round(inv.amount).toLocaleString("de-DE")} {inv.currency}</div>
                                                )}
                                              </td>
                                              <td><span style={{ fontSize:12, color:cat?.color||"#888" }}>{cat?.label||catKey}</span></td>
                                              <td style={{ fontSize:12, color: inv.status==="Overdue"?"#c62828":"#888", fontWeight: inv.status==="Overdue"?600:400 }}>{inv.due||inv.issued||"—"}</td>
                                              <td><span className="badge" style={{ background:statusColors[inv.status]?.bg, color:statusColors[inv.status]?.text }}>{inv.status}</span></td>
                                            </tr>
                                          ))}
                                        </React.Fragment>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          );
        })()}

        {/* ── INVOICES ── */}
        {activeTab === "Invoices" && (
          <div>
            {/* Upload zone */}
            <div
              className="card"
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              style={{ marginBottom:16, padding:"20px 24px", border:dragOver?"2px dashed #1a1a1a":"2px dashed #ddd", background:dragOver?"#fafaf8":"#fff", transition:"all .15s", display:"flex", alignItems:"center", gap:20 }}
            >
              <div style={{ fontSize:26 }}>📄</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14, marginBottom:3 }}>Upload Invoice PDFs</div>
                <div style={{ fontSize:12.5, color:"#999" }}>Claude extracts all fields and <strong style={{ color:"#555" }}>auto-detects the category</strong> — you can correct any row inline.</div>
              </div>
              <label style={{ background:"#1a1a1a", color:"#fff", borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                Browse Files
                <input type="file" accept=".pdf" multiple style={{ display:"none" }} onChange={e => handleFiles(e.target.files)} />
              </label>
            </div>

            {/* Processing status */}
            {processingFiles.length > 0 && (
              <div className="card" style={{ marginBottom:16, padding:"14px 20px", display:"flex", flexDirection:"column", gap:8 }}>
                {processingFiles.map((f,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12, fontSize:13 }}>
                    <span>{f.status==="processing"?"⏳":f.status==="done"?"✅":"❌"}</span>
                    <span style={{ flex:1, color:"#555" }}>{f.name}</span>
                    <span style={{ fontSize:12, color:f.status==="error"?"#c62828":"#999" }}>
                      {f.status==="processing"?"Extracting + categorizing...":f.status==="done"?"Imported":"Failed to extract"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Filters */}
            <div style={{ marginBottom:14 }}>
              <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap", marginBottom:8 }}>
                <span style={{ fontSize:11, color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:".06em", marginRight:2 }}>Show</span>
                <button className={`filter-btn${invView==="all"?" active":""}`} onClick={() => { setInvView("all"); setCostCatFilter("All"); }}>All</button>
                <button
                  className={`filter-btn${invView==="sales"?" active":""}`}
                  onClick={() => { setInvView("sales"); setCostCatFilter("All"); }}
                  style={invView==="sales" ? { background:"#1565c0", borderColor:"#1565c0", color:"#fff" } : {}}>
                  💰 Sales
                </button>
                <button
                  className={`filter-btn${invView==="costs"?" active":""}`}
                  onClick={() => setInvView("costs")}
                  style={invView==="costs" ? { background:"#c62828", borderColor:"#c62828", color:"#fff" } : {}}>
                  💸 Costs
                </button>
                <span style={{ margin:"0 6px", color:"#ddd" }}>|</span>
                <span style={{ fontSize:11, color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:".06em", marginRight:2 }}>Status</span>
                {["All","Pending","Paid","Overdue"].map(f => (
                  <button key={f} className={`filter-btn${invFilter===f?" active":""}`} onClick={() => setInvFilter(f)}>{f}</button>
                ))}
              </div>

              {/* Cost category sub-filter — only visible in Costs view */}
              {invView === "costs" && (
                <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap", marginBottom:8, paddingLeft:2 }}>
                  <span style={{ fontSize:11, color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:".06em", marginRight:2 }}>Category</span>
                  <button
                    className={`filter-btn${costCatFilter==="All"?" active":""}`}
                    onClick={() => setCostCatFilter("All")}>
                    All costs
                  </button>
                  {INVOICE_CATEGORIES.filter(c => c.type === "cost").map(cat => (
                    <button key={cat.key}
                      className={`filter-btn${costCatFilter===cat.key?" active":""}`}
                      onClick={() => setCostCatFilter(cat.key)}
                      style={costCatFilter===cat.key ? { background:cat.color, borderColor:cat.color, color:"#fff" } : {}}>
                      <span className="cat-dot" style={{ background: costCatFilter===cat.key ? "#fff" : cat.color }}/>
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ fontSize:12.5, color:"#aaa" }}>
                {filteredInvoices.length} invoice{filteredInvoices.length!==1?"s":""} · Total: <strong style={{ color:"#1a1a1a", fontFamily:"DM Mono" }}>{fmt(filteredInvoices.reduce((s,i) => s+toEUR(i.amount, i.currency), 0))}</strong>
              </div>
            </div>

            {/* Month-grouped invoice tables */}
            {(() => {
              const groups = {};
              const noDate = [];
              filteredInvoices.forEach(inv => {
                if (!inv.issued) { noDate.push(inv); return; }
                const [year, mon] = inv.issued.split("-");
                const key = `${year}-${mon}`;
                if (!groups[key]) groups[key] = [];
                groups[key].push(inv);
              });
              const sortedKeys = Object.keys(groups).sort((a,b) => b.localeCompare(a));
              if (noDate.length) sortedKeys.push("__nodate__");
              if (sortedKeys.length === 0) return (
                <div style={{ textAlign:"center", padding:"40px 0", color:"#aaa", fontSize:13 }}>No invoices match the current filters.</div>
              );

              const COL_HEADERS = (
                <tr>
                  <th>Invoice #</th><th>Client</th>
                  <th style={{ textAlign:"right" }}>Amount</th>
                  <th>Issued / Days</th><th>Due Date</th><th>Status</th>
                  <th>Category <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0, color:"#ccc", fontSize:10 }}>edit</span></th>
                  <th>Project <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0, color:"#ccc", fontSize:10 }}>link</span></th>
                  <th>PO <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0, color:"#ccc", fontSize:10 }}>Sales only</span></th>
                  <th>Source</th>
                </tr>
              );

              const renderRow = (inv, idx) => {
                const cat     = CAT_MAP[inv.category] || CAT_MAP["Uncategorized"];
                const isUncat = !inv.category || inv.category === "Uncategorized";
                const isSales = inv.category === "Sales";
                const isDev   = cat.group === "Developers";
                const proj    = inv.projectId ? projects.find(p => p.id === inv.projectId) : null;
                const projName= proj ? proj.name : null;
                return (
                  <tr key={inv.id||idx} style={isUncat ? { background:"#fffde7" } : {}}>
                    <td style={{ fontFamily:"DM Mono", fontSize:12, color:"#666" }}>{inv.id||"—"}</td>
                    <td style={{ fontWeight:500 }}>{inv.client||"—"}</td>
                    <td className="num" style={{ fontWeight:600 }}>
                      {inv.amount ? fmt(toEUR(inv.amount, inv.currency)) : "—"}
                      {inv.currency && inv.currency !== "EUR" && (
                        <div style={{ fontSize:10.5, color:"#aaa", fontWeight:400 }}>
                          {CUR_SYMBOLS[inv.currency]||""}{Math.round(inv.amount).toLocaleString("de-DE")} {inv.currency}
                        </div>
                      )}
                    </td>
                    {isDev && inv.devDays
                      ? <td style={{ fontSize:12, color:"#666", fontFamily:"DM Mono" }}>{inv.devDays}{inv.devUnit==="hours"?"h":"d"}</td>
                      : <td style={{ fontSize:12, color:"#888" }}>{inv.issued||"—"}</td>}
                    <td style={{ fontSize:12, color:inv.status==="Overdue"?"#c62828":"#888", fontWeight:inv.status==="Overdue"?600:400 }}>{inv.due||"—"}</td>
                    <td>
                      <select
                        value={inv.status||"Pending"}
                        onChange={e => setInvoices(prev => prev.map(i => i.id===inv.id ? {...i, status:e.target.value} : i))}
                        style={{
                          fontFamily:"inherit", fontSize:11.5, fontWeight:600, cursor:"pointer",
                          border:"none", borderRadius:20, padding:"3px 8px", outline:"none",
                          background: statusColors[inv.status]?.bg || "#f5f5f5",
                          color: statusColors[inv.status]?.text || "#666",
                        }}>
                        {["Pending","Paid","Overdue"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      {editingCat === (inv.id||idx) ? (
                        <select className="cat-select" value={inv.category||""} autoFocus
                          onChange={e => updateCategory(inv.id, e.target.value)}
                          onBlur={() => setEditingCat(null)}>
                          {INVOICE_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                        </select>
                      ) : (
                        <span className="cat-pill" onClick={() => setEditingCat(inv.id||idx)}>
                          <span className="cat-dot" style={{ background:cat.color }}/>
                          <span style={{ color:cat.color, fontWeight:500 }}>{cat.label}</span>
                          <span style={{ color:"#ccc", fontSize:10, marginLeft:2 }}>✎</span>
                        </span>
                      )}
                    </td>
                    {(isSales || isDev) ? (
                      <td>
                        {(isSales ? editingProject : editingDevProject) === inv.id ? (
                          <select className="cat-select" value={inv.projectId||""} autoFocus
                            onChange={e => linkInvoiceToProject(inv.id, e.target.value)}
                            onBlur={() => { setEditingProject(null); setEditingDevProject(null); }}>
                            <option value="">— None —</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        ) : (
                          <span className="cat-pill"
                            onClick={() => isSales ? setEditingProject(inv.id) : setEditingDevProject(inv.id)}
                            style={{ borderColor: projName ? "#388e3c" : "#e0ddd8" }}>
                            {projName
                              ? <><span style={{ fontSize:11 }}>📁</span><span style={{ color:"#388e3c", fontWeight:500, fontSize:12 }}>{projName}</span></>
                              : <span style={{ color:"#bbb", fontSize:12 }}>{isSales ? "Set project ✎" : "Link project ✎"}</span>}
                          </span>
                        )}
                      </td>
                    ) : <td/>}
                    {isSales ? (
                      <td>
                        {editingPO === inv.id ? (
                          <select className="cat-select" value={inv.poId||""} autoFocus
                            onChange={e => linkInvoiceToPO(inv.id, e.target.value)}
                            onBlur={() => setEditingPO(null)}>
                            <option value="">— None —</option>
                            {pos.map(po => <option key={po.id} value={po.id}>{po.id} · {po.description}</option>)}
                          </select>
                        ) : (
                          <span className="cat-pill" onClick={() => setEditingPO(inv.id)} style={{ borderColor: inv.poId ? "#1976d2" : "#e0ddd8" }}>
                            {inv.poId
                              ? <><span style={{ color:"#1976d2", fontWeight:600, fontSize:11 }}>🔗</span><span style={{ color:"#1976d2", fontWeight:500, fontSize:12 }}>{inv.poId}</span></>
                              : <span style={{ color:"#bbb", fontSize:12 }}>Link PO ✎</span>}
                          </span>
                        )}
                      </td>
                    ) : <td/>}
                    <td style={{ fontSize:11, color:"#bbb" }}>{inv._filename ? <span title={inv._filename}>📄 PDF</span> : "Manual"}</td>
                  </tr>
                );
              };

              // ── Category-view sub-section renderer ────────────────────────
              const renderCategoryView = (rows) => {
                const salesRows = rows.filter(i => i.category === "Sales");
                const costRows  = rows.filter(i => CAT_MAP[i.category]?.type === "cost");
                const uncatRows = rows.filter(i => !i.category || i.category === "Uncategorized");
                const salesTotal = salesRows.reduce((s,i) => s+(i.amount||0), 0);
                const costTotal  = costRows.reduce((s,i)  => s+(i.amount||0), 0);

                // Group cost rows by individual category (in INVOICE_CATEGORIES order)
                const costByCat = {};
                INVOICE_CATEGORIES.forEach(c => { if (c.type === "cost") costByCat[c.key] = []; });
                costRows.forEach(inv => {
                  const k = inv.category || "Uncategorized";
                  if (!costByCat[k]) costByCat[k] = [];
                  costByCat[k].push(inv);
                });
                // Only keep categories that have invoices this month
                const activeCostCats = INVOICE_CATEGORIES.filter(c => c.type === "cost" && (costByCat[c.key]||[]).length > 0);

                const TableHeader = ({ label, total, color, bg, count }) => (
                  <div style={{
                    padding:"11px 16px 10px",
                    background: bg,
                    borderBottom:"1px solid #eceae6",
                    display:"flex", alignItems:"center", justifyContent:"space-between"
                  }}>
                    <span style={{ fontWeight:700, fontSize:13, color, textTransform:"uppercase", letterSpacing:".07em" }}>{label}</span>
                    <span style={{ fontFamily:"DM Mono", fontSize:13, fontWeight:700, color }}>
                      {fmt(total)} <span style={{ fontSize:11.5, fontWeight:400, color:"#aaa" }}>· {count} invoice{count!==1?"s":""}</span>
                    </span>
                  </div>
                );

                const CatSeparator = ({ cat, rows: cRows }) => {
                  const cTotal = cRows.reduce((s,i) => s+(i.amount||0), 0);
                  return (
                    <tr>
                      <td colSpan={10} style={{
                        padding:"7px 16px 6px",
                        background:"#f7f7f5",
                        borderTop:"1px solid #eceae6",
                        borderBottom:"1px solid #eceae6",
                      }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <span style={{ width:8, height:8, borderRadius:"50%", background:cat.color, display:"inline-block", flexShrink:0 }}/>
                            <span style={{ fontWeight:600, fontSize:12.5, color: cat.color }}>{cat.label}</span>
                          </span>
                          <span style={{ fontFamily:"DM Mono", fontSize:12, color:"#888" }}>
                            {fmt(cTotal)} <span style={{ color:"#ccc" }}>· {cRows.length} inv</span>
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                };

                return (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>

                    {/* ── SALES TABLE ── */}
                    {salesRows.length > 0 && (
                      <div className="card" style={{ overflow:"hidden" }}>
                        <TableHeader label="💰 Sales · Revenue" total={salesTotal} color="#1565c0" bg="#e8f4fd" count={salesRows.length} />
                        <table className="tbl">
                          <thead>{COL_HEADERS}</thead>
                          <tbody>{salesRows.map((inv,i) => renderRow(inv, i))}</tbody>
                        </table>
                      </div>
                    )}

                    {/* ── COSTS TABLE ── */}
                    {costRows.length > 0 && (
                      <div className="card" style={{ overflow:"hidden" }}>
                        <TableHeader label="💸 Costs" total={costTotal} color="#c62828" bg="#fef0f0" count={costRows.length} />
                        <table className="tbl">
                          <thead>{COL_HEADERS}</thead>
                          <tbody>
                            {activeCostCats.map(cat => {
                              const cRows = costByCat[cat.key] || [];
                              if (cRows.length === 0) return null;
                              return (
                                <React.Fragment key={cat.key}>
                                  <CatSeparator cat={cat} rows={cRows} />
                                  {cRows.map((inv, i) => renderRow(inv, i))}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* ── UNCATEGORIZED TABLE ── */}
                    {uncatRows.length > 0 && (
                      <div className="card" style={{ overflow:"hidden" }}>
                        <TableHeader label="⚠ Uncategorized" total={uncatRows.reduce((s,i)=>s+(i.amount||0),0)} color="#b8860b" bg="#fffde7" count={uncatRows.length} />
                        <table className="tbl">
                          <thead>{COL_HEADERS}</thead>
                          <tbody>{uncatRows.map((inv,i) => renderRow(inv, i))}</tbody>
                        </table>
                      </div>
                    )}

                  </div>
                );
              };

              return sortedKeys.map(key => {
                const rows    = key === "__nodate__" ? noDate : groups[key];
                const total   = rows.reduce((s,i) => s+(i.amount||0), 0);
                const sales   = rows.filter(i => i.category==="Sales").reduce((s,i)=>s+(i.amount||0),0);
                const costs   = rows.filter(i => CAT_MAP[i.category]?.type==="cost").reduce((s,i)=>s+(i.amount||0),0);
                const overdue = rows.filter(i => i.status==="Overdue").length;
                const pending = rows.filter(i => i.status==="Pending").length;
                let monthLabel = "No Date";
                if (key !== "__nodate__") {
                  const [y, m] = key.split("-");
                  monthLabel = new Date(parseInt(y), parseInt(m)-1, 1).toLocaleString("en-US", { month:"long", year:"numeric" });
                }
                return (
                  <div key={key} style={{ marginBottom:26 }}>
                    {/* Month header */}
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                      <div style={{ fontWeight:700, fontSize:15, letterSpacing:"-.01em", whiteSpace:"nowrap" }}>{monthLabel}</div>
                      <div style={{ height:1, flex:1, background:"#eceae6" }}/>
                      <div style={{ display:"flex", gap:7, alignItems:"center", flexShrink:0 }}>
                        <span style={{ fontFamily:"DM Mono", fontSize:13, fontWeight:600 }}>{fmt(total)}</span>
                        <span style={{ fontSize:12, color:"#aaa" }}>{rows.length} inv</span>
                        {sales  > 0 && <span style={{ padding:"2px 8px", borderRadius:10, background:"#e3f2fd", color:"#1565c0", fontSize:11.5, fontWeight:600 }}>↑ {fmt(sales)}</span>}
                        {costs  > 0 && <span style={{ padding:"2px 8px", borderRadius:10, background:"#fce4ec", color:"#c62828", fontSize:11.5, fontWeight:600 }}>↓ {fmt(costs)}</span>}
                        {overdue> 0 && <span style={{ padding:"2px 8px", borderRadius:10, background:"#fce4ec", color:"#c62828", fontSize:11.5, fontWeight:600 }}>⚠ {overdue} overdue</span>}
                        {pending> 0 && <span style={{ padding:"2px 8px", borderRadius:10, background:"#fff8e1", color:"#f57f17", fontSize:11.5, fontWeight:600 }}>{pending} pending</span>}
                      </div>
                    </div>

                    {/* Flat view (All or Sales) */}
                    {invView !== "costs" && (
                      <div className="card" style={{ overflow:"hidden" }}>
                        <table className="tbl">
                          <thead>{COL_HEADERS}</thead>
                          <tbody>{rows.map((inv, idx) => renderRow(inv, idx))}</tbody>
                        </table>
                      </div>
                    )}

                    {/* Category view (Costs) */}
                    {invView === "costs" && renderCategoryView(rows)}
                  </div>
                );
              });
            })()}

            {uncatCount > 0 && (
              <div style={{ marginTop:4, fontSize:12.5, color:"#b8860b", display:"flex", alignItems:"center", gap:6 }}>
                ⚠️ <strong>{uncatCount}</strong> invoice{uncatCount!==1?"s":""} uncategorized — click the category badge to assign and update P&L.
              </div>
            )}
          </div>
        )}

        {/* ── ENGAGEMENTS ── */}
        {activeTab === "Engagements" && (() => {
          // Build engagements: merge POs with project invoice data
          const engagements = pos.map(po => {
            const proj = projects.find(p => p.id === po.projectId) || null;
            const salesInvs = invoices.filter(i => i.projectId === po.projectId && i.category === "Sales");
            const devInvs   = invoices.filter(i => i.projectId === po.projectId && CAT_MAP[i.category]?.group === "Developers");
            const totalBilled  = salesInvs.reduce((s,i) => s + toEUR(i.amount, i.currency), 0);
            const totalDevCost = devInvs.reduce((s,i)  => s + toEUR(i.amount, i.currency), 0);
            const margin       = totalBilled - totalDevCost;
            const marginPct    = totalBilled > 0 ? (margin / totalBilled) * 100 : 0;
            const outstanding  = salesInvs.filter(i => ["Pending","Overdue"].includes(i.status));
            const outstandingAmt = outstanding.reduce((s,i) => s + toEUR(i.amount, i.currency), 0);
            // Units consumed
            const seedBurn  = (po.monthlyBurn || []).reduce((s,v) => s+v, 0);
            const totalUnitsUsed = seedBurn;
            const remaining = Math.max(0, po.totalUnits - totalUnitsUsed);
            const usedPct   = Math.min(100, (totalUnitsUsed / po.totalUnits) * 100);
            const isOver    = totalUnitsUsed > po.totalUnits;
            const unit      = po.unitType === "hours" ? "h" : "d";
            const billingPct = po.amount > 0 ? Math.min(100, (totalBilled / po.amount) * 100) : 0;
            const daysUntilEnd = po.endDate ? Math.ceil((new Date(po.endDate) - new Date()) / 86400000) : null;
            return { po, proj, salesInvs, devInvs, totalBilled, totalDevCost, margin, marginPct,
                     outstanding, outstandingAmt, totalUnitsUsed, remaining, usedPct, isOver, unit,
                     billingPct, daysUntilEnd };
          });

          // Summary KPIs
          const activeEngs    = engagements.filter(e => e.po.status === "Active").length;
          const totalBilledAll = engagements.reduce((s,e) => s+e.totalBilled, 0);
          const totalCostAll   = engagements.reduce((s,e) => s+e.totalDevCost, 0);
          const totalOutstanding = engagements.reduce((s,e) => s+e.outstandingAmt, 0);
          const blendedMargin  = totalBilledAll > 0 ? ((totalBilledAll-totalCostAll)/totalBilledAll*100) : 0;

          const poStatusColor = s => ({ Active:{bg:"#e3f2fd",text:"#1565c0"}, Completed:{bg:"#e8f5e9",text:"#2e7d32"}, Pending:{bg:"#fff8e1",text:"#f57f17"} }[s] || {bg:"#f5f5f5",text:"#666"});

          const filtered = engFilter === "All" ? engagements : engagements.filter(e => e.po.status === engFilter);

          return (
            <div>
              {/* KPI row */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
                {[
                  { label:"Active Engagements", value:activeEngs,                       mono:false, color:"#1565c0" },
                  { label:"Total Billed",        value:fmt(totalBilledAll),              mono:true,  color:"#2e7d32" },
                  { label:"Blended Margin",      value:blendedMargin.toFixed(1)+"%",     mono:true,  color: blendedMargin>30?"#2e7d32":blendedMargin>15?"#f57c00":"#c62828" },
                  { label:"Outstanding",         value:fmt(totalOutstanding),            mono:true,  color:"#f57c00" },
                ].map(k => (
                  <div key={k.label} className="card" style={{ padding:"16px 20px" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#aaa", textTransform:"uppercase", letterSpacing:".07em", marginBottom:6 }}>{k.label}</div>
                    <div style={{ fontFamily: k.mono?"DM Mono":undefined, fontSize:22, fontWeight:700, color:k.color }}>{k.value}</div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div style={{ display:"flex", gap:6, marginBottom:16, alignItems:"center" }}>
                {["All","Active","Completed","Pending"].map(f => (
                  <button key={f} className={`filter-btn${engFilter===f?" active":""}`} onClick={() => setEngFilter(f)}>{f}</button>
                ))}
                <span style={{ marginLeft:"auto", fontSize:12.5, color:"#aaa" }}>
                  {filtered.length} engagement{filtered.length!==1?"s":""} · <strong style={{ color:"#1a1a1a", fontFamily:"DM Mono" }}>{fmt(filtered.reduce((s,e)=>s+e.po.amount,0))}</strong> total PO value
                </span>
              </div>

              {/* Engagement cards */}
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {filtered.map(eng => {
                  const { po, salesInvs, devInvs, totalBilled, totalDevCost, margin, marginPct,
                          outstanding, outstandingAmt, totalUnitsUsed, remaining, usedPct,
                          isOver, unit, billingPct, daysUntilEnd } = eng;
                  const isExpanded = expandedPO === po.id;
                  const sc = poStatusColor(po.status);
                  const marginColor = marginPct > 30 ? "#2e7d32" : marginPct > 15 ? "#f57c00" : "#c62828";
                  const marginBg    = marginPct > 30 ? "#f0faf2" : marginPct > 15 ? "#fff8e1" : "#fce4ec";
                  const billingBarColor = billingPct > 90 ? "#c62828" : billingPct > 70 ? "#f57c00" : "#1976d2";
                  const capacityBarColor = isOver ? "#c62828" : usedPct > 80 ? "#f57c00" : "#4caf50";

                  return (
                    <div key={po.id} className="card" style={{ overflow:"hidden" }}>

                      {/* ── Card header ── */}
                      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"18px 22px", cursor:"pointer" }}
                        onClick={() => setExpandedPO(isExpanded ? null : po.id)}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                            <span style={{ fontFamily:"DM Mono", fontSize:11.5, color:"#aaa" }}>{po.id}</span>
                            <span className="badge" style={{ background:sc.bg, color:sc.text }}>{po.status}</span>
                            {isOver && <span className="badge" style={{ background:"#fce4ec", color:"#c62828" }}>⚠ Over capacity</span>}
                            {outstanding.length > 0 && <span className="badge" style={{ background:"#fff8e1", color:"#f57f17" }}>⏳ {outstanding.length} outstanding</span>}
                          </div>
                          <div style={{ fontWeight:700, fontSize:15 }}>{po.client}</div>
                          <div style={{ fontSize:12.5, color:"#888", marginTop:2 }}>{po.description}</div>
                          <div style={{ fontSize:11.5, color:"#bbb", marginTop:3, display:"flex", gap:12 }}>
                            <span>📅 {po.startDate} → {po.endDate}</span>
                            {daysUntilEnd !== null && po.status === "Active" && (
                              <span style={{ color: daysUntilEnd < 14 ? "#c62828" : daysUntilEnd < 30 ? "#f57c00" : "#aaa", fontWeight: daysUntilEnd < 30 ? 600 : 400 }}>
                                {daysUntilEnd < 0 ? "⚠ Expired" : `${daysUntilEnd}d remaining`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right-side summary pills */}
                        <div style={{ display:"flex", gap:12, alignItems:"center", flexShrink:0, flexWrap:"wrap", justifyContent:"flex-end" }}>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontFamily:"DM Mono", fontSize:13, fontWeight:600, color:"#2e7d32" }}>{fmt(totalBilled)}</div>
                            <div style={{ fontSize:11, color:"#aaa" }}>billed of {fmt(po.amount)}</div>
                          </div>
                          <div style={{ color:"#ddd" }}>·</div>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontFamily:"DM Mono", fontSize:13, fontWeight:600, color:"#c62828" }}>{fmt(totalDevCost)}</div>
                            <div style={{ fontSize:11, color:"#aaa" }}>dev cost</div>
                          </div>
                          <div style={{ color:"#ddd" }}>·</div>
                          <div style={{ background:marginBg, borderRadius:10, padding:"6px 14px", textAlign:"center" }}>
                            <div style={{ fontFamily:"DM Mono", fontSize:14, fontWeight:700, color:marginColor }}>{fmt(margin)}</div>
                            <div style={{ fontSize:11, color:marginColor, fontWeight:600 }}>{marginPct.toFixed(1)}% margin</div>
                          </div>
                          <div style={{ textAlign:"right", minWidth:70 }}>
                            <div style={{ fontFamily:"DM Mono", fontSize:18, fontWeight:700, color: isOver?"#c62828":"#1a1a1a" }}>{Math.round(remaining)}{unit}</div>
                            <div style={{ fontSize:11, color:"#aaa" }}>left of {po.totalUnits}{unit}</div>
                          </div>
                        </div>
                        <div style={{ fontSize:18, color:"#ccc", userSelect:"none", marginLeft:4 }}>{isExpanded?"▲":"▼"}</div>
                      </div>

                      {/* ── Progress bars ── */}
                      <div style={{ padding:"0 22px 16px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                        {/* Billing burn */}
                        <div>
                          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11.5, color:"#aaa", marginBottom:5 }}>
                            <span>💰 Billing burn</span>
                            <span style={{ color:billingBarColor, fontWeight:600 }}>{billingPct.toFixed(1)}% of PO value</span>
                          </div>
                          <div style={{ height:8, borderRadius:4, background:"#eceae6", overflow:"hidden" }}>
                            <div style={{ height:"100%", borderRadius:4, background:billingBarColor, width:`${billingPct}%`, transition:"width .5s" }}/>
                          </div>
                          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#bbb", marginTop:3 }}>
                            <span>{fmt(totalBilled)} billed</span><span>{fmt(po.amount)} total</span>
                          </div>
                        </div>
                        {/* Capacity burn */}
                        <div>
                          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11.5, color:"#aaa", marginBottom:5 }}>
                            <span>⏱ Capacity used</span>
                            <span style={{ color:capacityBarColor, fontWeight:600 }}>{usedPct.toFixed(1)}% consumed</span>
                          </div>
                          <div style={{ height:8, borderRadius:4, background:"#eceae6", overflow:"hidden" }}>
                            <div style={{ height:"100%", borderRadius:4, background:capacityBarColor, width:`${usedPct}%`, transition:"width .5s" }}/>
                          </div>
                          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#bbb", marginTop:3 }}>
                            <span>{Math.round(totalUnitsUsed)}{unit} used</span><span>{po.totalUnits}{unit} total</span>
                          </div>
                        </div>
                      </div>

                      {/* ── Expanded detail ── */}
                      {isExpanded && (
                        <div style={{ borderTop:"1px solid #f0eeea" }}>

                          {/* Monthly burndown */}
                          <div style={{ padding:"18px 22px 14px", borderBottom:"1px solid #f0eeea" }}>
                            <div style={{ fontWeight:600, fontSize:13, color:"#555", marginBottom:14 }}>Monthly Capacity Burndown ({unit})</div>
                            <div style={{ display:"flex", gap:6, alignItems:"flex-end", height:80 }}>
                              {MONTHS.map((m, i) => {
                                const val = po.monthlyBurn?.[i] || 0;
                                const maxBurn = Math.max(...(po.monthlyBurn||[]), 1);
                                const cum = (po.monthlyBurn||[]).slice(0,i+1).reduce((s,v)=>s+v,0);
                                const isWarn = cum / po.totalUnits > 0.8;
                                return (
                                  <div key={m} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                                    <div style={{ fontSize:10, color:"#aaa", fontFamily:"DM Mono" }}>{val>0?val:""}</div>
                                    <div style={{ width:"100%", display:"flex", alignItems:"flex-end", height:52 }}>
                                      <div style={{ width:"100%", borderRadius:"3px 3px 0 0", background: val===0?"#f0eeea":isWarn?"#ff9800":"#1976d2", height:`${val===0?8:(val/maxBurn)*100}%`, minHeight:val===0?4:8, transition:"height .4s" }}/>
                                    </div>
                                    <div style={{ fontSize:10.5, color:"#aaa" }}>{m}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:"1px solid #f0eeea" }}>

                            {/* Sales invoices */}
                            <div style={{ padding:"16px 22px", borderRight:"1px solid #f0eeea" }}>
                              <div style={{ fontWeight:600, fontSize:13, color:"#2e7d32", marginBottom:10 }}>
                                💰 Sales Invoices
                                <span style={{ fontSize:12, fontWeight:400, color:"#aaa", marginLeft:8 }}>{salesInvs.length} total · {fmt(totalBilled)}</span>
                              </div>
                              {salesInvs.length === 0 ? (
                                <div style={{ fontSize:12.5, color:"#bbb", fontStyle:"italic" }}>No sales invoices linked yet</div>
                              ) : (
                                <table className="tbl">
                                  <thead><tr><th>Invoice #</th><th style={{textAlign:"right"}}>Amount</th><th>Issued</th><th>Due</th><th>Status</th></tr></thead>
                                  <tbody>
                                    {salesInvs.map((inv,ii) => (
                                      <tr key={ii}>
                                        <td style={{ fontFamily:"DM Mono", fontSize:11.5, color:"#666" }}>{inv.id}</td>
                                        <td className="num" style={{ fontWeight:600, color:"#2e7d32" }}>
                                          {fmt(toEUR(inv.amount, inv.currency))}
                                          {inv.currency !== "EUR" && <div style={{ fontSize:10, color:"#bbb" }}>{CUR_SYMBOLS[inv.currency]||""}{Math.round(inv.amount).toLocaleString("de-DE")} {inv.currency}</div>}
                                        </td>
                                        <td style={{ fontSize:11.5, color:"#888" }}>{inv.issued||"—"}</td>
                                        <td style={{ fontSize:11.5, color: inv.status==="Overdue"?"#c62828":"#888", fontWeight:inv.status==="Overdue"?600:400 }}>{inv.due||"—"}</td>
                                        <td><span className="badge" style={{ background:statusColors[inv.status]?.bg||"#f5f5f5", color:statusColors[inv.status]?.text||"#666" }}>{inv.status}</span></td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>

                            {/* Dev invoices */}
                            <div style={{ padding:"16px 22px" }}>
                              <div style={{ fontWeight:600, fontSize:13, color:"#c62828", marginBottom:10 }}>
                                👨‍💻 Developer Invoices
                                <span style={{ fontSize:12, fontWeight:400, color:"#aaa", marginLeft:8 }}>{devInvs.length} total · {fmt(totalDevCost)}</span>
                              </div>
                              {devInvs.length === 0 ? (
                                <div style={{ fontSize:12.5, color:"#bbb", fontStyle:"italic" }}>No developer invoices linked yet</div>
                              ) : (
                                <table className="tbl">
                                  <thead><tr><th>Developer</th><th>Days/Hrs</th><th style={{textAlign:"right"}}>Amount</th><th>Issued</th><th>Status</th></tr></thead>
                                  <tbody>
                                    {devInvs.map((inv,ii) => (
                                      <tr key={ii}>
                                        <td style={{ fontWeight:500, fontSize:12.5 }}>{inv.client||"—"}</td>
                                        <td style={{ fontFamily:"DM Mono", fontSize:12, color:"#666" }}>{inv.devDays}{inv.devUnit==="hours"?"h":"d"}</td>
                                        <td className="num" style={{ fontWeight:600, color:"#c62828" }}>
                                          {fmt(toEUR(inv.amount, inv.currency))}
                                          {inv.currency !== "EUR" && <div style={{ fontSize:10, color:"#bbb" }}>{CUR_SYMBOLS[inv.currency]||""}{Math.round(inv.amount).toLocaleString("de-DE")} {inv.currency}</div>}
                                        </td>
                                        <td style={{ fontSize:11.5, color:"#888" }}>{inv.issued||"—"}</td>
                                        <td><span className="badge" style={{ background:statusColors[inv.status]?.bg||"#f5f5f5", color:statusColors[inv.status]?.text||"#666" }}>{inv.status}</span></td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}

                              {/* Balance check */}
                              {(salesInvs.length > 0 || devInvs.length > 0) && (
                                <div style={{ marginTop:14, padding:"12px 14px", borderRadius:8, background: marginPct > 30 ? "#f0faf2" : marginPct > 15 ? "#fff8e1" : "#fce4ec", border:`1px solid ${marginPct>30?"#c8e6c9":marginPct>15?"#ffe082":"#ffcdd2"}` }}>
                                  <div style={{ fontSize:11.5, fontWeight:600, color:"#555", marginBottom:6 }}>⚖ Balance Check</div>
                                  <div style={{ display:"flex", gap:16, fontSize:12, fontFamily:"DM Mono" }}>
                                    <span style={{ color:"#2e7d32" }}>Revenue: {fmt(totalBilled)}</span>
                                    <span style={{ color:"#aaa" }}>−</span>
                                    <span style={{ color:"#c62828" }}>Dev cost: {fmt(totalDevCost)}</span>
                                    <span style={{ color:"#aaa" }}>=</span>
                                    <span style={{ fontWeight:700, color:marginColor }}>Margin: {fmt(margin)} ({marginPct.toFixed(1)}%)</span>
                                  </div>
                                </div>
                              )}
                            </div>

                          </div>

                          {/* Outstanding invoices */}
                          {outstanding.length > 0 && (
                            <div style={{ padding:"14px 22px" }}>
                              <div style={{ fontWeight:600, fontSize:13, color:"#f57f17", marginBottom:10 }}>
                                ⏳ Outstanding · Awaiting Payment
                                <span style={{ fontSize:12, fontWeight:400, color:"#aaa", marginLeft:8 }}>{fmt(outstandingAmt)}</span>
                              </div>
                              <table className="tbl">
                                <thead><tr><th>Invoice #</th><th style={{textAlign:"right"}}>Amount</th><th>Due</th><th>Status</th></tr></thead>
                                <tbody>
                                  {outstanding.map((inv,ii) => (
                                    <tr key={ii}>
                                      <td style={{ fontFamily:"DM Mono", fontSize:11.5, color:"#666" }}>{inv.id}</td>
                                      <td className="num" style={{ fontWeight:600 }}>{fmt(toEUR(inv.amount, inv.currency))}</td>
                                      <td style={{ fontSize:12, color: inv.status==="Overdue"?"#c62828":"#888", fontWeight:inv.status==="Overdue"?600:400 }}>{inv.due||"—"}</td>
                                      <td><span className="badge" style={{ background:statusColors[inv.status]?.bg||"#f5f5f5", color:statusColors[inv.status]?.text||"#666" }}>{inv.status}</span></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
