import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, Button, Input, Select } from "../../components/ui";
import { recordPayment, getCourseFee } from "../../services/financeService";
import { getAllUsers } from "../../services/adminService";
import { getCourses } from "../../services/courseService";
import { ArrowLeft, Upload, CheckCircle2 } from "lucide-react";

const MODE_OPTIONS = [
  { value: "upi",           label: "UPI" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "wise",          label: "Wise" },
  { value: "razorpay",      label: "Razorpay" },
  { value: "cash",          label: "Cash" },
  { value: "cheque",        label: "Cheque" },
  { value: "other",         label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "part_payment",    label: "Part Payment" },
  { value: "fully_paid",      label: "Fully Paid" },
  { value: "balance_pending", label: "Balance Pending" },
  { value: "refund_issued",   label: "Refund Issued" },
  { value: "adjustment",      label: "Adjustment" },
];

export default function RecordPayment() {
  const navigate = useNavigate();

  const [learners, setLearners] = useState([]);
  const [courses,  setCourses]  = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [errors,   setErrors]   = useState({});

  const [form, setForm] = useState({
    learnerId:       "",
    courseId:        "",
    totalCourseFee:  "",
    amount:          "",
    currency:        "GBP",
    paymentDate:     new Date().toISOString().slice(0, 10),
    paymentMode:     "bank_transfer",
    referenceNumber: "",
    remarks:         "",
    status:          "part_payment",
    proof:           null,
  });

  const [feeHint, setFeeHint] = useState(null);

  // Load learners and courses on mount
  useEffect(() => {
    getAllUsers({ role: "student" })
      .then((d) => setLearners(d.users || d.data?.users || []))
      .catch(console.error);

    getCourses()
      .then((d) => {
        const list = Array.isArray(d) ? d : d.courses || d.data?.courses || d.data || [];
        setCourses(list);
      })
      .catch(console.error);
  }, []);

  // When course changes, fetch the configured fee
  useEffect(() => {
    if (!form.courseId) { setFeeHint(null); return; }
    getCourseFee(form.courseId)
      .then((d) => {
        const fee = d.data || d;
        if (fee?.fee) {
          setFeeHint(fee);
          setForm((f) => ({ ...f, totalCourseFee: String(fee.fee) }));
        } else {
          setFeeHint(null);
        }
      })
      .catch(() => setFeeHint(null));
  }, [form.courseId]);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.learnerId)      errs.learnerId      = "Select a learner";
    if (!form.courseId)       errs.courseId       = "Select a course";
    if (!form.totalCourseFee || Number(form.totalCourseFee) < 0)
                              errs.totalCourseFee = "Enter valid course fee";
    if (form.amount === "" || Number(form.amount) < 0)
                              errs.amount         = "Enter valid amount";
    if (!form.paymentDate)    errs.paymentDate    = "Select payment date";
    if (!form.paymentMode)    errs.paymentMode    = "Select payment mode";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      await recordPayment({
        learnerId:       form.learnerId,
        courseId:        form.courseId,
        totalCourseFee:  Number(form.totalCourseFee),
        amount:          Number(form.amount),
        currency:        form.currency,
        paymentDate:     form.paymentDate,
        paymentMode:     form.paymentMode,
        referenceNumber: form.referenceNumber,
        remarks:         form.remarks,
        status:          form.status,
        proof:           form.proof || undefined,
      });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <AdminLayout>
        <div className="max-w-lg mx-auto mt-20 text-center space-y-4">
          <CheckCircle2 size={56} className="mx-auto text-green-500" />
          <h2 className="text-xl font-bold text-gray-800">Payment Recorded</h2>
          <p className="text-gray-500">The payment has been saved successfully.</p>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="secondary" onClick={() => navigate("/admin/finance/payments")}>
              View All Payments
            </Button>
            <Button
              onClick={() => {
                setSuccess(false);
                setForm({
                  learnerId:"", courseId:"", totalCourseFee:"", amount:"",
                  currency:"GBP", paymentDate: new Date().toISOString().slice(0,10),
                  paymentMode:"bank_transfer", referenceNumber:"", remarks:"",
                  status:"part_payment", proof:null,
                });
              }}
            >
              Record Another
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const learnerOptions = [
    { value: "", label: "— Select Learner —" },
    ...learners.map((u) => ({ value: u._id, label: `${u.name} (${u.email})` })),
  ];

  const courseOptions = [
    { value: "", label: "— Select Course —" },
    ...courses.map((c) => ({ value: c._id, label: c.title })),
  ];

  const balance =
    form.totalCourseFee && form.amount
      ? Math.max(0, Number(form.totalCourseFee) - Number(form.amount))
      : null;

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto animate-fadeIn">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
          >
            <ArrowLeft size={18} />
          </button>
          <PageHeader
            title="Record Payment"
            subtitle="Add a manual payment entry for a learner"
          />
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">

          {/* Learner */}
          <div>
            <Select
              label="Learner *"
              value={form.learnerId}
              onChange={(e) => set("learnerId", e.target.value)}
              options={learnerOptions}
            />
            {errors.learnerId && <p className="text-xs text-red-500 mt-1">{errors.learnerId}</p>}
          </div>

          {/* Course */}
          <div>
            <Select
              label="Course *"
              value={form.courseId}
              onChange={(e) => set("courseId", e.target.value)}
              options={courseOptions}
            />
            {errors.courseId && <p className="text-xs text-red-500 mt-1">{errors.courseId}</p>}
            {feeHint && (
              <p className="text-xs text-indigo-600 mt-1">
                Configured fee: {feeHint.currency} {feeHint.fee?.toLocaleString()}
              </p>
            )}
          </div>

          {/* Fee row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Total Course Fee *"
                type="number"
                min="0"
                step="0.01"
                value={form.totalCourseFee}
                onChange={(e) => set("totalCourseFee", e.target.value)}
                placeholder="e.g. 1500"
              />
              {errors.totalCourseFee && (
                <p className="text-xs text-red-500 mt-1">{errors.totalCourseFee}</p>
              )}
            </div>
            <div>
              <Input
                label="Currency"
                value={form.currency}
                onChange={(e) => set("currency", e.target.value.toUpperCase())}
                placeholder="GBP"
                maxLength={3}
              />
            </div>
          </div>

          {/* Amount row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Amount Paid (This Installment) *"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="e.g. 500"
              />
              {errors.amount && (
                <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
              )}
            </div>
            <div>
              <Input
                label="Payment Date *"
                type="date"
                value={form.paymentDate}
                onChange={(e) => set("paymentDate", e.target.value)}
              />
              {errors.paymentDate && (
                <p className="text-xs text-red-500 mt-1">{errors.paymentDate}</p>
              )}
            </div>
          </div>

          {/* Balance hint */}
          {balance !== null && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
              balance === 0 ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
            }`}>
              {balance === 0
                ? "✓ This payment will mark the course as Fully Paid"
                : `Outstanding balance after this payment: ${form.currency} ${balance.toLocaleString()}`}
            </div>
          )}

          {/* Mode & Reference */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select
                label="Payment Mode *"
                value={form.paymentMode}
                onChange={(e) => set("paymentMode", e.target.value)}
                options={MODE_OPTIONS}
              />
              {errors.paymentMode && (
                <p className="text-xs text-red-500 mt-1">{errors.paymentMode}</p>
              )}
            </div>
            <div>
              <Input
                label="Reference / Transaction ID"
                value={form.referenceNumber}
                onChange={(e) => set("referenceNumber", e.target.value)}
                placeholder="UTR, TXN ID, cheque no..."
              />
            </div>
          </div>

          {/* Status */}
          <Select
            label="Payment Status"
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            options={STATUS_OPTIONS}
          />

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              rows={3}
              value={form.remarks}
              onChange={(e) => set("remarks", e.target.value)}
              placeholder="Optional notes about this payment..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Proof Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Proof (Screenshot / Bank Slip)
            </label>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition">
              <Upload size={20} className="text-gray-400" />
              <span className="text-sm text-gray-500">
                {form.proof ? form.proof.name : "Click to upload image or PDF (max 5MB)"}
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => set("proof", e.target.files[0] || null)}
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Record Payment"}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
