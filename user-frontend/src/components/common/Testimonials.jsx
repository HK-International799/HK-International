import { useState } from "react";
import { Star, Quote, BadgeCheck, GraduationCap, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Testimonials() {
  const [isPaused, setIsPaused] = useState(false);

  const testimonials = [
    {
      id: 1,
      name: "Mohammed Arif",
      position: "Senior HSE Officer",
      company: "Saudi Arabia",
      rating: 5,
      feedback:
        "The training methodology was highly practical and aligned with international safety standards. After completing the course, I secured a better opportunity in Saudi Arabia.",
    },
    {
      id: 1,
      name: "Mohammed Arif",
      position: "Senior HSE Officer",
      company: "Saudi Arabia",
      rating: 5,
      feedback:
        "The training methodology was highly practical and aligned with international safety standards. After completing the course, I secured a better opportunity in Saudi Arabia.",
    },
    
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6 text-center mb-16"
      >
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
          <BadgeCheck size={16} />
          Learner Success Stories
        </span>

        <h2 className="mt-5 text-4xl lg:text-5xl font-extrabold text-slate-900">
          Trusted By Safety Professionals Worldwide
        </h2>

        <p className="mt-4 text-slate-600 max-w-3xl mx-auto text-lg">
          Professionals from construction, oil & gas, manufacturing, engineering
          and infrastructure sectors trust 1A HK International to advance their
          careers.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { value: "4.9/5", label: "Average Rating" },
            { value: "2100+", label: "Learners Trained" },
            { value: "195+", label: "Nationalities" },
            { value: "92%", label: "Career Growth Rate" },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm hover:shadow-lg transition"
            >
              <h3 className="text-3xl font-extrabold text-indigo-600">
                {item.value}
              </h3>

              <p className="text-slate-500 mt-2">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee */}
      <div className="relative overflow-hidden">
        <div
          className="animate-marquee flex gap-8 "
          style={{
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {[...testimonials, ...testimonials].map((item, index) => (
            <motion.div
              key={index}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
              className="
                w-[460px]
                shrink-0
                min-h-[340px]
                rounded-3xl
                backdrop-blur-lg
                p-8
                shadow-lg
                hover:shadow-2xl
                transition-all
                duration-75
                flex
                flex-col
                justify-between
                bg-linear-to-bl
                from-indigo-200
                to-orange-200
                via-white
                hover:from-orange-300
                hover:to-indigo-200
              "
            >
              {/* Top */}
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                      {item.name.charAt(0)}
                    </div>

                    <div>
                      <h3 className="font-bold text-lg text-slate-900">
                        {item.name}
                      </h3>

                      <p className="text-sm text-slate-500">{item.position}</p>

                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin size={12} />
                        {item.company}
                      </div>
                    </div>
                  </div>

                  <Quote size={42} className="text-indigo-100" />
                </div>

                <div className="flex gap-1 mb-5">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={18} fill="#f97316" color="#f97316" />
                  ))}
                </div>

                <p className="text-slate-600 leading-relaxed">
                  "{item.feedback}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Professional Edge Fade */}
        <div className="absolute left-0 top-0 h-full w-40 bg-gradient-to-r from-white via-white/20 to-transparent pointer-events-none z-10" />

        <div className="absolute right-0 top-0 h-full w-40 bg-gradient-to-l from-white via-white/20 to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
}
