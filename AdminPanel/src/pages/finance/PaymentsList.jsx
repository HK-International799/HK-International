import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  PageHeader, DataTable, Button, Input, Select, EmptyState,
} from "../../components/ui";
import { getAllPayments, exportPaymentsCSV, deletePayment } from "../../services/financeService";
import { Plus, Download, Trash2, Eye } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "",                label: "All Statuses" },
  { value: "fully_paid",      label: "Fully Paid" },
  { value: "part_payment",    label: "Part Payment" },
  { value: "balance_pending", label: "Balance Pending" },
  { value: "not_paid",        label: "Not Paid" },
  { value: "refund_issued",   label: "Refund Issued" },
  { value: "adjustment",      label: "Adjustment" },
];

const MODE_OPTIONS = [
  { value: "",              label: "All Modes" },
  { value: "razorpay",      label: "Razorpay" },
  { value: "upi",           label: "UPI" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "wise",          label: "Wise" },
  { value: "cash",          label: "Cash" },
  { value: "cheque",        label: "Cheque" },
  { value: "other",         label: "Other" },
];

const fmt = (n) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n || 0);

const STATUS_STYLE = {
  fully_paid:      "bg-green-100 text-green-700",
  part_payment:    "bg-yellow-100 text-yellow-700",
  balance_pending: "bg-orange-100 text-orange-700",
  not_paid:        "bg-red-100 text-red-700",
  refund_issued:   "bg-purple-100 text-purple-700",
  adjustment:      "bg-blue-100 text-blue-700",
};

const STATUS_LABEL = {
  fully_paid:      "Fully Paid",
  part_payment:    "Part Payment",
  balance_pending: "Balance Pending",
  not_paid:        "Not Paid",
  refund_issued:   "Refund Issued",
  adjustment:      "Adjustment",
};

export default function PaymentsList() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [page,     setPage]     = useState(1);

  const [filters, setFilters] = useState({
    status: "", paymentMode: "", search: "",
    dateFrom: "", dateTo: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30, ...filters };
      // Remove empty keys
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });

      const res  = await getAllPayments(params);
      const data = res.data || res;
      setPayments(data.payments || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  const handleFilter = (key, val) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: val }));
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this payment record? This cannot be undone.")) return;
    try {
      await deletePayment(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const columns = [
    {
      key: "learner",
      label: "Learner",
      render: (r) => (
        <div>
          <p className="font-medium text-gray-800">{r.learnerId?.name || "—"}</p>
          <p className="text-xs text-gray-400">{r.learnerId?.email || ""}</p>
        </div>
      ),
    },
    {
      key: "course",
      label: "Course",
      render: (r) => (
        <span className="text-sm text-gray-600">{r.courseId?.title || "—"}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (r) => (
        <div>
          <p className="font-semibold text-gray-800">{fmt(r.amount)}</p>
          <p className="text-xs text-gray-400">of {fmt(r.totalCourseFee)}</p>
        </div>
      ),
    },
    {
      key: "paymentMode",
      label: "Mode",
      render: (r) => (
        <span className="text-sm capitalize text-gray-600">
          {r.paymentMode?.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "referenceNumber",
      label: "Reference",
      render: (r) => (
        <span className="text-xs font-mono text-gray-500">{r.referenceNumber || "—"}</span>
      ),
    },
    {
      key: "paymentDate",
      label: "Date",
      render: (r) =>
        r.paymentDate
          ? new Date(r.paymentDate).toLocaleDateString("en-GB")
          : "—",
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            STATUS_STYLE[r.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {STATUS_LABEL[r.status] || r.status}
        </span>
      ),
    },
    {
      key: "proofUrl",
      label: "Proof",
      render: (r) =>
        r.proofUrl ? (
          <a
            href={r.proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline text-xs"
          >
            View
          </a>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        ),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/finance/learner/${r.learnerId?._id}`);
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            title="View learner profile"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(r._id);
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"
            title="Delete record"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(total / 30);

  return (
    <AdminLayout>
      <div className="animate-fadeIn space-y-4">
        <PageHeader
          title="Payment Records"
          subtitle={`${total} total records`}
          actions={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => exportPaymentsCSV(filters)}
              >
                <Download size={15} />
                Export CSV
              </Button>
              <Button onClick={() => navigate("/admin/finance/record")}>
                <Plus size={15} />
                Record Payment
              </Button>
            </div>
          }
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3 bg-white border border-gray-100 rounded-2xl p-4">
          <Input
            placeholder="Search reference / remarks..."
            value={filters.search}
            onChange={(e) => handleFilter("search", e.target.value)}
            className="w-56"
          />
          <Select
            value={filters.status}
            onChange={(e) => handleFilter("status", e.target.value)}
            options={STATUS_OPTIONS}
          />
          <Select
            value={filters.paymentMode}
            onChange={(e) => handleFilter("paymentMode", e.target.value)}
            options={MODE_OPTIONS}
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 whitespace-nowrap">From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilter("dateFrom", e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 whitespace-nowrap">To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilter("dateTo", e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          {(filters.search || filters.status || filters.paymentMode || filters.dateFrom || filters.dateTo) && (
            <button
              onClick={() => {
                setFilters({ status: "", paymentMode: "", search: "", dateFrom: "", dateTo: "" });
                setPage(1);
              }}
              className="text-xs text-red-500 hover:text-red-700 px-2"
            >
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <EmptyState title="Loading payments..." />
        ) : (
          <DataTable
            columns={columns}
            data={payments}
            emptyMessage="No payment records found"
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
