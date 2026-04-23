import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileWarning,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
} from "lucide-react";

// ✅ Worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PDFViewer({ url }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const renderTaskRef = useRef(null);
  const baseScaleRef = useRef(null); // ✅ important fix

  const [pdfDoc, setPdfDoc] = useState(null);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* ---------------- LOAD PDF ---------------- */
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setErr("");
        baseScaleRef.current = null; // ✅ reset on new file

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch PDF");

        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setPage(1);
      } catch (e) {
        console.error(e);
        setErr("Failed to load PDF");
      } finally {
        setLoading(false);
      }
    };

    if (url) loadPdf();
  }, [url]);

  /* ---------------- RENDER PAGE ---------------- */
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {}
    }

    const pageData = await pdfDoc.getPage(page);
    const viewport = pageData.getViewport({ scale: 1 });

    // ✅ Set base scale only once
    if (!baseScaleRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      baseScaleRef.current = containerWidth / viewport.width;
    }

    const finalScale = baseScaleRef.current * scale;

    const scaledViewport = pageData.getViewport({ scale: finalScale });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;

    const renderTask = pageData.render({
      canvasContext: ctx,
      viewport: scaledViewport,
    });

    renderTaskRef.current = renderTask;

    try {
      await renderTask.promise;
    } catch {}
  }, [pdfDoc, page, scale]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  /* ---------------- CONTROLS ---------------- */
  const nextPage = () => setPage((p) => Math.min(p + 1, numPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.6));

  /* ---------------- NO URL ---------------- */
  if (!url) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
        <FileWarning size={24} className="text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400">No scenario PDF attached.</p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white overflow-hidden shadow-sm ${
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none"
          : "border border-gray-200 rounded-xl"
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
        {/* LEFT */}
        <div className="flex items-center gap-1">
          <button
            onClick={prevPage}
            disabled={page <= 1}
            className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30"
          >
            <ChevronLeft size={15} />
          </button>

          <span className="text-xs text-gray-600 px-2 min-w-[80px] text-center">
            {numPages ? `${page} / ${numPages}` : "Loading…"}
          </span>

          <button
            onClick={nextPage}
            disabled={page >= numPages}
            className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-lg hover:bg-gray-200"
          >
            <ZoomOut size={14} />
          </button>

          <button
            onClick={zoomIn}
            className="p-1.5 rounded-lg hover:bg-gray-200"
          >
            <ZoomIn size={14} />
          </button>

          <button
            onClick={() => setIsFullscreen((f) => !f)}
            className="p-1.5 rounded-lg hover:bg-gray-200"
          >
            {isFullscreen ? (
              <Minimize size={14} />
            ) : (
              <Maximize size={14} />
            )}
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div
        ref={containerRef}
        className={`overflow-auto flex justify-center bg-gray-100 p-3 ${
          isFullscreen ? "h-[calc(100vh-50px)]" : "max-h-[70vh]"
        }`}
      >
        {loading ? (
          <div className="p-10 flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="animate-spin" size={16} /> Loading PDF…
          </div>
        ) : err ? (
          <div className="p-8 text-sm text-red-600 flex flex-col items-center gap-2">
            <FileWarning size={24} />
            <p>{err}</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="shadow-md rounded bg-white"
          />
        )}
      </div>
    </div>
  );
}