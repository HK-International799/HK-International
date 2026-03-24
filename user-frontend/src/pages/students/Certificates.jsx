// import { certificates } from "../../mock/studentData";

// export default function Certificates() {
//   return (
//     <div className="p-8 bg-gray-50 min-h-screen">

//       <h1 className="text-3xl font-bold mb-6">Certificates</h1>

//       <div className="grid md:grid-cols-3 gap-6">

//         {certificates.map((cert) => (
//           <div key={cert.id} className="bg-white p-6 rounded-xl shadow">

//             <h3 className="font-semibold text-lg">
//               {cert.course}
//             </h3>

//             <p className="text-gray-500 mb-4">
//               Issued: {cert.date}
//             </p>

//             <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
//               Download
//             </button>

//           </div>
//         ))}

//       </div>

//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Download,
  Calendar,
  BookOpen,
  ExternalLink,
  Loader2,
  Trophy,
  GraduationCap,
} from "lucide-react";
import { getCertificates } from "../../services/studentService";
import MainLayout from "../../components/layout/MainLayout";

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCertificates();
        setCertificates(data);
      } catch (err) {
        setError(err.message || "Failed to load certificates");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
              <Award className="w-6 h-6 text-white" />
            </div>
            My Certificates
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {certificates.length} certificate{certificates.length !== 1 ? "s" : ""} earned
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : certificates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert, i) => (
              <motion.div
                key={cert._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-100 transition-all"
              >
                {/* Top Gradient Band */}
                <div className="h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-indigo-600" />

                {/* Content */}
                <div className="p-6">
                  {/* Certificate Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    <Trophy className="w-8 h-8 text-orange-500" />
                  </div>

                  {/* Course Title */}
                  <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2 line-clamp-2">
                    {cert.courseId?.title || "Course Certificate"}
                  </h3>

                  {/* Certificate Number */}
                  <p className="text-xs text-gray-400 font-mono mb-4">
                    #{cert.certificateNumber}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(cert.issuedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {cert.pdfUrl ? (
                      <a
                        href={cert.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium text-sm hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    ) : (
                      <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm font-medium cursor-default">
                        <Award className="w-4 h-4" />
                        Certificate Earned
                      </div>
                    )}
                  </div>
                </div>

                {/* Decorative corner */}
                <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <GraduationCap className="w-24 h-24 text-orange-500" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center mb-6 border border-orange-100">
              <Award className="w-12 h-12 text-orange-300" />
            </div>
            <h3 className="font-bold text-gray-700 text-xl mb-2">
              No certificates yet
            </h3>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              Complete all lessons in a course to earn your certificate.
              Your achievements will appear here once earned.
            </p>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
