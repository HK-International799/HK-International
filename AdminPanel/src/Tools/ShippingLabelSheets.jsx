import { useCallback, useState } from "react";

const LOGO_SRC = "/logo.png";

const TO_FIELDS = [
  { key: "name", label: "Name" },
  { key: "company", label: "Company (Opt.)" },
  { key: "addr1", label: "Addr Line 1" },
  { key: "addr2", label: "Addr Line 2" },
  { key: "area", label: "Area/Locality" },
];

const TO_FIELDS_SPLIT = [
  [{ key: "city", label: "City" }, { key: "state", label: "State" }],
  [{ key: "pin", label: "PIN Code" }, { key: "country", label: "Country" }],
];

const defaultTo = () => ({
  name: "", company: "", addr1: "", addr2: "", area: "",
  city: "", state: "", pin: "", country: "", mobile: "",
});

const defaultFrom = () => ({
  name: "1A HK International — c/o Anurag Pandey",
  line1: "Premashree House, New Colony, Kakarmatta, BLW",
  line2: "Varanasi, Uttar Pradesh – 221004, India",
  contact: "+91-7991845638",
  email: "info@hkinternational.uk",
  web: "hkinternational.uk",
});

const defaultWarning = () => ({
  bend: "DO NOT BEND",
  sub: "Official Training Certificate Enclosed\nHandle With Care · Important Document",
});

const defaultLabel = () => ({
  to: defaultTo(),
  from: defaultFrom(),
  warning: defaultWarning(),
});

const defaultSheet = () => ({
  id: crypto.randomUUID(),
  labels: [defaultLabel(), defaultLabel(), defaultLabel(), defaultLabel()],
});

function EditLine({ value, onChange, className = "" }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={
        "flex-1 min-w-[24px] h-[13px] bg-transparent border-b border-dotted border-gray-400 " +
        "text-[7.4pt] text-gray-900 font-medium outline-none px-0 " +
        "focus:border-solid focus:border-blue-700 focus:bg-blue-50/40 " + className
      }
    />
  );
}

function ToBlock({ to, onChange }) {
  const set = (key) => (val) => onChange({ ...to, [key]: val });
  return (
    <div className="mb-[9px]">
      {TO_FIELDS.map((f) => (
        <div key={f.key} className="flex items-baseline gap-[5px] mb-[6px]">
          <span className="text-[6.1pt] font-bold tracking-wide text-gray-500 uppercase whitespace-nowrap w-[70px]">
            {f.label}
          </span>
          <EditLine value={to[f.key]} onChange={set(f.key)} />
        </div>
      ))}
      {TO_FIELDS_SPLIT.map((pair, i) => (
        <div key={i} className="flex items-baseline gap-[8px] mb-[6px]">
          {pair.map((f) => (
            <span key={f.key} className="flex items-baseline gap-[5px] flex-1">
              <span className="text-[6.1pt] font-bold tracking-wide text-gray-500 uppercase whitespace-nowrap">
                {f.label}
              </span>
              <EditLine value={to[f.key]} onChange={set(f.key)} />
            </span>
          ))}
        </div>
      ))}
      <div className="flex items-baseline gap-[5px] mb-[6px]">
        <span className="text-[6.1pt] font-bold tracking-wide text-gray-500 uppercase whitespace-nowrap w-[70px]">
          Mobile
        </span>
        <EditLine value={to.mobile} onChange={set("mobile")} />
      </div>
    </div>
  );
}

function FromBlock({ from, onChange }) {
  const set = (key) => (e) => onChange({ ...from, [key]: e.target.value });
  const inputCls =
    "bg-transparent outline-none focus:bg-purple-50 rounded-[1mm] px-0.5";
  return (
    <div className="bg-[#faf9f6] border border-[#ece7da] rounded-[2mm] px-[11px] pt-[9px] pb-[8px] mb-[9px]">
      <input value={from.name} onChange={set("name")}
        className={`w-full text-[8.6pt] font-extrabold text-gray-900 mb-[2px] ${inputCls}`} />
      <input value={from.line1} onChange={set("line1")}
        className={`w-full text-[7.1pt] text-gray-700 leading-[1.42] ${inputCls}`} />
      <input value={from.line2} onChange={set("line2")}
        className={`w-full text-[7.1pt] text-gray-700 leading-[1.42] ${inputCls}`} />
      <div className="flex items-center text-[7.1pt] text-gray-700 leading-[1.42] gap-[6px]">
        <span className="text-gray-500 font-bold shrink-0">Mob:</span>
        <input value={from.contact} onChange={set("contact")} className={`w-[85px] ${inputCls}`} />
        <span className="text-gray-500 font-bold shrink-0">Email:</span>
        <input value={from.email} onChange={set("email")} className={`flex-1 ${inputCls}`} />
      </div>
      <div className="flex items-center text-[7.1pt] gap-[6px]">
        <span className="text-gray-500 font-bold shrink-0">Web:</span>
        <input value={from.web} onChange={set("web")}
          className={`flex-1 text-blue-700 font-bold ${inputCls}`} />
      </div>
    </div>
  );
}

function WarningBlock({ warning, onChange }) {
  return (
    <div className="mt-auto border border-red-600 rounded-[2mm] bg-red-50 px-[10px] py-[8px] flex items-center gap-[8px]">
      <svg viewBox="0 0 24 24" fill="none" className="w-[8mm] h-[8mm] shrink-0">
        <path d="M12 2 2 7v6c0 5 4.2 8.6 10 9 5.8-.4 10-4 10-9V7L12 2Z" stroke="#C81E2C" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M12 8v5" stroke="#C81E2C" strokeWidth="1.9" strokeLinecap="round" />
        <circle cx="12" cy="16.3" r="1" fill="#C81E2C" />
      </svg>
      <div className="flex-1">
        <input
          value={warning.bend}
          onChange={(e) => onChange({ ...warning, bend: e.target.value })}
          className="w-full bg-transparent outline-none text-[12.5pt] font-black tracking-wide text-red-600 leading-[1.05] mb-[3px] focus:bg-red-100 rounded-[1mm]"
        />
        <textarea
          value={warning.sub}
          onChange={(e) => onChange({ ...warning, sub: e.target.value })}
          rows={2}
          className="w-full bg-transparent outline-none resize-none text-[6.4pt] font-bold tracking-wide text-red-800 leading-[1.42] uppercase focus:bg-red-100 rounded-[1mm]"
        />
      </div>
    </div>
  );
}

function Label({ label, onChange }) {
  return (
    <div className="relative w-full h-full border border-[#d7d2c4] rounded-[4mm] px-[14px] pt-[3mm] pb-[10px] flex flex-col bg-white overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1.1mm] bg-gradient-to-r from-[#3C4CA0] via-[#7A2E8C] to-[#E15A2E]" />
      <div className="flex justify-center pt-[7px] pb-[5px]">
        <img
          src={LOGO_SRC}
          alt="1A HK International"
          className="h-[15mm] w-auto"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-[#C79A46] to-transparent mb-[8px]" />

      <div className="flex items-center gap-[5px] mb-[5px]">
        <svg viewBox="0 0 24 24" fill="none" className="w-[15px] h-[15px] shrink-0">
          <path d="M12 22s7-7.58 7-13A7 7 0 0 0 5 9c0 5.42 7 13 7 13Z" stroke="#3C4CA0" strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="12" cy="9" r="2.4" stroke="#3C4CA0" strokeWidth="1.8" />
        </svg>
        <span className="text-[8.4pt] font-extrabold tracking-[1.6px] text-blue-700">TO</span>
        <span className="flex-1 border-t border-gray-300 ml-[4px]" />
      </div>

      <ToBlock to={label.to} onChange={(to) => onChange({ ...label, to })} />

      <div className="flex items-center gap-[5px] mb-[5px]">
        <svg viewBox="0 0 24 24" fill="none" className="w-[15px] h-[15px] shrink-0">
          <path d="M4 21V9.5L12 4l8 5.5V21" stroke="#7A2E8C" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M9 21v-6h6v6" stroke="#7A2E8C" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 12h.01M15 12h.01M9 9h.01M15 9h.01" stroke="#7A2E8C" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span className="text-[8.4pt] font-extrabold tracking-[1.6px] text-purple-700">FROM</span>
        <span className="flex-1 border-t border-gray-300 ml-[4px]" />
      </div>

      <FromBlock from={label.from} onChange={(from) => onChange({ ...label, from })} />
      <WarningBlock warning={label.warning} onChange={(warning) => onChange({ ...label, warning })} />
    </div>
  );
}

export default function ShippingLabelSheets() {
  const [sheets, setSheets] = useState([defaultSheet()]);

  const addSheet = useCallback(() => setSheets((p) => [...p, defaultSheet()]), []);

  const removeSheet = useCallback((id) => {
    setSheets((prev) => {
      if (prev.length <= 1) {
        alert('At least one sheet is required. Add another sheet first, or use "Clear All Fields" instead.');
        return prev;
      }
      return prev.filter((s) => s.id !== id);
    });
  }, []);

  const updateLabel = useCallback((sheetId, labelIndex, newLabel) => {
    setSheets((prev) =>
      prev.map((s) =>
        s.id !== sheetId ? s : { ...s, labels: s.labels.map((l, i) => (i === labelIndex ? newLabel : l)) }
      )
    );
  }, []);

  const clearAllTo = useCallback(() => {
    if (!confirm('Clear all "TO" address fields on every sheet? Sender details and warning text will be kept.')) return;
    setSheets((prev) => prev.map((s) => ({ ...s, labels: s.labels.map((l) => ({ ...l, to: defaultTo() })) })));
  }, []);

  // Ease-of-prep: copy one filled-in label to all 4 slots on its sheet
  const duplicateToWholeSheet = useCallback((sheetId, labelIndex) => {
    setSheets((prev) =>
      prev.map((s) => {
        if (s.id !== sheetId) return s;
        const source = s.labels[labelIndex];
        return { ...s, labels: s.labels.map(() => ({ ...source, to: { ...source.to } })) };
      })
    );
  }, []);

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen">
      <div className="print:hidden sticky top-0 z-50 flex flex-wrap items-center justify-center gap-2 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="mr-3">
          <div className="text-[13px] font-extrabold text-gray-900">1A HK International</div>
          <div className="text-[10.5px] text-gray-500">Editable shipping address label sheets</div>
        </div>
        <button onClick={addSheet}
          className="px-4 py-2 rounded-md text-[12.5px] font-bold text-white bg-[#3C4CA0] hover:bg-[#33408C]">
          + Add New Sheet (4 Labels)
        </button>
        <button onClick={handlePrint}
          className="px-4 py-2 rounded-md text-[12.5px] font-bold text-white bg-[#C81E2C] hover:bg-[#A9101D]">
          🖨 Print All Sheets
        </button>
        <button onClick={clearAllTo}
          className="px-4 py-2 rounded-md text-[12.5px] font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900">
          Clear All Fields
        </button>
      </div>

      <div className="print:hidden max-w-[210mm] mx-auto mt-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-[11.5px] text-amber-800 text-center">
        Click directly on any field to type. Hover a label and hit <b>“Copy to sheet”</b> to fill all 4 slots on that
        sheet with the same recipient, then <b>Print All Sheets</b> when ready.
      </div>

      <div className="py-4 pb-16">
        {sheets.map((sheet, sIdx) => (
          <div key={sheet.id} className="print-sheet relative max-w-[210mm] mx-auto my-4">
            <div className="print:hidden flex items-center justify-between max-w-[210mm] mx-auto mb-1.5 px-1">
              <div className="text-[11.5px] font-extrabold text-gray-500">
                Sheet <span className="text-blue-700">{sIdx + 1}</span>{" "}
                <span className="text-gray-400 font-medium">· A4 · 4 labels</span>
              </div>
              <button onClick={() => removeSheet(sheet.id)} title="Remove this sheet"
                className="w-[26px] h-[26px] flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600">
                ✕
              </button>
            </div>

            <div className="relative w-[210mm] h-[297mm] bg-white shadow-lg print:shadow-none grid grid-cols-2 grid-rows-2">
              <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 border-l border-dotted border-gray-300" />
              <div className="pointer-events-none absolute left-0 right-0 top-1/2 border-t border-dotted border-gray-300" />
              {sheet.labels.map((label, lIdx) => (
                <div key={lIdx} className="relative p-[5mm] group print:break-inside-avoid">
                  <button
                    onClick={() => duplicateToWholeSheet(sheet.id, lIdx)}
                    title="Copy this recipient to all 4 labels on this sheet"
                    className="print:hidden absolute top-[2px] right-[2px] z-10 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] px-2 py-1 rounded bg-gray-800/80 text-white hover:bg-gray-900"
                  >
                    Copy to sheet
                  </button>
                  <Label label={label} onChange={(l) => updateLabel(sheet.id, lIdx, l)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="print:hidden fixed right-4 bottom-4 z-50 flex flex-col gap-2 sm:hidden">
        <button onClick={addSheet} className="w-11 h-11 rounded-full bg-[#3C4CA0] text-white text-xl shadow-lg">+</button>
        <button onClick={handlePrint} className="w-11 h-11 rounded-full bg-[#C81E2C] text-white text-lg shadow-lg">🖨</button>
      </div>
    </div>
  );
}