// src/components/blog/TableOfContents.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, ChevronDown, ChevronUp } from "lucide-react";

export default function TableOfContents({ sections }) {
  const [activeId, setActiveId] = useState(sections[0]?.id || "");
  const [isOpen, setIsOpen] = useState(false); // mobile collapsed by default
  const observerRef = useRef(null);

  // ── IntersectionObserver for active section highlight ──────
  useEffect(() => {
    if (!sections.length) return;

    const headingEls = sections
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);

    if (!headingEls.length) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    headingEls.forEach((el) => observerRef.current.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sections]);

  function handleClick(e, id) {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;

    const offset = 88; // account for sticky navbar
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: "smooth" });
    setActiveId(id);

    // Collapse on mobile after click
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }

  if (!sections.length) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Header / toggle */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 text-left lg:cursor-default"
        aria-expanded={isOpen}
        aria-controls="toc-list"
      >
        <div className="flex items-center gap-2">
          <List size={16} className="text-[#1e3a5f]" aria-hidden="true" />
          <span className="font-bold text-[#1e3a5f] text-sm">
            Contents
          </span>
        </div>
        {/* Only show chevron on mobile */}
        <span className="lg:hidden text-gray-600">
          {isOpen ? (
            <ChevronUp size={16} aria-hidden="true" />
          ) : (
            <ChevronDown size={16} aria-hidden="true" />
          )}
        </span>
      </button>

      {/* List — always visible on lg, collapsible on mobile */}
      <AnimatePresence initial={false}>
        {(isOpen || typeof window !== "undefined" ? isOpen || window.innerWidth >= 1024 : false) && (
          <motion.div
            id="toc-list"
            key="toc-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ol
              className="px-4 pb-4 space-y-1"
              role="list"
            >
              {sections.map((section, idx) => {
                const isActive = activeId === section.id;
                return (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={(e) => handleClick(e, section.id)}
                      className={`flex items-start gap-2.5 py-1.5 px-2.5 rounded-lg text-sm transition-all duration-150 ${
                        isActive
                          ? "bg-[#1e3a5f]/8 text-[#1e3a5f] font-semibold"
                          : "text-gray-500 hover:text-[#1e3a5f] hover:bg-gray-50"
                      }`}
                      aria-current={isActive ? "location" : undefined}
                    >
                      <span
                        className={`flex-shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold mt-0.5 ${
                          isActive
                            ? "bg-[#1e3a5f] text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                        aria-hidden="true"
                      >
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{section.heading}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-visible desktop version (SSR-safe fallback) */}
      <div className="hidden lg:block">
        <ol className="px-4 pb-4 space-y-1" role="list">
          {sections.map((section, idx) => {
            const isActive = activeId === section.id;
            return (
              <li key={`desktop-${section.id}`}>
                <a
                  href={`#${section.id}`}
                  onClick={(e) => handleClick(e, section.id)}
                  className={`flex items-start gap-2.5 py-1.5 px-2.5 rounded-lg text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-[#1e3a5f]/10 text-[#1e3a5f] font-semibold"
                      : "text-gray-500 hover:text-[#1e3a5f] hover:bg-gray-50"
                  }`}
                  aria-current={isActive ? "location" : undefined}
                >
                  <span
                    className={`flex-shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold mt-0.5 ${
                      isActive
                        ? "bg-[#1e3a5f] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                    aria-hidden="true"
                  >
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{section.heading}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
