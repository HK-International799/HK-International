import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, Button, Input, Modal, Select, EmptyState } from "../../components/ui";
import { getAllCourseFees, setCourseFee } from "../../services/financeService";
import { getCourses } from "../../services/courseService";
import { Plus, Pencil } from "lucide-react";

export default function CourseFees() {
  const [fees,    setFees]    = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving,    setSaving]    = useState(false);

  const [form, setForm] = useState({
    courseId: "", fee: "", currency: "GBP", notes: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [feesRes, coursesRes] = await Promise.all([
        getAllCourseFees(),
        getCourses(),
      ]);
      setFees(feesRes.data || feesRes || []);
      const list = Array.isArray(coursesRes)
        ? coursesRes
        : coursesRes.courses || coursesRes.data?.courses || coursesRes.data || [];
      setCourses(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openEdit = (feeRecord) => {
    setForm({
      courseId: feeRecord.courseId?._id || feeRecord.courseId || "",
      fee:      String(feeRecord.fee),
      currency: feeRecord.currency || "GBP",
      notes:    feeRecord.notes || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.courseId || !form.fee) {
      alert("Course and fee are required");
      return;
    }
    setSaving(true);
    try {
      await setCourseFee({
        courseId: form.courseId,
        fee:      Number(form.fee),
        currency: form.currency,
        notes:    form.notes,
      });
      setShowModal(false);
      setForm({ courseId: "", fee: "", currency: "GBP", notes: "" });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save fee");
    } finally {
      setSaving(false);
    }
  };

  const courseOptions = [
    { value: "", label: "— Select Course —" },
    ...courses.map((c) => ({ value: c._id, label: c.title })),
  ];

  // Build a map of existing fee courseIds for quick lookup
  const feeMap = {};
  fees.forEach((f) => { feeMap[f.courseId?._id || f.courseId] = f; });

  return (
    <AdminLayout>
      <div className="animate-fadeIn space-y-4">
        <PageHeader
          title="Course Fees"
          subtitle="Set the enrollment fee for each course"
          actions={
            <Button onClick={() => { setForm({ courseId: "", fee: "", currency: "GBP", notes: "" }); setShowModal(true); }}>
              <Plus size={15} />
              Set Fee
            </Button>
          }
        />

        {loading ? (
          <EmptyState title="Loading..." />
        ) : fees.length === 0 ? (
          <EmptyState
            title="No course fees configured"
            description="Set a fee for each course so Finance staff can record payments accurately."
          />
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Course","Fee","Currency","Notes","Last Updated",""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fees.map((f) => (
                  <tr key={f._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {f.courseId?.title || "—"}
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-700">
                      {f.fee?.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{f.currency}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs max-w-xs truncate">
                      {f.notes || "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(f.updatedAt).toLocaleDateString("en-GB")}
                      {f.updatedBy?.name && ` · ${f.updatedBy.name}`}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => openEdit(f)}
                        className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500"
                      >
                        <Pencil size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title="Set Course Fee"
        >
          <div className="space-y-4">
            <Select
              label="Course *"
              value={form.courseId}
              onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
              options={courseOptions}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fee Amount *"
                type="number"
                min="0"
                step="0.01"
                value={form.fee}
                onChange={(e) => setForm((f) => ({ ...f, fee: e.target.value }))}
                placeholder="e.g. 1500"
              />
              <Input
                label="Currency"
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))}
                placeholder="GBP"
                maxLength={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Optional notes..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Fee"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
