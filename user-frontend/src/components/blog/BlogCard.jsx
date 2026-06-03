// src/components/blog/BlogCard.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import { formatDate } from "../../data/blogData";

const CATEGORY_COLORS = {
  IOSH: "bg-blue-100 text-blue-800",
  OTHM: "bg-purple-100 text-purple-800",
  "OSHA": "bg-green-100 text-green-800",
  "ISO/PECB": "bg-teal-100 text-teal-800",
  "Career Advice": "bg-orange-100 text-orange-800",
};

export default function BlogCard({ post }) {
  const badgeClass =
    CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-700";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden transition-shadow duration-300 flex flex-col h-full"
    >
      {/* Cover Image */}
      <Link
        to={`/blog/${post.slug}`}
        aria-label={`Read: ${post.title}`}
        className="block overflow-hidden relative"
        style={{ paddingTop: "56.25%" }} /* 16:9 ratio */
      >
        <img
          src={post.coverImage}
          alt={post.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/images/blog/placeholder.jpg";
          }}
        />
        {/* Category badge overlay */}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full ${badgeClass}`}
        >
          {post.category}
        </span>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Title */}
        <Link to={`/blog/${post.slug}`} className="block group">
          <h3 className="text-gray-900 font-bold text-lg leading-snug mb-2 line-clamp-2 group-hover:text-[#1e3a5f] transition-colors duration-200">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
          {post.excerpt}
        </p>

        {/* Meta row */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={13} aria-hidden="true" />
              <time dateTime={post.publishedDate}>
                {formatDate(post.publishedDate)}
              </time>
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} aria-hidden="true" />
              {post.readTime}
            </span>
          </div>

          <Link
            to={`/blog/${post.slug}`}
            className="flex items-center gap-1 text-xs font-semibold text-[#1e3a5f] hover:text-orange-500 transition-colors duration-200"
            aria-label={`Read more about ${post.title}`}
          >
            Read
            <ArrowRight
              size={13}
              className="transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
