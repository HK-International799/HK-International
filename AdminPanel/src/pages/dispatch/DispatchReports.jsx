import { useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, Button, Select, Input, EmptyState } from "../../components/ui";
import { getDispatchReport, exportDispatchReportCSV } from "../../services/dispatchService";
import { Download, FileBarChart } from "lucide-react";

const REPORT_TYPES = [
  { value: "daily", label: "Daily Dispatch Report" },
  { value: "monthly", label: "Monthly Dispatch Report" },
  { value: "expense", label: "Expense Report" },
  { value: "batch", label: "Batch Report" },
  { value: "pending", label: "Pending Dispatch Report" },
  { value: "delivered", label: "Delivered Report" },
  { value: "returned", label: "Returned Report" },
  { value: "cancelled", label: "Cancelled Report" },
];

export default function DispatchReports() {
  const [type, setType] = useState("daily");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  const params = () => {
    const p = { type };
    if (dateFrom) p.dateFrom = dateFrom;
    if (dateTo) p.dateTo = dateTo;
    return p;
  };

  const runReport = async () => {
    setLoading(true);
    setRan(true);
    try {
      const res = await getDispatchReport(params());
      setRows(res.data || res || []);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const isCertReport = ["daily", "monthly", "pending", "delivered", "returned", "cancelled"].includes(type);

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fadeIn">
        <PageHeader
          title="Dispatch Reports"
          subtitle="Generate and export certificate dispatch reports"
          actions={
            <Button variant="secondary" onClick={() => exportDispatchReportCSV(params())} disabled={!ran || rows.length === 0}>
              <Download size={15} /> Export CSV
            </Button>
          }
        />

        <div className="flex flex-wrap items-end gap-3 bg-white border border-gray-100 rounded-2xl p-4">
          <Select label="Report Type" value={type} onChange={(e) => setType(e.target.value)} options={REPORT_TYPES} className="w-64" />
          <Input type="date" label="From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input type="date" label="To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <Button onClick={runReport}><FileBarChart size={15} /> Generate</Button>
        </div>

        {loading ? (
          <EmptyState title="Generating report..." />
        ) : !ran ? (
          <EmptyState title="Choose a report type and click Generate" icon={FileBarChart} />
        ) : rows.length === 0 ? (
          <EmptyState title="No records found for this report" />
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {isCertReport ? (
                      <>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Certificate</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Candidate</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Course</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Batch</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Tracking</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Dispatch Date</th>
                      </>
                    ) : type === "expense" ? (
                      <>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Category</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Item</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Total</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Batch</th>
                      </>
                    ) : (
                      <>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Batch Number</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Dispatch Date</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Tracking</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Charges</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((r) => (
                    <tr key={r._id}>
                      {isCertReport ? (
                        <>
                          <td className="px-5 py-3.5 text-sm font-mono text-gray-700">{r.certificateNumber}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-700">{r.receiver?.candidateName || "—"}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-600">{r.courseId?.title || "—"}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-600">{r.dispatchStatus}</td>
                          <td className="px-5 py-3.5 text-xs font-mono text-gray-500">{r.dispatchBatch?.batchNumber || "—"}</td>
                          <td className="px-5 py-3.5 text-xs font-mono text-gray-500">{r.trackingNumber || "—"}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-500">{r.dispatchDate ? new Date(r.dispatchDate).toLocaleDateString("en-GB") : "—"}</td>
                        </>
                      ) : type === "expense" ? (
                        <>
                          <td className="px-5 py-3.5 text-sm text-gray-600">{new Date(r.expenseDate).toLocaleDateString("en-GB")}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-700">{r.category}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-600">{r.item}</td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">₹{r.total}</td>
                          <td className="px-5 py-3.5 text-xs font-mono text-gray-500">{r.dispatchBatch?.batchNumber || "—"}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-3.5 text-sm font-mono text-gray-700">{r.batchNumber}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-600">{new Date(r.dispatchDate).toLocaleDateString("en-GB")}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-600">{r.status}</td>
                          <td className="px-5 py-3.5 text-xs font-mono text-gray-500">{r.speedPost?.trackingNumber || "—"}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-700">₹{r.speedPost?.totalCharges || 0}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
