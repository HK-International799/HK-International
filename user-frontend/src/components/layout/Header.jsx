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
      className="relative bg-gradient-to-r from-orange-50 via-white to-indigo-100 border-b border-gray-200 pt-[50px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl  mx-auto px-6 py-8">

        {/* Title */}
        <div className="text-center mb-4">
          <h2 className="text-sm md:text-xl font-semibold text-gray-800 tracking-wide">
            Trusted & Accredited By
          </h2>

          <p className="text-xs  text-gray-500 mt-1">
            Leading Global Certification Bodies
          </p>

          {/* <div className="w-20 h-1 bg-orange-500 mx-auto mt-3 rounded-full"></div> */}
        </div>

        {/* Logo Slider */}
        <div className="relative w-full overflow-hidden">

          {/* LEFT FADE */}
          <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>

          {/* RIGHT FADE */}
          <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

          {/* Logos */}
          <div
            className="flex gap-12 animate-marquee"
            style={{
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center min-w-[160px]"
              >
                <div
                  className="
                    bg-white/70 backdrop-blur-md
                    p-1 rounded-2xl
                    shadow-md
                    hover:shadow-xl
                    transition-all duration-300
                    hover:scale-110
                    border border-gray-100
                  "
                >
                  <img
                    src={logo}
                    alt="Certification Logo"
                    className="
                      h-20 md:h-24
                      object-contain
                      transition-all duration-300
                    "
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}