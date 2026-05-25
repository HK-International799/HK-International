import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Star,
  MessageSquare,
  ZoomIn,
  ZoomOut,
  X,
  Loader2,
  FileText,
  Download,
  AlertTriangle,
  RotateCcw,
  Save,
  Check,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// ─── PDF.JS WORKER (react-pdf 9.x + pdfjs-dist 4.x) ──────────────────────────
// CRITICAL: We load the worker from react-pdf's OWN pdfjs-dist, not from the
// top-level pdfjs-dist. react-pdf imports its internal copy, and the worker
// must match that copy byte-for-byte. Mixing versions = "fake worker failed".
//
// `new URL(..., import.meta.url)` is the Vite-idiomatic way to ship the
// worker file as a static asset. Vite emits it with a hashed filename in
// production and serves it directly in dev — no CDN, no 404s.

// ==============================================
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.mjs",
//   import.meta.url,
// ).toString();
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// ─── ANNOTATION TYPES ─────────────────────────────────────────────────────────
export const ANNOTATION_TYPES = {
  correct: {
    label: "Correct",
    Icon: CheckCircle2,
    color: "#10b981",
    fill: "#10b98133",
  },
  wrong: { label: "Wrong", Icon: XCircle, color: "#ef4444", fill: "#ef444433" },
  partial: {
    label: "Partial",
    Icon: MinusCircle,
    color: "#f59e0b",
    fill: "#f59e0b33",
  },
  note: {
    label: "Note",
    Icon: MessageSquare,
    color: "#6366f1",
    fill: "#6366f133",
  },
  star: { label: "Star", Icon: Star, color: "#f97316", fill: "#f9731633" },
};

const uid = () => Math.random().toString(36).slice(2, 10);

// ─── FIX #2: Improved file type detection ─────────────────────────────────────
// Handles Cloudinary URLs with query params, base64 data URIs, etc.
const detectType = (fileName = "", fileUrl = "") => {
  const source = `${fileName} ${fileUrl}`.toLowerCase();
  if (source.includes(".pdf") || source.includes("application/pdf"))
    return "pdf";
  if (
    source.includes(".docx") ||
    source.includes("application/vnd.openxmlformats")
  )
    return "docx";
  if (source.includes(".doc") || source.includes("application/msword"))
    return "docx";
  // Default to PDF since submissions are most likely PDFs
  return "pdf";
};

// ─── ANNOTATION PIN ───────────────────────────────────────────────────────────
// FIX #3: `activeType` must be passed as a prop — it was referenced as a
// free variable before, causing a ReferenceError that silently swallowed events
// and made annotation pins invisible/unclickable.
function AnnotationPin({ annotation, onDelete, readOnly, activeType }) {
  const [hovered, setHovered] = useState(false);
  const def = ANNOTATION_TYPES[annotation.type] || ANNOTATION_TYPES.note;
  const { Icon, color, fill, label } = def;

  return (
    <div
      style={{
        position: "absolute",
        left: `${annotation.xPct}%`,
        top: `${annotation.yPct}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 30,
        cursor: readOnly ? "default" : "pointer",
        userSelect: "none",
        // FIX: Only block pointer events when an annotation type is actively
        // being placed (so you can't accidentally delete while placing).
        // Previously used undeclared `activeType` which threw an error.
        pointerEvents: activeType ? "none" : "auto",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (!readOnly) onDelete(annotation.id);
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: hovered
            ? `drop-shadow(0 0 10px ${color}cc)`
            : `drop-shadow(0 2px 6px rgba(0,0,0,0.3))`,
          transform: hovered ? "scale(1.3)" : "scale(1)",
          transition: "all 0.15s ease",
        }}
      >
        <Icon size={36} color={color} strokeWidth={2} fill={fill} />
      </div>

      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 10px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0f172a",
            color: "#f1f5f9",
            borderRadius: 8,
            padding: "5px 12px",
            fontSize: 11,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            zIndex: 100,
            border: `1px solid ${color}55`,
          }}
        >
          <span style={{ color, fontWeight: 700 }}>{label}</span>
          {annotation.note && (
            <span style={{ color: "#94a3b8", marginLeft: 6 }}>
              — {annotation.note}
            </span>
          )}
          {!readOnly && (
            <span style={{ color: "#64748b", marginLeft: 6 }}>
              · click to remove
            </span>
          )}
          <div
            style={{
              position: "absolute",
              bottom: -4,
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: 8,
              height: 8,
              background: "#0f172a",
              borderRight: `1px solid ${color}44`,
              borderBottom: `1px solid ${color}44`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── PER-PAGE PDF WRAPPER ─────────────────────────────────────────────────────
function PdfPageWithAnnotations({
  pageNumber,
  scale,
  annotations,
  onAdd,
  onDelete,
  activeType,
  readOnly,
}) {
  const wrapperRef = useRef(null);
  const overlayRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const sync = () => {
      const canvas = el.querySelector("canvas");
      if (
        canvas &&
        (canvas.offsetWidth !== canvasSize.w ||
          canvas.offsetHeight !== canvasSize.h)
      ) {
        setCanvasSize({ w: canvas.offsetWidth, h: canvas.offsetHeight });
      }
    };

    sync();
    // Poll briefly after mount as canvas renders async
    const t = setTimeout(sync, 300);
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    const mo = new MutationObserver(sync);
    mo.observe(el, { childList: true, subtree: true, attributes: true });
    return () => {
      clearTimeout(t);
      ro.disconnect();
      mo.disconnect();
    };
  }, [scale]);

  const handleClick = useCallback(
    (e) => {
      if (readOnly || !activeType || !overlayRef.current) return;
      e.stopPropagation();
      const rect = overlayRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;
      onAdd({
        id: uid(),
        page: pageNumber,
        xPct: Math.max(0, Math.min(100, xPct)),
        yPct: Math.max(0, Math.min(100, yPct)),
        type: activeType,
        note: "",
      });
    },
    [readOnly, activeType, pageNumber, onAdd],
  );

  const pageAnnotations = annotations.filter((a) => a.page === pageNumber);

  return (
    <div
      className="pdf-page-wrapper"
      style={{
        position: "relative",
        marginBottom: 28,
        lineHeight: 0,
        display: "block",
        marginLeft: "auto",
        marginRight: "auto",
        overflow: "visible",
      }}
    >
      {/* Page label */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 10,
          zIndex: 40,
          background: "rgba(15,23,42,0.65)",
          color: "#f1f5f9",
          fontSize: 10,
          fontWeight: 700,
          padding: "2px 10px",
          borderRadius: 20,
          letterSpacing: "0.06em",
          pointerEvents: "none",
          backdropFilter: "blur(4px)",
          userSelect: "none",
        }}
      >
        Page {pageNumber}
      </div>

      <div
        ref={wrapperRef}
        style={{
          display: "block",
          lineHeight: 0,
          boxShadow: "0 8px 40px rgba(0,0,0,0.28)",
        }}
      >
        <Page
          pageNumber={pageNumber}
          scale={scale}
          devicePixelRatio={1}
          renderAnnotationLayer={false}
          renderTextLayer={false}
        />
      </div>

      {canvasSize.w > 0 && canvasSize.h > 0 && (
        <div
          ref={overlayRef}
          onClick={handleClick}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: canvasSize.w,
            height: canvasSize.h,
            cursor: readOnly || !activeType ? "default" : "crosshair",
            // FIX: pointer events only needed when placing annotations
            zIndex: 50,
            pointerEvents: activeType ? "auto" : "none",
          }}
        >
          {/* FIX #3 applied: pass activeType prop to each AnnotationPin */}
          {pageAnnotations.map((ann) => (
            <AnnotationPin
              key={ann.id}
              annotation={ann}
              onDelete={onDelete}
              readOnly={readOnly}
              activeType={activeType}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PDF VIEWER ───────────────────────────────────────────────────────────────
// react-pdf v9: pass `file` as a string URL (or a stable object reference).
// Both `file` and `options` MUST be memoized — react-pdf compares by reference
// and will warn "File prop changed" / "Options prop changed" on every render
// if you inline a new object literal. That warning also triggers a full
// Document reload, which causes the worker to be re-spawned, which on a hot
// reload looks like the "Offscreen component error".
function PdfViewer({
  fileUrl,
  annotations,
  onAdd,
  onDelete,
  activeType,
  readOnly,
  scale,
  onPagesLoaded,
}) {
  const [numPages, setNumPages] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memoize the file object. Passing a string is the simplest path and
  // already stable, but we wrap in useMemo so adding httpHeaders or
  // withCredentials later won't reintroduce the "File prop changed" warning.
  const memoizedFile = useMemo(
    () => (fileUrl ? { url: fileUrl } : null),
    [fileUrl],
  );

  // Memoize the options object — referential stability is required.
  // cMapUrl / standardFontDataUrl point at the worker's sibling assets,
  // which Vite serves from node_modules at the same base path.
  const memoizedOptions = useMemo(
    () => ({
      cMapUrl: "/node_modules/pdfjs-dist/cmaps/",
      cMapPacked: true,
      standardFontDataUrl: "/node_modules/pdfjs-dist/standard_fonts/",
      withCredentials: false,
    }),
    [],
  );

  // Reset state when the file changes so old pages don't flash.
  useEffect(() => {
    setNumPages(null);
    setLoadError(null);
    setLoading(true);
  }, [fileUrl]);

  const handleLoadSuccess = useCallback(
    ({ numPages: n }) => {
      setNumPages(n);
      setLoading(false);
      setLoadError(null);
      onPagesLoaded?.(n);
    },
    [onPagesLoaded],
  );

  const handleLoadError = useCallback((err) => {
    // eslint-disable-next-line no-console
    console.error("PDF load error:", err);
    setLoadError(err?.message || "Failed to load PDF");
    setLoading(false);
  }, []);

  // Defensive: if fileUrl arrives as null/undefined (modal opened before
  // signed URL resolved), render a friendly placeholder instead of letting
  // <Document> crash with "Invalid parameter object".
  if (!fileUrl) {
    return (
      <div className="flex items-center gap-3 py-20 text-slate-400">
        <Loader2 size={22} className="animate-spin" />
        <span className="text-sm font-medium">Preparing document…</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Document
        file={memoizedFile}
        options={memoizedOptions}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
        loading={null}
        error={null}
        noData={null}
      >
        {loading && (
          <div className="flex items-center gap-3 py-20 text-slate-400">
            <Loader2 size={22} className="animate-spin" />
            <span className="text-sm font-medium">Loading PDF…</span>
          </div>
        )}

        {loadError && (
          <div className="flex flex-col items-center gap-3 py-12 text-red-400 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} />
              <span>Failed to load PDF: {loadError}</span>
            </div>
            <p className="text-slate-500 text-xs">
              Try opening or downloading the file directly:
            </p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition"
            >
              <Download size={12} /> Open original file
            </a>
          </div>
        )}

        {!loading &&
          !loadError &&
          numPages &&
          Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <PdfPageWithAnnotations
              key={pageNum}
              pageNumber={pageNum}
              scale={scale}
              annotations={annotations}
              onAdd={onAdd}
              onDelete={onDelete}
              activeType={activeType}
              readOnly={readOnly}
            />
          ))}
      </Document>
    </div>
  );
}

// ─── DOCX VIEWER ─────────────────────────────────────────────────────────────
function DocxViewer({
  fileUrl,
  annotations,
  onAdd,
  onDelete,
  activeType,
  readOnly,
  scale,
  onPagesLoaded,
}) {
  const [html, setHtml] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mammoth = await import("mammoth");
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = await res.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: buf });
        if (!cancelled) {
          setHtml(result.value);
          onPagesLoaded?.(1);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  const handleClick = useCallback(
    (e) => {
      if (readOnly || !activeType || !overlayRef.current) return;
      const rect = overlayRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;
      onAdd({
        id: uid(),
        page: 1,
        xPct: Math.max(0, Math.min(100, xPct)),
        yPct: Math.max(0, Math.min(100, yPct)),
        type: activeType,
        note: "",
      });
    },
    [readOnly, activeType, onAdd],
  );

  if (loading)
    return (
      <div className="flex items-center gap-3 py-20 text-slate-400">
        <Loader2 size={22} className="animate-spin" />
        <span className="text-sm">Converting document…</span>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-red-400 text-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>Failed: {error}</span>
        </div>
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
        >
          <Download size={12} /> Open original file
        </a>
      </div>
    );

  return (
    <div
      style={{
        position: "relative",
        background: "#fff",
        boxShadow: "0 8px 40px rgba(0,0,0,0.22)",
        borderRadius: 3,
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        maxWidth: 850,
        width: "100%",
      }}
    >
      <div
        className="docx-content"
        style={{
          padding: "56px 64px",
          fontSize: 14,
          lineHeight: 1.8,
          color: "#0f172a",
          userSelect: "none",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div
        ref={overlayRef}
        onClick={handleClick}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          cursor: readOnly || !activeType ? "default" : "crosshair",
        }}
      >
        {annotations
          .filter((a) => a.page === 1)
          .map((ann) => (
            <AnnotationPin
              key={ann.id}
              annotation={ann}
              onDelete={onDelete}
              readOnly={readOnly}
              activeType={activeType}
            />
          ))}
      </div>
    </div>
  );
}

// ─── BURN ANNOTATIONS ONTO PDF ────────────────────────────────────────────────
async function downloadAnnotatedPdf(fileUrl, annotations, fileName) {
  try {
    const { PDFDocument } = await import("pdf-lib");

    const res = await fetch(fileUrl);
    const pdfBytes = await res.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    const pngCache = {};
    const getIconPng = async (type) => {
      if (pngCache[type]) return pngCache[type];
      const size = 48;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const { color } = ANNOTATION_TYPES[type] || ANNOTATION_TYPES.note;

      ctx.clearRect(0, 0, size, size);
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
      ctx.fillStyle = color + "33";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const cx = size / 2,
        cy = size / 2,
        r = size * 0.28;

      if (type === "correct") {
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.65, cy);
        ctx.lineTo(cx - r * 0.05, cy + r * 0.65);
        ctx.lineTo(cx + r * 0.75, cy - r * 0.55);
        ctx.stroke();
      } else if (type === "wrong") {
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.65, cy - r * 0.65);
        ctx.lineTo(cx + r * 0.65, cy + r * 0.65);
        ctx.moveTo(cx + r * 0.65, cy - r * 0.65);
        ctx.lineTo(cx - r * 0.65, cy + r * 0.65);
        ctx.stroke();
      } else if (type === "partial") {
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.75, cy);
        ctx.lineTo(cx + r * 0.75, cy);
        ctx.stroke();
      } else if (type === "star") {
        const spikes = 5,
          outerR = r,
          innerR = r * 0.42;
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const rad = (Math.PI / spikes) * i - Math.PI / 2;
          const rr = i % 2 === 0 ? outerR : innerR;
          i === 0
            ? ctx.moveTo(cx + rr * Math.cos(rad), cy + rr * Math.sin(rad))
            : ctx.lineTo(cx + rr * Math.cos(rad), cy + rr * Math.sin(rad));
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        if (ctx.roundRect)
          ctx.roundRect(cx - r * 0.9, cy - r * 0.8, r * 1.8, r * 1.3, 4);
        else ctx.rect(cx - r * 0.9, cy - r * 0.8, r * 1.8, r * 1.3);
        ctx.fill();
        ctx.fillStyle = "#fff";
        [
          [cx - r * 0.55, cy - r * 0.38, r * 1.1, r * 0.14],
          [cx - r * 0.55, cy - r * 0.1, r * 0.7, r * 0.14],
          [cx - r * 0.55, cy + r * 0.18, r * 0.9, r * 0.14],
        ].forEach(([x, y, w, h]) => {
          ctx.fillRect(x, y, w, h);
        });
      }

      return new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            const b64 = reader.result.split(",")[1];
            const bin = atob(b64);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            pngCache[type] = bytes;
            resolve(bytes);
          };
          reader.readAsDataURL(blob);
        }, "image/png");
      });
    };

    for (const ann of annotations) {
      const pageIdx = (ann.page || 1) - 1;
      if (pageIdx < 0 || pageIdx >= pages.length) continue;
      const page = pages[pageIdx];
      const { width: pW, height: pH } = page.getSize();
      const x = (ann.xPct / 100) * pW;
      const y = pH - (ann.yPct / 100) * pH;
      const iconSize = 24;
      const pngBytes = await getIconPng(ann.type);
      const pngImage = await pdfDoc.embedPng(pngBytes);
      page.drawImage(pngImage, {
        x: x - iconSize / 2,
        y: y - iconSize / 2,
        width: iconSize,
        height: iconSize,
        opacity: 0.95,
      });
    }

    const outBytes = await pdfDoc.save();
    const blob = new Blob([outBytes], { type: "application/pdf" });
    triggerDownload(blob, getDownloadName(fileName, "pdf", "annotated"));
  } catch (err) {
    console.error("Failed to create annotated PDF:", err);
    window.open(fileUrl, "_blank");
  }
}

function getDownloadName(fileName, fileType, suffix = "") {
  const fallback = fileType === "pdf" ? "submission" : "assignment-file";
  const base = fileName ? fileName.replace(/\.(pdf|docx|doc)$/i, "") : fallback;
  const ext = fileType === "pdf" ? ".pdf" : ".docx";
  return suffix ? `${base}_${suffix}${ext}` : `${base}${ext}`;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── DOWNLOAD REVIEWED ASSIGNMENT ────────────────────────────────────────────
// Produces a multi-page PDF:
//   page 1+ : structured evaluation report (student / assignment / submission
//             / evaluation / review sections + annotations summary)
//   page N+ : rasterized snapshots of every annotated document page
//
// Backward-compatible: if `reportContext` is missing the report still renders
// using the basic feedback / score the modal already had.
async function downloadReviewedAssignment({
  fileUrl,
  fileName,
  fileType,
  annotations,
  feedback,
  totalScore,
  maxMarks,
  reportContext,
  contentRef,
}) {
  try {
    const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
    const html2canvasLib = (await import("html2canvas")).default;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // ── Layout constants ────────────────────────────────────────────────────
    const PAGE_W = 612;
    const PAGE_H = 792;
    const MARGIN_X = 48;
    const MARGIN_TOP = 56;
    const MARGIN_BOTTOM = 56;
    const LINE = 16;
    const SECTION_GAP = 12;

    const fmtDate = (d) => {
      if (!d) return "—";
      try {
        return new Date(d).toLocaleString();
      } catch {
        return String(d);
      }
    };

    // Word-wrap a string to a given pixel width using the embedded font.
    const wrap = (text, size, maxWidth, useFont = font) => {
      const words = String(text || "").split(/\s+/);
      const lines = [];
      let line = "";
      for (const w of words) {
        const trial = line ? `${line} ${w}` : w;
        if (useFont.widthOfTextAtSize(trial, size) > maxWidth) {
          if (line) lines.push(line);
          line = w;
        } else {
          line = trial;
        }
      }
      if (line) lines.push(line);
      return lines.length ? lines : [""];
    };

    // Sanitize a string of glyphs Helvetica (WinAnsi) can't encode — pdf-lib
    // throws on characters like curly quotes or em-dashes otherwise.
    const safe = (s) =>
      String(s ?? "")
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, "-")
        .replace(/[\u2026]/g, "...")
        // strip anything still outside WinAnsi printable range
        .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");

    // Page/cursor manager so the report can spill onto more pages cleanly.
    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN_TOP;

    const newPage = () => {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN_TOP;
    };
    const need = (h) => {
      if (y - h < MARGIN_BOTTOM) newPage();
    };

    const drawText = (text, opts = {}) => {
      const size = opts.size || 11;
      const useFont = opts.bold ? boldFont : font;
      const color = opts.color || rgb(0.1, 0.1, 0.1);
      const x = opts.x ?? MARGIN_X;
      const maxW = PAGE_W - x - MARGIN_X;
      const lines = wrap(safe(text), size, maxW, useFont);
      for (const ln of lines) {
        need(size + 4);
        page.drawText(ln, { x, y, size, font: useFont, color });
        y -= size + 4;
      }
    };

    const drawSectionHeading = (text) => {
      need(28);
      y -= 6;
      page.drawText(safe(text), {
        x: MARGIN_X,
        y,
        size: 13,
        font: boldFont,
        color: rgb(0.18, 0.24, 0.55),
      });
      y -= 4;
      // underline
      page.drawLine({
        start: { x: MARGIN_X, y: y - 2 },
        end: { x: PAGE_W - MARGIN_X, y: y - 2 },
        thickness: 0.75,
        color: rgb(0.78, 0.82, 0.92),
      });
      y -= 14;
    };

    const drawKeyValue = (key, value) => {
      const size = 11;
      const labelWidth = 110;
      need(size + 4);
      page.drawText(safe(`${key}:`), {
        x: MARGIN_X,
        y,
        size,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.35),
      });
      const valueLines = wrap(
        safe(value ?? "—"),
        size,
        PAGE_W - MARGIN_X - (MARGIN_X + labelWidth),
        font,
      );
      let first = true;
      for (const ln of valueLines) {
        if (!first) need(size + 4);
        page.drawText(ln, {
          x: MARGIN_X + labelWidth,
          y,
          size,
          font,
          color: rgb(0.12, 0.12, 0.18),
        });
        y -= size + 4;
        first = false;
      }
    };

    // ── HEADER ──────────────────────────────────────────────────────────────
    page.drawText("Student Evaluation Report", {
      x: MARGIN_X,
      y,
      size: 22,
      font: boldFont,
      color: rgb(0.16, 0.22, 0.55),
    });
    y -= 28;
    page.drawText(
      `Generated ${new Date().toLocaleString()}`,
      { x: MARGIN_X, y, size: 9, font, color: rgb(0.45, 0.45, 0.5) },
    );
    y -= SECTION_GAP + 6;

    // ── STUDENT DETAILS ─────────────────────────────────────────────────────
    const student = reportContext?.student;
    drawSectionHeading("Student Details");
    drawKeyValue("Name", student?.name || "N/A");
    drawKeyValue("Email", student?.email || "N/A");
    if (student?.rollNumber) drawKeyValue("Roll Number", student.rollNumber);
    y -= SECTION_GAP;

    // ── ASSIGNMENT DETAILS ──────────────────────────────────────────────────
    const assignment = reportContext?.assignment;
    if (assignment) {
      drawSectionHeading("Assignment Details");
      drawKeyValue("Title", assignment.title || "N/A");
      if (assignment.description)
        drawKeyValue("Description", assignment.description);
      if (assignment.createdAt)
        drawKeyValue("Given On", fmtDate(assignment.createdAt));
      if (assignment.dueDate)
        drawKeyValue("Due Date", fmtDate(assignment.dueDate));
      if (assignment.totalMarks != null)
        drawKeyValue("Total Marks", String(assignment.totalMarks));
      y -= SECTION_GAP;
    }

    // ── SUBMISSION DETAILS ──────────────────────────────────────────────────
    const submissionMeta = reportContext?.submission;
    drawSectionHeading("Submission Details");
    drawKeyValue(
      "Submitted On",
      fmtDate(submissionMeta?.submittedAt) +
        (submissionMeta?.isLate ? "  (late)" : ""),
    );
    drawKeyValue("File Name", submissionMeta?.fileName || fileName || "N/A");
    if (submissionMeta?.fileUrl)
      drawKeyValue("File URL", submissionMeta.fileUrl);
    y -= SECTION_GAP;

    // ── EVALUATION ──────────────────────────────────────────────────────────
    drawSectionHeading("Evaluation");
    const evalCtx = reportContext?.evaluation;
    const scoreVal =
      (evalCtx?.totalScore ?? totalScore) != null
        ? `${evalCtx?.totalScore ?? totalScore} / ${
            evalCtx?.maxMarks ?? maxMarks ?? "?"
          }`
        : "Not graded";
    drawKeyValue("Total Score", scoreVal);

    const fbText = (evalCtx?.feedback ?? feedback) || "";
    if (fbText.trim()) {
      need(LINE);
      page.drawText("Feedback:", {
        x: MARGIN_X,
        y,
        size: 11,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.35),
      });
      y -= LINE;
      for (const para of fbText.split(/\n+/)) {
        drawText(para, { size: 11 });
      }
    }

    // Question-wise grading
    const qGrades = evalCtx?.questionGrades || [];
    if (qGrades.length > 0) {
      y -= 6;
      need(LINE);
      page.drawText("Question-wise Grading:", {
        x: MARGIN_X,
        y,
        size: 11,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.35),
      });
      y -= LINE;
      qGrades.forEach((qg, idx) => {
        need(LINE * 2);
        drawText(`Q${idx + 1}. ${qg.questionText || ""}`, {
          size: 11,
          bold: true,
        });
        const bits = [];
        if (qg.marks != null) bits.push(`Marks: ${qg.marks}`);
        if (qg.isCorrect != null)
          bits.push(qg.isCorrect ? "Correct" : "Incorrect");
        if (qg.icon) bits.push(`Marker: ${qg.icon}`);
        if (bits.length) drawText(bits.join("   |   "), { size: 10 });
        y -= 4;
      });
    }
    y -= SECTION_GAP;

    // ── ANNOTATIONS SUMMARY ─────────────────────────────────────────────────
    if (annotations && annotations.length) {
      drawSectionHeading("Document Annotations");
      const byType = annotations.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
      }, {});
      const summary = Object.entries(byType)
        .map(([k, v]) => `${k}: ${v}`)
        .join("   |   ");
      drawText(`Total: ${annotations.length}   (${summary})`, { size: 11 });
      y -= SECTION_GAP;
    }

    // ── REVIEW META ─────────────────────────────────────────────────────────
    const reviewMeta = reportContext?.review;
    if (reviewMeta) {
      drawSectionHeading("Review Context");
      drawKeyValue("Status", reviewMeta.status || "—");
      if (reviewMeta.reviewedAt)
        drawKeyValue("Reviewed On", fmtDate(reviewMeta.reviewedAt));
      if (reviewMeta.reviewerName)
        drawKeyValue("Reviewed By", reviewMeta.reviewerName);
    }

    // ── DOCUMENT SNAPSHOTS ──────────────────────────────────────────────────
    if (contentRef?.current) {
      const pageEls = contentRef.current.querySelectorAll(".pdf-page-wrapper");
      const targets =
        pageEls.length > 0
          ? Array.from(pageEls)
          : [contentRef.current.querySelector(".docx-content")].filter(Boolean);

      for (const el of targets) {
        if (!el) continue;
        await new Promise((r) => setTimeout(r, 200));
        const canvas = await html2canvasLib(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          foreignObjectRendering: true,
        });
        const imgData = canvas.toDataURL("image/png");
        const img = await pdfDoc.embedPng(imgData);
        const pageWidth = PAGE_W;
        const pageHeight = (canvas.height * pageWidth) / canvas.width;
        const pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);
        pdfPage.drawImage(img, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    // FIX: Use getDownloadName so we strip the existing .pdf extension before
    // appending "_reviewed.pdf" — otherwise we'd get "assignment.pdf_reviewed.pdf".
    triggerDownload(blob, getDownloadName(fileName, "pdf", "reviewed"));
  } catch (err) {
    console.error("Download reviewed failed:", err);
  }
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DocumentAnnotator({
  fileUrl,
  fileName,
  fileType: fileTypeProp,
  annotations = [],
  onChange,
  onSave,
  readOnly = false,
  onClose,
  feedback = "",
  totalScore = null,
  maxMarks = null,
  // FIX: Rich context for the reviewed-PDF report. Optional; if absent, we
  // fall back to the minimal report we always produced.
  reportContext = null,
}) {
  // FIX #5: If fileUrl is missing, show a clear error rather than crashing
  const fileType = fileTypeProp || detectType(fileName, fileUrl);
  const [scale, setScale] = useState(1.0);
  const [activeType, setActiveType] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadingReviewed, setDownloadingReviewed] = useState(false);

  const contentRef = useRef(null);

  const handleAdd = useCallback(
    (ann) => {
      onChange?.([...annotations, ann]);
      setSaved(false);
    },
    [annotations, onChange],
  );

  const handleDelete = useCallback(
    (id) => {
      onChange?.(annotations.filter((a) => a.id !== id));
      setSaved(false);
    },
    [annotations, onChange],
  );

  const handleClearAll = () => {
    if (window.confirm("Remove all annotations?")) {
      onChange?.([]);
      setSaved(false);
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(annotations);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save annotations. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (fileType === "pdf" && annotations.length > 0) {
      setDownloading(true);
      try {
        await downloadAnnotatedPdf(fileUrl, annotations, fileName);
      } finally {
        setDownloading(false);
      }
    } else {
      // FIX: Plain <a download="..."> is ignored by browsers when the URL is
      // cross-origin (e.g. Cloudinary), so the file would save with the
      // Cloudinary-hashed name instead of the original assignment.pdf.
      // Fetch as a blob and download via an object URL — the download
      // attribute IS honored on blob: URLs because they're same-origin.
      setDownloading(true);
      try {
        const res = await fetch(fileUrl);
        const blob = await res.blob();
        triggerDownload(blob, getDownloadName(fileName, fileType));
      } catch (err) {
        console.error("Download failed, opening in new tab:", err);
        window.open(fileUrl, "_blank");
      } finally {
        setDownloading(false);
      }
    }
  };

  const handleDownloadReviewed = async () => {
    setDownloadingReviewed(true);
    try {
      await downloadReviewedAssignment({
        fileUrl,
        fileName,
        fileType,
        annotations,
        feedback,
        totalScore,
        maxMarks,
        reportContext,
        contentRef,
      });
    } finally {
      setDownloadingReviewed(false);
    }
  };

  const zoomIn = () => setScale((s) => Math.min(+(s + 0.15).toFixed(2), 2.5));
  const zoomOut = () => setScale((s) => Math.max(+(s - 0.15).toFixed(2), 0.4));
  const zoomReset = () => setScale(1.0);

  // Escape cancels active annotation type
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") {
        if (activeType) {
          e.stopPropagation();
          setActiveType(null);
        }
      }
    };
    window.addEventListener("keydown", h, true);
    return () => window.removeEventListener("keydown", h, true);
  }, [activeType]);

  // FIX #6: If no fileUrl provided, show a friendly error state
  if (!fileUrl) {
    return (
      <div
        className="flex flex-col h-full bg-slate-900 overflow-hidden items-center justify-center gap-4"
        style={{ minHeight: 300 }}
      >
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-2" />
          <p className="text-red-300 text-sm text-center">
            No document URL provided.
          </p>
          <p className="text-slate-500 text-xs text-center mt-1">
            The submission file may not have been uploaded.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-slate-400 border border-white/10 hover:bg-white/10 transition"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-slate-900 gap-3 flex-wrap flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-indigo-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate max-w-[220px]">
              {fileName || "Document"}
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              {fileType.toUpperCase()}
              {numPages
                ? ` · ${numPages} page${numPages !== 1 ? "s" : ""}`
                : ""}{" "}
              · {annotations.length} annotation
              {annotations.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-white/[0.05] rounded-xl p-1 flex-shrink-0">
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={zoomReset}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all min-w-[44px] text-center"
            title="Reset zoom"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={zoomIn}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {annotations.length > 0 && !readOnly && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-red-400 border border-red-500/20 bg-red-500/[0.07] hover:bg-red-500/15 transition-all"
            >
              <RotateCcw size={12} /> Clear
            </button>
          )}
          {!readOnly && onSave && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                saved
                  ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                  : "text-sky-400 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20"
              }`}
            >
              {saving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : saved ? (
                <Check size={12} />
              ) : (
                <Save size={12} />
              )}
              {saving ? "Saving…" : saved ? "Saved!" : "Save Annotations"}
            </button>
          )}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-indigo-400 border border-indigo-500/20 bg-indigo-500/[0.07] hover:bg-indigo-500/15 transition-all"
          >
            {downloading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Download size={12} />
            )}
            {annotations.length > 0 && fileType === "pdf"
              ? "Download Annotated"
              : "Download"}
          </button>
          <button
            onClick={handleDownloadReviewed}
            disabled={downloadingReviewed}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-amber-400 border border-amber-500/20 bg-amber-500/[0.07] hover:bg-amber-500/15 transition-all"
            title="Download reviewed file with annotations, feedback and score"
          >
            {downloadingReviewed ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Award size={12} />
            )}
            Download Reviewed
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              title="Close"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── ANNOTATION TOOLBAR ── */}
      {!readOnly && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.05] flex-wrap flex-shrink-0">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mr-1">
            Mark:
          </span>
          {Object.entries(ANNOTATION_TYPES).map(([key, def]) => {
            const isActive = activeType === key;
            const { Icon, color, fill, label } = def;
            return (
              <button
                key={key}
                onClick={() => setActiveType(isActive ? null : key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-150 border ${
                  isActive
                    ? "scale-105"
                    : "border-white/[0.07] text-slate-500 bg-white/[0.03] hover:border-white/20 hover:text-slate-300"
                }`}
                style={
                  isActive
                    ? {
                        color,
                        background: fill,
                        borderColor: color + "66",
                        boxShadow: `0 0 0 3px ${color}22`,
                      }
                    : {}
                }
              >
                <Icon
                  size={14}
                  color={isActive ? color : "#64748b"}
                  strokeWidth={2.2}
                  fill={isActive ? fill : "none"}
                />
                {label}
              </button>
            );
          })}
          {activeType ? (
            <span className="ml-2 text-[11px] text-slate-500 flex items-center gap-1">
              Click on document to place ·
              <kbd className="bg-white/[0.07] border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-slate-400 mx-0.5">
                Esc
              </kbd>
              to cancel
            </span>
          ) : (
            <span className="ml-1 text-[11px] text-slate-600">
              Select a marker type, then click on the document
            </span>
          )}
        </div>
      )}

      {/* ── DOCUMENT SCROLL AREA ── */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto overflow-x-auto"
        style={{
          padding: "32px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          background: "#2d3748",
        }}
      >
        {fileType === "pdf" ? (
          <PdfViewer
            fileUrl={fileUrl}
            annotations={annotations}
            onAdd={handleAdd}
            onDelete={handleDelete}
            activeType={activeType}
            readOnly={readOnly}
            scale={scale}
            onPagesLoaded={setNumPages}
          />
        ) : (
          <DocxViewer
            fileUrl={fileUrl}
            annotations={annotations}
            onAdd={handleAdd}
            onDelete={handleDelete}
            activeType={activeType}
            readOnly={readOnly}
            scale={scale}
            onPagesLoaded={setNumPages}
          />
        )}
        <div className="h-16" />
      </div>

      {/* ── STATUS BAR ── */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-white/[0.05] bg-slate-900 flex-wrap flex-shrink-0">
        {Object.entries(ANNOTATION_TYPES).map(([key, def]) => {
          const count = annotations.filter((a) => a.type === key).length;
          if (!count) return null;
          const { Icon, color, label } = def;
          return (
            <span
              key={key}
              className="flex items-center gap-1 text-[11px] text-slate-500"
            >
              <Icon size={11} color={color} strokeWidth={2.2} />
              <span>
                {count} {label}
              </span>
            </span>
          );
        })}
        {annotations.length === 0 && (
          <span className="text-[11px] text-slate-600">
            {readOnly
              ? "No annotations on this document"
              : "No annotations yet"}
          </span>
        )}
        {!readOnly && annotations.length > 0 && !saved && !saving && (
          <span className="ml-auto text-[11px] text-amber-500/80 flex items-center gap-1">
            <AlertTriangle size={10} /> Unsaved changes — click "Save
            Annotations"
          </span>
        )}
      </div>

      <style>{`
        .react-pdf__Page { display: block !important; line-height: 0; }
        .react-pdf__Page canvas { display: block !important; }
        .docx-content h1,.docx-content h2,.docx-content h3 { font-weight:700; margin:1.2em 0 0.4em; color:#0f172a; }
        .docx-content h1 { font-size:1.6em; } .docx-content h2 { font-size:1.3em; } .docx-content h3 { font-size:1.1em; }
        .docx-content p { margin:0.5em 0; }
        .docx-content table { border-collapse:collapse; width:100%; margin:1em 0; }
        .docx-content td,.docx-content th { border:1px solid #e2e8f0; padding:8px 12px; font-size:13px; }
        .docx-content th { background:#f8fafc; font-weight:600; }
        .docx-content img { max-width:100%; height:auto; border-radius:4px; }
        .docx-content ul,.docx-content ol { padding-left:1.5em; margin:0.5em 0; }
        .docx-content strong { font-weight:700; }
        .pdf-page-wrapper { position: relative; }
      `}</style>
    </div>
  );
}
