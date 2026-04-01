import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function HeroCarousel() {
    const navigate=useNavigate();

  const slides = [
    {
      type: "image",
      src: "/slides/safety-training.jpg",
      title: "Global Safety Certifications",
      subtitle: "Learn internationally recognized occupational safety programs"
    },
    {
      type: "image",
      src: "/slides/HSE_slideShow.jpg",
      title: "Practical Industrial Training",
      subtitle: "Real world HSE training programs for professionals"
    },
    {
      type: "image",
      src: "/slides/osha_iosh_slideshow.webp",
      title: "IOSH & OSHA Certifications",
      subtitle: "Advance your career with globally recognized safety courses"
    }
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  return (

    <section className="relative w-full h-[90vh] overflow-hidden">

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

          {slides[current].type === "image" ? (

            <img
              src={slides[current].src}
              className="w-full h-full object-cover"
              alt=""
            />

          ) : (

            <video
              src={slides[current].src}
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
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
            {slides[current].title}
          </h1>

          <p className="text-lg md:text-xl text-slate-200">
            {slides[current].subtitle}
          </p>

          <button 
          onClick={()=>{navigate("/courses")}}
          className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white font-semibold transition">
            Explore Courses
          </button>

        </div>

      </div>


      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/40"
      >
        ‹
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/40"
      >
        ›
      </button>


      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">

        {slides.map((_, i) => (

          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full ${
              current === i ? "bg-white" : "bg-white/40"
            }`}
          />

        ))}

      </div>

    </section>
  );
}