import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function DocumentModal({ url, name, onClose }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const renderTaskRef = useRef(null);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------------- Load PDF ---------------- */
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);

        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });

          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }

        const pdf = await window.pdfjsLib.getDocument(url).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
      } catch (err) {
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [url]);

  /* ---------------- Render Page (SMART FIT) ---------------- */
  const renderPage = useCallback(
    async (pageNum) => {
      if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }

      const page = await pdfDoc.getPage(pageNum);
      const container = containerRef.current;

      const viewport = page.getViewport({ scale: 1.3 });

      // 🔥 Smart Fit (Best UX)
      const scaleX = container.clientWidth / viewport.width;
      const scaleY = container.clientHeight / viewport.height;

      const baseScale = Math.min(scaleX, scaleY);
      const finalScale = baseScale * scale;

      const scaledViewport = page.getViewport({ scale: finalScale });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;

      const renderTask = page.render({
        canvasContext: ctx,
        viewport: scaledViewport,
      });

      renderTaskRef.current = renderTask;

      try {
        await renderTask.promise;
      } catch {}
    },
    [pdfDoc, scale],
  );

  useEffect(() => {
    if (pdfDoc) renderPage(currentPage);
  }, [pdfDoc, currentPage, scale]);

  /* ---------------- Controls ---------------- */
  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.6));

  const blockContext = (e) => e.preventDefault();

  /* ---------------- Scroll Zoom ---------------- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY < 0) zoomIn();
        else zoomOut();
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  /* ---------------- Keyboard ---------------- */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [totalPages]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="w-screen h-full bg-[#0f172a] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-3 bg-[#020617] border-b border-gray-800">
            <div className="flex items-center gap-3 text-white">
              <FileText className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold truncate">
                {name || "Document"}
              </span>
              <span className="text-xs text-gray-400">
                {currentPage} / {totalPages}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                className="p-2 hover:bg-gray-800 rounded"
              >
                <ZoomOut className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={zoomIn}
                className="p-2 hover:bg-gray-800 rounded"
              >
                <ZoomIn className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-600 rounded"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* BODY */}
          <div
            ref={containerRef}
            className="flex-1 flex items-center justify-center relative bg-black overflow-auto scrollbar-hide"
          >
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            ) : error ? (
              <div className="text-red-400 flex flex-col items-center">
                <AlertCircle className="w-8 h-8" />
                {error}
              </div>
            ) : (
              <motion.canvas
                key={currentPage}
                ref={canvasRef}
                onContextMenu={blockContext}
                className="rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.6)] mx-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              />
            )}
            {/* NAV BUTTONS */}
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="absolute left-2 bg-black/50 hover:bg-black p-4 rounded-full backdrop-blur-md border-white border"
            >
              <ChevronLeft className="text-white" />
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="absolute right-2 bg-black/50 hover:bg-black p-4 rounded-full backdrop-blur-md border-white border"
            >
              <ChevronRight className="text-white" />
            </button>
            {/* PAGE INDICATOR (PAGINATION STYLE) */}
            <div className="fixed bottom-4 flex items-center gap-1 bg-black/60 px-4 py-2 rounded-full backdrop-blur-md h-6 ">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="text-white text-center text-sm px-2 disabled:opacity-40"
              >
                ‹
              </button>

              {(() => {
                const pages = [];

                // Always show first page
                if (currentPage > 3) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => setCurrentPage(1)}
                      className="w-6 h-6 text-xs text-gray-300"
                    >
                      1
                    </button>,
                  );

                  // Ellipsis before current range
                  if (currentPage > 4) {
                    pages.push(
                      <span
                        key="start-ellipsis"
                        className="text-gray-400 text-xs"
                      >
                        ...
                      </span>,
                    );
                  }
                }

                // Middle pages (current range)
                for (
                  let i = Math.max(1, currentPage - 2);
                  i <= Math.min(totalPages, currentPage + 2);
                  i++
                ) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                        currentPage === i
                          ? "bg-orange-500 text-white"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      }`}
                    >
                      {i}
                    </button>,
                  );
                }

                // Ellipsis after current range
                if (currentPage < totalPages - 2) {
                  if (currentPage < totalPages - 3) {
                    pages.push(
                      <span
                        key="end-ellipsis"
                        className="text-gray-400 text-xs"
                      >
                        ...
                      </span>,
                    );
                  }

                  // Always show last page
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-6 h-6 text-xs text-gray-300"
                    >
                      {totalPages}
                    </button>,
                  );
                }

                return pages;
              })()}

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="text-white text-sm px-2 disabled:opacity-40"
              >
                ›
              </button>
            </div>
            ;
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
