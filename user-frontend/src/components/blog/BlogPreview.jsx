// src/components/blog/BlogPreview.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { getFeaturedPosts } from "../../data/blogData";
import BlogCard from "./BlogCard";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export default function BlogPreview() {
  const posts = getFeaturedPosts(3);

  if (!posts.length) return null;

  return (
    <section
      className="py-16 md:py-24 bg-gray-50"
      aria-labelledby="blog-preview-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={18} className="text-orange-500" aria-hidden="true" />
              <span className="text-sm font-semibold text-orange-500 uppercase tracking-wider">
                From Our Experts
              </span>
            </div>
            <h2
              id="blog-preview-heading"
              className="text-3xl md:text-4xl font-bold text-[#1e3a5f]"
            >
              Latest Insights
            </h2>
            <p className="mt-2 text-gray-500 max-w-xl">
              Expert guidance on health &amp; safety qualifications, career
              development, and workplace compliance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-[#1e3a5f] text-[#1e3a5f] font-semibold text-sm hover:bg-[#1e3a5f] hover:text-white transition-all duration-200 whitespace-nowrap"
            >
              View All Posts
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </motion.div>
        </div>

        {/* Posts grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#1e3a5f] text-white font-semibold text-sm hover:bg-orange-500 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            View All Posts
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
