// src/components/blog/ShareButtons.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Check } from "lucide-react";
import { FaLinkedinIn, FaWhatsapp, FaXTwitter } from "react-icons/fa6";

export default function ShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: FaLinkedinIn,
      bg: "bg-[#0A66C2] hover:bg-[#0958a8]",
    },
    {
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: FaWhatsapp,
      bg: "bg-[#25D366] hover:bg-[#1dba59]",
    },
    {
      label: "Share on X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: FaXTwitter,
      bg: "bg-gray-900 hover:bg-gray-700",
    },
  ];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="flex items-center gap-2 flex-wrap"
      role="group"
      aria-label="Share this article"
    >
      <span className="text-sm font-semibold text-gray-500 mr-1">Share:</span>

      {shareLinks.map(({ label, href, icon: Icon, bg }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-transform duration-200 hover:scale-110 ${bg}`}
        >
          <Icon size={14} aria-hidden="true" />
        </a>
      ))}

      {/* Copy Link button */}
      <div className="relative">
        <motion.button
          onClick={handleCopy}
          aria-label={copied ? "Link copied!" : "Copy link"}
          whileTap={{ scale: 0.9 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            copied
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {copied ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <Link2 size={14} aria-hidden="true" />
          )}
        </motion.button>

        {/* Toast */}
        <AnimatePresence>
          {copied && (
            <motion.span
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-2.5 py-1 rounded-lg whitespace-nowrap pointer-events-none z-10"
              role="status"
              aria-live="polite"
            >
              Copied!
              <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
