import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, EmptyState } from "../../components/ui";
import { getFinanceTransactionById } from "../../services/financeService";
import { ArrowLeft, Globe, FileText } from "lucide-react";

const fmt = (n, cur = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n || 0);

/**
 * TransactionDetail
 *
 * Task 8.7: destination for the "no learner profile" link shown in
 * PaymentsList.jsx for guest/unregistered online (Razorpay) payments --
 * i.e. records where isRegisteredLearner is false, so there is no
 * /admin/finance/learner/:learnerId page to send the admin to.
 *
 * Read-only view built on the normalized shape returned by
 * getFinanceTransactionById (?source=manual|online), added in Task 8.6.
 */
export default function TransactionDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source") || "online";
  const navigate = useNavigate();

  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getFinanceTransactionById(id, source)
      .then((d) => setTxn(d.data || d))
      .catch((err) => setError(err.response?.data?.message || "Transaction not found"))
      .finally(() => setLoading(false));
  }, [id, source]);

  return (
    <AdminLayout>
      <div className="animate-fadeIn space-y-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="mt-1 p-2 rounded-xl hover:bg-gray-100 text-gray-400"
          >
            <ArrowLeft size={18} />
          </button>
          <PageHeader title="Transaction Detail" subtitle="Guest / unregistered payment" />
        </div>

        {loading ? (
          <div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
        ) : error || !txn ? (
          <EmptyState title={error || "Transaction not found"} />
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  txn.source === "online" ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-700"
                }`}
              >
                {txn.source === "online" ? <Globe size={12} /> : <FileText size={12} />}
                {txn.source === "online" ? "Online (Razorpay)" : "Manual"}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                {txn.isRegisteredLearner ? "Registered Learner" : "Guest / Unregistered"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" value={txn.learnerName || "—"} />
              <Field label="Email" value={txn.learnerEmail || "—"} />
              <Field label="Phone" value={txn.learnerMobile || "—"} />
              <Field label="Amount" value={fmt(txn.amount, txn.currency)} />
              <Field label="Payment Mode / Gateway" value={txn.paymentMode || txn.gateway || "—"} />
              <Field label="Status" value={txn.status} />
              <Field label="Reference / Order ID" value={txn.referenceNumber || "—"} />
              <Field label="Payment ID" value={txn.paymentId || "—"} />
              <Field
                label="Date"
                value={txn.date ? new Date(txn.date).toLocaleString("en-GB") : "—"}
              />
            </div>

            <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
              This payment was made through the public checkout by someone who was not a
              logged-in learner at the time (or has not yet completed registration), so
              there is no learner profile to link to.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800 capitalize">{value}</p>
    </div>
  );
}
