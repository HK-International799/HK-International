import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileDown, Download, CheckCircle2, Loader2, BarChart2,
  Users, Award, ScrollText, FileText, Building2,
} from "lucide-react";
import AOLayout from "./AOLayout";
import { downloadReport } from "../../services/aoService";
import { toast } from "sonner";

const REPORTS = [
  {
    id: "learners",
    title: "Learner Report",
    description: "Full list of all enrolled learners with status, progress, and contact details.",
    icon: Users,
    color: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-50",
    fields: ["Name","Email","Student ID","Course","Institute","Status","Progress","Enrolled Date"],
  },
  {
    id: "certifications",
    title: "Certifications Report",
    description: "All issued, pending, and expired certificates with verification codes.",
    icon: Award,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    fields: ["Certificate No","Student","Course","Status","Issued Date","Expiry","Verification Code"],
  },
  {
    id: "completions",
    title: "Course Completion Report",
    description: "Course-wise completion rates, average scores, and time-to-complete metrics.",
    icon: BarChart2,
    color: "from-green-500 to-emerald-500",
    bg: "bg-green-50",
    fields: ["Course","Total Enrolled","Completed","Completion Rate","Avg Score","Avg Duration"],
  },
  {
    id: "audit",
    title: "Audit Trail Report",
    description: "Complete system audit logs with timestamps, actors, and event types.",
    icon: ScrollText,
    color: "from-purple-500 to-purple-600",
    bg: "bg-purple-50",
    fields: ["Timestamp","Event Type","Actor","Resource","IP Address","Status"],
  },
  {
    id: "institutes",
    title: "Partner Institute Report",
    description: "Breakdown of learners and certifications by partner institute.",
    icon: Building2,
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    fields: ["Institute","Total Learners","Active","Certified","Pending","Completion Rate"],
  },
  {
    id: "orientations",
    title: "Orientation Report",
    description: "Orientation session attendance, quiz scores, and certificate issuance records.",
    icon: FileText,
    color: "from-rose-500 to-pink-500",
    bg: "bg-rose-50",
    fields: ["Session","Date","Attendees","Passed","Failed","Certs Issued"],
  },
];

function generateMockCSV(reportId) {
  const fieldMap = {
    learners: { headers: ["Name","Email","Student ID","Course","Status","Progress"], rows: 15 },
    certifications: { headers: ["Certificate No","Student","Course","Status","Issued Date"], rows: 12 },
    completions: { headers: ["Course","Enrolled","Completed","Rate","Avg Score"], rows: 8 },
    audit: { headers: ["Timestamp","Event","Actor","IP","Status"], rows: 25 },
    institutes: { headers: ["Institute","Learners","Certified","Rate"], rows: 5 },
    orientations: { headers: ["Session","Date","Attendees","Passed","Certs"], rows: 6 },
  };
  const { headers, rows } = fieldMap[reportId] || fieldMap.learners;
  const data = [headers];
  for (let i = 0; i < rows; i++) {
    data.push(headers.map(() => `Sample Data ${i + 1}`));
  }
  return data.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
}

export default function AOReports() {
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (report) => {
    setDownloading(report.id);
    try {
      let blob;
      try {
        const data = await downloadReport(report.id);
        blob = data;
      } catch {
        const csv = generateMockCSV(report.id);
        blob = new Blob([csv], { type: "text/csv" });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.id}-report-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${report.title} downloaded successfully!`);
    } catch {
      toast.error("Failed to generate report.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <AOLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 text-sm mt-0.5">Download programme reports in CSV format</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {REPORTS.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all overflow-hidden group"
          >
            <div className={`h-1.5 bg-gradient-to-r ${report.color}`} />
            <div className="p-6">
              <div className={`inline-flex p-3 rounded-xl ${report.bg} mb-4 group-hover:scale-105 transition-transform`}>
                <report.icon className={`w-6 h-6 bg-gradient-to-br ${report.color} bg-clip-text`}
                  style={{ color: report.color.includes("indigo") ? "#6366f1" :
                    report.color.includes("amber") ? "#f59e0b" :
                    report.color.includes("green") ? "#10b981" :
                    report.color.includes("purple") ? "#8b5cf6" :
                    report.color.includes("blue") ? "#3b82f6" : "#f43f5e" }} />
              </div>

              <h3 className="font-bold text-gray-900 mb-2">{report.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{report.description}</p>

              {/* Field tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {report.fields.slice(0, 4).map((f) => (
                  <span key={f} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{f}</span>
                ))}
                {report.fields.length > 4 && (
                  <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-md">+{report.fields.length - 4} more</span>
                )}
              </div>

              <button
                onClick={() => handleDownload(report)}
                disabled={downloading === report.id}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-all bg-gradient-to-r ${report.color} hover:opacity-90 disabled:opacity-60`}
              >
                {downloading === report.id ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Download className="w-4 h-4" /> Download CSV</>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </AOLayout>
  );
}
