import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, Button, Select, Input, EmptyState } from "../../components/ui";
import { getDispatchCertificateById, updateCertificateStatus } from "../../services/dispatchService";
import { ArrowLeft, MapPin, Building2, Truck } from "lucide-react";

const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-700",
  packed: "bg-indigo-50 text-indigo-600",
  dispatched: "bg-sky-50 text-sky-700",
  in_transit: "bg-blue-50 text-blue-700",
  delivered: "bg-emerald-50 text-emerald-600",
  returned: "bg-orange-100 text-orange-700",
  cancelled: "bg-red-50 text-red-600",
  postponed: "bg-gray-100 text-gray-600",
  lost: "bg-red-100 text-red-700",
  redispatched: "bg-purple-50 text-purple-700",
};

const ACTIONABLE_STATUS_OPTIONS = [
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Returned" },
  { value: "cancelled", label: "Cancelled" },
  { value: "postponed", label: "Postponed" },
  { value: "lost", label: "Lost" },
  { value: "redispatched", label: "Re-dispatched" },
];

export default function CertificateDispatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusForm, setStatusForm] = useState({ status: "delivered", remarks: "", deliveredDate: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getDispatchCertificateById(id)
      .then((d) => setCert(d.data || d))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateCertificateStatus({
        certificateIds: [id],
        status: statusForm.status,
        remarks: statusForm.remarks,
        deliveredDate: statusForm.deliveredDate || undefined,
      });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout><EmptyState title="Loading..." /></AdminLayout>;
  if (!cert) return <AdminLayout><EmptyState title="Certificate not found" /></AdminLayout>;

  const { receiver, sender } = cert;

  return (
    <AdminLayout>
      <div className="space-y-5 animate-fadeIn">
        <PageHeader
          title={cert.certificateNumber}
          subtitle={cert.courseId?.title || ""}
          actions={
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <ArrowLeft size={15} /> Back
            </Button>
          }
        />

        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[cert.dispatchStatus] || "bg-gray-100 text-gray-600"}`}>
          {cert.dispatchStatus?.replace("_", " ")}
        </span>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Receiver */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-indigo-600" />
              <p className="text-sm font-semibold text-gray-700">Receiver (from learner profile)</p>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-800">{receiver?.candidateName}</p>
              {receiver?.company && <p>{receiver.company}</p>}
              <p>{receiver?.address}</p>
              <p>{[receiver?.area, receiver?.city, receiver?.district].filter(Boolean).join(", ")}</p>
              <p>{[receiver?.state, receiver?.pinCode].filter(Boolean).join(" - ")}</p>
              <p>{receiver?.country}</p>
              <p className="pt-2 text-xs text-gray-400">{receiver?.mobile} · {receiver?.email}</p>
            </div>
          </div>

          {/* Sender */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={16} className="text-indigo-600" />
              <p className="text-sm font-semibold text-gray-700">Sender (fixed)</p>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-800">{sender?.name}</p>
              <p>{sender?.careOf}</p>
              <p>{sender?.addressLine1}</p>
              <p>{sender?.addressLine2}, {sender?.area}</p>
              <p>{sender?.landmark}, {sender?.city}</p>
              <p>{sender?.state} - {sender?.pinCode}</p>
              <p>{sender?.country}</p>
              <p className="pt-2 text-xs text-gray-400">Courier: {sender?.courierCompany}</p>
            </div>
          </div>
        </div>

        {/* Dispatch info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Truck size={16} className="text-indigo-600" />
            <p className="text-sm font-semibold text-gray-700">Dispatch Details</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><p className="text-xs text-gray-400">Batch</p><p className="font-medium text-gray-700">{cert.dispatchBatch?.batchNumber || "—"}</p></div>
            <div><p className="text-xs text-gray-400">Tracking Number</p><p className="font-mono font-medium text-gray-700">{cert.trackingNumber || "—"}</p></div>
            <div><p className="text-xs text-gray-400">Dispatch Date</p><p className="font-medium text-gray-700">{cert.dispatchDate ? new Date(cert.dispatchDate).toLocaleDateString("en-GB") : "—"}</p></div>
            <div><p className="text-xs text-gray-400">Delivered Date</p><p className="font-medium text-gray-700">{cert.deliveredDate ? new Date(cert.deliveredDate).toLocaleDateString("en-GB") : "—"}</p></div>
          </div>
          {cert.dispatchRemarks && <p className="text-xs text-gray-500 mt-3">Remarks: {cert.dispatchRemarks}</p>}
        </div>

        {/* Update status */}
        {["dispatched", "in_transit", "returned", "postponed"].includes(cert.dispatchStatus) && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-3">Update Dispatch Status</p>
            <div className="flex flex-wrap gap-3 items-end">
              <Select
                label="Status"
                value={statusForm.status}
                onChange={(e) => setStatusForm((f) => ({ ...f, status: e.target.value }))}
                options={ACTIONABLE_STATUS_OPTIONS}
                className="w-48"
              />
              {statusForm.status === "delivered" && (
                <Input type="date" label="Delivered Date" value={statusForm.deliveredDate} onChange={(e) => setStatusForm((f) => ({ ...f, deliveredDate: e.target.value }))} />
              )}
              <Input label="Remarks" value={statusForm.remarks} onChange={(e) => setStatusForm((f) => ({ ...f, remarks: e.target.value }))} className="flex-1 min-w-[200px]" />
              <Button loading={saving} onClick={handleUpdate}>Update</Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
