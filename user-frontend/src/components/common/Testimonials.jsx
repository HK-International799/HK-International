import { useState } from "react";
import { Star, Quote, BadgeCheck, GraduationCap, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Testimonials() {
  const [isPaused, setIsPaused] = useState(false);

  const testimonials = [
    {
      id: 1,
      name: "Santi Somroop",
      position: "OSHA 30-Hour Construction Safety and Health Course",
      company: "",
      rating: 5,
      feedback:
        "The training was very informative, well-structured, and easy to understand. The trainer explained every topic with practical examples. I gained valuable knowledge that I can apply in real-life work situations. I highly recommend this institute to anyone who wants to build a strong career in the safety field.",
    },

    {
      id: 2,
      name: "Aman Yadav",
      position: "OSHA 30-Hour Construction Industry",
      company: "",
      rating: 5,
      feedback:
        "World best institute of iosh osha. The training was well-structured, informative, and easy to understand. The trainers are highly experienced and supportive. I gained valuable knowledge that will help me ensure safety and health in the workplace. Highly recommended!",
    },

    {
      id: 3,
      name: "Fardin Fardin",
      position: "Risk Assessment, IOSH & OSHA Learner",
      company: "",
      rating: 5,
      feedback:
        "I had a great learning experience with 1A HK International while attending the Risk Assessment, IOSH, and OSHA training programs. A special thanks to Mr. Ashish Ved Sir for his outstanding guidance and practical approach to teaching. His ability to explain complex safety concepts through real-world examples made the sessions highly engaging and easy to understand. The interactive sessions, practical case studies, and expert support significantly enhanced my knowledge and confidence in Occupational Health and Safety.",
    },

    {
      id: 4,
      name: "Santosh Kumar Paswan",
      position: "IOSH & OSHA Learner",
      company: "",
      rating: 5,
      feedback:
        "Great experience with 1A HK International! Sumitra Mem was my coach, and her support and expertise were excellent. Fully satisfied with the training and services.",
    },

    // {
    //   id: 5,
    //   name: "Nitanya Mohapatra",
    //   position: "",
    //   company: "",
    //   rating: 5,
    //   feedback: "Great IOSH & OSHA Training...",
    // },

    {
      id: 6,
      name: "Pankaj Pandey",
      position: "",
      company: "",
      rating: 5,
      feedback:
        "Thank you very much 1A HK International and all trainer. Your class was a great one. I personally learned a lot from the...",
    },

    {
      id: 7,
      name: "Sangram Jena",
      position: "",
      company: "",
      rating: 5,
      feedback:
        "Excellent training session. The content was clear, informative, and easy to understand. Thank you for the valuable learning experience.",
    },

    {
      id: 8,
      name: "AKASH BHATIA",
      position: "",
      company: "",
      rating: 5,
      feedback:
        "Had a really good learning experience with this institute. The trainers are knowledgeable, supportive, and explain...",
    },

    {
      id: 9,
      name: "Sumitra Rani Dash",
      position: "",
      company: "",
      rating: 5,
      feedback:
        "Mr. Ashish Ved Sir is highly knowledgeable and always encourages interaction, ensuring that all participants understand the subject thoroughly. His guidance and support throughout the course were truly commendable.",
    },

    {
      id: 10,
      name: "Shreejith Das",
      position: "",
      company: "",
      rating: 5,
      feedback:
        "Excellent training institute with highly experienced tutors and practical learning methods. The sessions were...",
    },

    {
      id: 11,
      name: "NARTU HARA PRASAD PATRA",
      position: "",
      company: "",
      rating: 5,
      feedback:
        "Great institution with professional approach and excellent support for students. Highly recommended.",
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
                <div className="flex justify-between items-start mb-4">
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
