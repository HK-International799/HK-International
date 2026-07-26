import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, Button, Input, Modal, EmptyState, StatCard } from "../../components/ui";
import {
  getBatchById, bookSpeedPost, removeCertificateFromBatch, deleteBatch,
} from "../../services/dispatchService";
import { ArrowLeft, Send, Trash2, Wallet, PackageCheck, Truck } from "lucide-react";

const fmtMoney = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export default function DispatchBatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [speedPostModal, setSpeedPostModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    trackingNumber: "", bookingDate: new Date().toISOString().slice(0, 10), bookingTime: "",
    postOfficeName: "", bookingClerk: "", totalCharges: "", weight: "", remarks: "",
  });

  const load = () => {
    setLoading(true);
    getBatchById(id).then((d) => setDetail(d.data || d)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleBookSpeedPost = async () => {
    setSaving(true);
    try {
      await bookSpeedPost(id, form);
      setSpeedPostModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to book Speed Post");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCert = async (certificateId) => {
    if (!confirm("Remove this certificate from the batch?")) return;
    try {
      await removeCertificateFromBatch(id, certificateId);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove certificate");
    }
  };

  const handleDeleteBatch = async () => {
    if (!confirm("Delete this batch? Certificates will return to Pending.")) return;
    try {
      await deleteBatch(id);
      navigate("/admin/dispatch/batches");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete batch");
    }
  };

  if (loading) return <AdminLayout><EmptyState title="Loading batch..." /></AdminLayout>;
  if (!detail) return <AdminLayout><EmptyState title="Batch not found" /></AdminLayout>;

  const { batch, certificates = [], expenses = [], costSummary = {} } = detail;
  const isOpen = batch.status === "open";

  return (
    <AdminLayout>
      <div className="space-y-5 animate-fadeIn">
        <PageHeader
          title={batch.batchNumber}
          subtitle={`${certificates.length} certificate(s) · ${batch.status}`}
          actions={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => navigate("/admin/dispatch/batches")}><ArrowLeft size={15} /> Back</Button>
              {isOpen && certificates.length > 0 && (
                <Button onClick={() => setSpeedPostModal(true)}><Send size={15} /> Book Speed Post</Button>
              )}
              {isOpen && (
                <Button variant="danger" onClick={handleDeleteBatch}><Trash2 size={15} /> Delete Batch</Button>
              )}
            </div>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Certificates" value={certificates.length} icon={PackageCheck} color="primary" />
          <StatCard title="Speed Post Charges" value={fmtMoney(costSummary.speedPostCharges)} icon={Truck} color="accent" />
          <StatCard title="Linked Expenses" value={fmtMoney(costSummary.linkedExpenses)} icon={Wallet} color="accent" />
          <StatCard title="Avg Cost / Certificate" value={fmtMoney(costSummary.avgCostPerCertificate)} icon={Wallet} color="success" />
        </div>

        {batch.speedPost?.trackingNumber && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-3">Speed Post Booking</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-xs text-gray-400">Tracking No.</p><p className="font-mono font-medium text-gray-700">{batch.speedPost.trackingNumber}</p></div>
              <div><p className="text-xs text-gray-400">Booking Date</p><p className="font-medium text-gray-700">{batch.speedPost.bookingDate ? new Date(batch.speedPost.bookingDate).toLocaleDateString("en-GB") : "—"}</p></div>
              <div><p className="text-xs text-gray-400">Post Office</p><p className="font-medium text-gray-700">{batch.speedPost.postOfficeName || "—"}</p></div>
              <div><p className="text-xs text-gray-400">Weight</p><p className="font-medium text-gray-700">{batch.speedPost.weight || 0} kg</p></div>
            </div>
          </div>
        )}

        {/* Certificates in batch */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100"><p className="text-sm font-semibold text-gray-700">Certificates</p></div>
          {certificates.length === 0 ? (
            <EmptyState title="No certificates in this batch" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Certificate</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Candidate</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                    {isOpen && <th className="px-5 py-3"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {certificates.map((c) => (
                    <tr key={c._id} className="hover:bg-indigo-50/40 cursor-pointer" onClick={() => navigate(`/admin/dispatch/certificates/${c._id}`)}>
                      <td className="px-5 py-3.5 text-sm font-mono text-gray-700">{c.certificateNumber}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-700">{c.receiver?.candidateName || c.studentId?.name}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{c.dispatchStatus}</td>
                      {isOpen && (
                        <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleRemoveCert(c._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Linked expenses */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Linked Expenses</p>
            <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/dispatch/expenses?batch=${id}`)}>Add Expense</Button>
          </div>
          {expenses.length === 0 ? (
            <EmptyState title="No expenses linked to this batch" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Category</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Item</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {expenses.map((e) => (
                    <tr key={e._id}>
                      <td className="px-5 py-3.5 text-sm text-gray-700">{e.category}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{e.item}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">{fmtMoney(e.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal open={speedPostModal} onClose={() => setSpeedPostModal(false)} title="Book Speed Post" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Tracking Number *" value={form.trackingNumber} onChange={(e) => setForm((f) => ({ ...f, trackingNumber: e.target.value }))} />
          <Input type="date" label="Booking Date" value={form.bookingDate} onChange={(e) => setForm((f) => ({ ...f, bookingDate: e.target.value }))} />
          <Input type="time" label="Booking Time" value={form.bookingTime} onChange={(e) => setForm((f) => ({ ...f, bookingTime: e.target.value }))} />
          <Input label="India Post Office Name" value={form.postOfficeName} onChange={(e) => setForm((f) => ({ ...f, postOfficeName: e.target.value }))} />
          <Input label="Booking Clerk (optional)" value={form.bookingClerk} onChange={(e) => setForm((f) => ({ ...f, bookingClerk: e.target.value }))} />
          <Input type="number" label="Total Charges (₹)" value={form.totalCharges} onChange={(e) => setForm((f) => ({ ...f, totalCharges: e.target.value }))} />
          <Input type="number" label="Weight (kg)" value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} />
          <Input label="Remarks" value={form.remarks} onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={() => setSpeedPostModal(false)}>Cancel</Button>
          <Button loading={saving} disabled={!form.trackingNumber} onClick={handleBookSpeedPost}>Book & Dispatch</Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
