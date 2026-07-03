import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Order matters: slide 0 renders on first paint and IS the LCP element on
// most visits, so it must be the lightest asset (a small webp), never the
// video. The video plays later in the rotation once the page is already
// interactive, so its size no longer affects LCP.
const slides = [
  {
    type: "image",
    src: "/slides/osha_iosh_slideshow.webp",
    width: 603,
    height: 309,
    title: "IOSH & OSHA Certifications",
    subtitle: "Advance your career with globally recognized safety courses",
    alt: "IOSH and OSHA certified health and safety training courses",
  },
  {
    type: "image",
    src: "/slides/global-training.webp",
    width: 824,
    height: 476,
    title: "Global Safety Certifications",
    subtitle: "Learn internationally recognized occupational safety programs",
    alt: "Learners in a global occupational safety training programme",
  },
  {
    type: "video",
    src: "/slides/heroVideo-compressed.mp4",
    poster: "/slides/heroVideo-poster.jpg",
    title: "Industrial Construction Excellence",
    subtitle:
      "Real-world project environments demonstrating international standards in health, safety, and environmental management",
    alt: "Industrial construction site demonstrating health and safety standards",
  },
  {
    type: "image",
    src: "/slides/practical-industry-training.webp",
    width: 800,
    height: 270,
    title: "Practical Industrial Training",
    subtitle: "Real world HSE training programs for professionals",
    alt: "Practical industrial health and safety training in progress",
  },
];

export default function HeroCarousel() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const timerRef = useRef(null);

  useEffect(() => {
    // WCAG 2.2.2 (Pause, Stop, Hide): don't force an indefinitely
    // auto-updating carousel on users who asked for reduced motion, and
    // always honour hover/focus pause below.
    if (prefersReducedMotion || paused) return;

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
      // 6s (was 2s): 2s left almost no time for the next slide's asset to
      // fetch, and rotating that fast fails WCAG's "enough time" guidance.
    }, 5000);

    return () => clearInterval(timerRef.current);
  }, [paused, prefersReducedMotion]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const slide = slides[current];

  return (
    <section
      className="relative w-full h-[90vh] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured training highlights"
    >
      {/* Slides */}
      <AnimatePresence>
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {slide.type === "image" ? (
            <img
              src={slide.src}
              width={slide.width}
              height={slide.height}
              className="w-full h-full object-cover"
              alt={slide.alt}
              // Only slide 0 is ever the LCP candidate (it's what paints
              // first on load); every other slide should stay lazy/low
              // priority since it's not visible yet.
              loading={current === 0 ? "eager" : "lazy"}
              fetchPriority={current === 0 ? "high" : "auto"}
              decoding="async"
            />
          ) : (
            <video
              src={slide.src}
              poster={slide.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              className="w-full h-full object-cover"
              aria-label={slide.alt}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center text-center text-white px-6">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {slide.title}
          </h1>

          <p className="text-lg md:text-xl text-slate-200">
            {slide.subtitle}
          </p>

          <button
            onClick={() => navigate("/courses")}
            className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white font-semibold transition"
          >
            Explore Courses
          </button>
        </div>
      </div>

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/40"
      >
        <span aria-hidden="true">‹</span>
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/40"
      >
        <span aria-hidden="true">›</span>
      </button>

      {/* Dots */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3"
        role="tablist"
        aria-label="Slide selector"
      >
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            role="tab"
            aria-selected={current === i}
            aria-label={`Show slide ${i + 1}: ${s.title}`}
            className={`w-3 h-3 rounded-full ${
              current === i ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
