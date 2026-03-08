import { useState } from "react";

export default function Header() {
  const [isPaused, setIsPaused] = useState(false);

  const logos = [
    "/logos/1-iosh.jpg",
    "/logos/2-iosh_ATP.png",
    "/logos/3-othm.png",
    "/logos/4-cieh.png",
    "/logos/5-pecb.png",
    "/logos/6-esc.png",
    "/logos/7-proqual.png",
    "/logos/8-eosh.png",
    "/logos/9-ibsp.png",
  ];

  return (
    <section
      className="bg-linear-to-r from-orange-50 to-indigo-200 border-b border-gray-200 pt-[55px] overflow-hidden "
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Title */}
        <p className="text-center text-sm md:text-base text-gray-600 font-semibold mb-6 tracking-wide">
          Accredited By Leading Global Certification Bodies
        </p>

        {/* Logo Slider */}
        <div className="relative w-full overflow-hidden">

          {/* LEFT FADE */}
          <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>

          {/* RIGHT FADE */}
          <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>

          {/* Scrolling Logos */}
          <div
            className="flex gap-12 animate-marquee"
            style={{
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center min-w-[140px] "
              >
                <img
                  src={logo}
                  alt="Certification Logo"
                  className="
                    h-16 md:h-20 object-contain
                    grayscale opacity-80
                    transition-all duration-300 ease-in-out
                    hover:grayscale-0 hover:opacity-100 hover:scale-110
                    rounded-2xl
                  "
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}