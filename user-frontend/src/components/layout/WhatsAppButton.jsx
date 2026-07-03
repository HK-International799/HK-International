import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppButton() {
  return (
    <div className="fixed bottom-10 right-8 z-50 group">

      {/* Glow Ring */}
      <span className="absolute inset-0 rounded-full bg-green-500 opacity-30 blur-xl animate-pulse"></span>

      {/* Ripple Animation */}
      <span className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-60"></span>

      {/* Button */}
      <a
        href="https://whatsapp.com/channel/0029VbCdy5D8kyyNaJ53EW47"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join our WhatsApp channel"
        className="
        relative
        flex
        items-center
        justify-center
        w-16
        h-16
        bg-gradient-to-br
        from-green-500
        to-green-600
        text-white
        rounded-full
        shadow-xl
        transition-all
        duration-300
        hover:scale-110
        hover:rotate-6
        hover:shadow-2xl
        "
      >
        <FaWhatsapp
          size={28}
          className="transition-transform duration-300 group-hover:scale-125"
        />
      </a>

      {/* Tooltip */}
      <span
        className="
        absolute
        right-16
        top-1/2
        -translate-y-1/2
        whitespace-nowrap
        bg-black
        text-white
        text-xs
        px-3
        py-1
        rounded-md
        opacity-0
        group-hover:opacity-100
        translate-x-3
        group-hover:translate-x-0
        transition-all
        duration-300
        "
      >
        Join Channel
      </span>
    </div>
  );
}