import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award, Download, ArrowLeft, Loader2, CheckCircle2,
  Calendar, User, BookOpen, Shield,
} from "lucide-react";
import { getOrientationCertificate } from "../../services/orientationService";
import jsPDF from "jspdf";

const MOCK_CERT = {
  studentName: "John Smith",
  course: "IOSH Managing Safely — Orientation",
  sessionTitle: "IOSH Level 3 — Induction Orientation",
  score: 85,
  issuedAt: new Date().toISOString(),
  certificateNumber: "HKINT-ORI-2026-0042",
  instituteName: "1A HK International",
  approvedBy: "Dr. Ashish M. Ved",
  designation: "Lead Trainer & OSH Consultant",
};

export default function OrientationCertificate() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const certRef = useRef(null);

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOrientationCertificate(sessionId);
        setCert(data);
        setEligible(true);
      } catch {
        setCert(MOCK_CERT);
        setEligible(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  const handleDownload = async () => {
    if (!cert) return;
    setDownloading(true);

    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      // Background
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, 297, 210, "F");

      // Border
      doc.setDrawColor(79, 70, 229);
      doc.setLineWidth(3);
      doc.rect(10, 10, 277, 190, "S");
      doc.setLineWidth(1);
      doc.setDrawColor(167, 139, 250);
      doc.rect(14, 14, 269, 182, "S");

      // Header
      doc.setFontSize(28);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      doc.text("CERTIFICATE OF COMPLETION", 148.5, 45, { align: "center" });

      doc.setFontSize(11);
      doc.setTextColor(107, 114, 128);
      doc.setFont("helvetica", "normal");
      doc.text("Orientation Programme — 1A HK International", 148.5, 54, { align: "center" });

      // Divider line
      doc.setDrawColor(79, 70, 229);
      doc.setLineWidth(0.5);
      doc.line(50, 60, 247, 60);

      // Presented to
      doc.setFontSize(12);
      doc.setTextColor(107, 114, 128);
      doc.text("This certifies that", 148.5, 72, { align: "center" });

      // Student Name
      doc.setFontSize(32);
      doc.setTextColor(79, 70, 229);
      doc.setFont("helvetica", "bold");
      doc.text(cert.studentName, 148.5, 88, { align: "center" });

      // Course
      doc.setFontSize(11);
      doc.setTextColor(107, 114, 128);
      doc.setFont("helvetica", "normal");
      doc.text("has successfully completed the orientation session for", 148.5, 100, { align: "center" });

      doc.setFontSize(16);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      doc.text(cert.course, 148.5, 112, { align: "center" });

      // Score
      doc.setFontSize(11);
      doc.setTextColor(16, 185, 129);
      doc.setFont("helvetica", "normal");
      doc.text(`with a quiz score of ${cert.score}%`, 148.5, 122, { align: "center" });

      // Second divider
      doc.setDrawColor(229, 231, 235);
      doc.line(50, 130, 247, 130);

      // Footer details
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`Certificate No: ${cert.certificateNumber}`, 25, 145);
      doc.text(`Issued: ${new Date(cert.issuedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`, 25, 153);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 41, 55);
      doc.text(cert.approvedBy, 220, 145, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text(cert.designation, 220, 153, { align: "center" });
      doc.text(cert.instituteName, 220, 161, { align: "center" });

      doc.save(`orientation-certificate-${cert.certificateNumber}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate("/student/orientations")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sessions
        </button>

        {!eligible ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 text-center shadow-sm border border-red-100"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Not Eligible Yet</h2>
            <p className="text-gray-500 text-sm">
              You must attend the session and pass the quiz to download the certificate.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Certificate Preview */}
            <motion.div
              ref={certRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl border-2 border-indigo-200 overflow-hidden mb-6"
            >
              {/* Top gradient band */}
              <div className="h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500" />

              <div className="p-10 text-center relative">
                {/* Decorative background award */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
                  <Award className="w-96 h-96 text-indigo-900" />
                </div>

                {/* Header */}
                <div className="relative">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-indigo-400 tracking-[0.3em] uppercase mb-2">
                    1A HK International
                  </p>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    Certificate of Completion
                  </h1>
                  <p className="text-gray-500 text-sm">Orientation Programme</p>

                  <div className="flex items-center gap-2 justify-center my-5">
                    <div className="h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent flex-1 max-w-xs" />
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <div className="h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent flex-1 max-w-xs" />
                  </div>

                  <p className="text-gray-500 text-sm mb-2">This certifies that</p>
                  <h2 className="text-4xl font-bold text-indigo-700 mb-4">
                    {cert.studentName}
                  </h2>
                  <p className="text-gray-600 text-sm mb-2">
                    has successfully completed the orientation session for
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{cert.course}</h3>
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                    <CheckCircle2 className="w-4 h-4" />
                    Quiz Score: {cert.score}%
                  </div>

                  {/* Meta row */}
                  <div className="grid grid-cols-3 gap-4 text-sm border-t border-gray-100 pt-6 mt-2">
                    <div className="text-center">
                      <Calendar className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-400">Date Issued</p>
                      <p className="font-semibold text-gray-700">
                        {new Date(cert.issuedAt).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-center">
                      <BookOpen className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-400">Certificate No.</p>
                      <p className="font-mono text-xs font-semibold text-gray-700">
                        {cert.certificateNumber}
                      </p>
                    </div>
                    <div className="text-center">
                      <User className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-400">Approved By</p>
                      <p className="font-semibold text-gray-700 text-xs">{cert.approvedBy}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom band */}
              <div className="h-2 bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500" />
            </motion.div>

            {/* Download Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={handleDownload}
              disabled={downloading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {downloading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {downloading ? "Generating PDF..." : "Download Certificate (PDF)"}
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
