import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  PageHeader, DataTable, Button, Input, Select, Modal, EmptyState, StatCard,
} from "../../components/ui";
import {
  getAllExpenses, createExpense, updateExpense, deleteExpense, getExpenseCategories,
} from "../../services/dispatchService";
import { Plus, Trash2, Paperclip, Wallet, Edit2 } from "lucide-react";

const PAYMENT_MODES = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "other", label: "Other" },
];

const emptyForm = {
  expenseDate: new Date().toISOString().slice(0, 10),
  category: "Courier Charges",
  item: "", quantity: 1, unitPrice: "", total: "",
  vendor: "", billNumber: "", paymentMode: "cash", notes: "", bill: null,
};

const fmtMoney = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export default function DispatchExpenses() {
  const [searchParams] = useSearchParams();
  const batchFromUrl = searchParams.get("batch") || "";

  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ category: "", dateFrom: "", dateTo: "", hasNoBill: "" });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm, dispatchBatch: batchFromUrl });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getExpenseCategories().then((r) => setCategories(r.data || r || [])).catch(() => setCategories([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30, ...filters };
      if (batchFromUrl) params.dispatchBatch = batchFromUrl;
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await getAllExpenses(params);
      const data = res.data || res;
      setExpenses(data.expenses || []);
      setTotal(data.total || 0);
      setTotalAmount(data.totalAmount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filters, batchFromUrl]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (batchFromUrl) {
      setForm((f) => ({ ...f, dispatchBatch: batchFromUrl }));
      setModalOpen(true);
    }
  }, [batchFromUrl]);

  const handleFilter = (key, val) => { setPage(1); setFilters((f) => ({ ...f, [key]: val })); };

  const openCreate = () => { setEditingId(null); setForm({ ...emptyForm, dispatchBatch: batchFromUrl }); setModalOpen(true); };
  const openEdit = (e) => {
    setEditingId(e._id);
    setForm({
      expenseDate: e.expenseDate?.slice(0, 10) || "", category: e.category, item: e.item,
      quantity: e.quantity, unitPrice: e.unitPrice, total: e.total, vendor: e.vendor || "",
      billNumber: e.billNumber || "", paymentMode: e.paymentMode, notes: e.notes || "",
      dispatchBatch: e.dispatchBatch?._id || "", bill: null,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.item) { alert("Item is required"); return; }
    setSaving(true);
    try {
      if (editingId) await updateExpense(editingId, form);
      else await createExpense(form);
      setModalOpen(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this expense record?")) return;
    try {
      await deleteExpense(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const categoryOptions = [{ value: "", label: "All Categories" }, ...categories.map((c) => ({ value: c, label: c }))];

  const columns = [
    { key: "expenseDate", label: "Date", render: (r) => new Date(r.expenseDate).toLocaleDateString("en-GB") },
    { key: "category", label: "Category" },
    { key: "item", label: "Item", render: (r) => (
      <div><p className="text-gray-800">{r.item}</p><p className="text-xs text-gray-400">Qty {r.quantity} × {fmtMoney(r.unitPrice)}</p></div>
    ) },
    { key: "total", label: "Total", render: (r) => <span className="font-semibold text-gray-800">{fmtMoney(r.total)}</span> },
    { key: "batch", label: "Batch", render: (r) => <span className="font-mono text-xs">{r.dispatchBatch?.batchNumber || "—"}</span> },
    { key: "paymentMode", label: "Mode", render: (r) => <span className="capitalize text-sm">{r.paymentMode?.replace("_", " ")}</span> },
    { key: "bill", label: "Bill", render: (r) => r.billUrl ? (
      <a href={r.billUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-xs flex items-center gap-1"><Paperclip size={12} /> View</a>
    ) : <span className="text-xs text-gray-300">—</span> },
    { key: "actions", label: "", render: (r) => (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><Edit2 size={14} /></button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
      </div>
    ) },
  ];

  const totalPages = Math.ceil(total / 30);

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fadeIn">
        <PageHeader
          title="Dispatch Expenses"
          subtitle={`${total} record${total === 1 ? "" : "s"}`}
          actions={<Button onClick={openCreate}><Plus size={15} /> Add Expense</Button>}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total (filtered)" value={fmtMoney(totalAmount)} icon={Wallet} color="accent" />
        </div>

        <div className="flex flex-wrap gap-3 bg-white border border-gray-100 rounded-2xl p-4">
          <Select value={filters.category} onChange={(e) => handleFilter("category", e.target.value)} options={categoryOptions} />
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 whitespace-nowrap">From</label>
            <input type="date" value={filters.dateFrom} onChange={(e) => handleFilter("dateFrom", e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 whitespace-nowrap">To</label>
            <input type="date" value={filters.dateTo} onChange={(e) => handleFilter("dateTo", e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={filters.hasNoBill === "true"} onChange={(e) => handleFilter("hasNoBill", e.target.checked ? "true" : "")} />
            Missing bill only
          </label>
        </div>

        {loading ? <EmptyState title="Loading expenses..." /> : (
          <DataTable columns={columns} data={expenses} emptyMessage="No expense records found" />
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">Previous</button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Expense" : "Add Expense"} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input type="date" label="Expense Date" value={form.expenseDate} onChange={(e) => setForm((f) => ({ ...f, expenseDate: e.target.value }))} />
          <Select label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} options={categories.map((c) => ({ value: c, label: c }))} />
          <Input label="Item *" value={form.item} onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))} className="md:col-span-2" />
          <Input type="number" label="Quantity" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
          <Input type="number" label="Unit Price (₹)" value={form.unitPrice} onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))} />
          <Input type="number" label="Total (auto if blank)" value={form.total} onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))} />
          <Select label="Payment Mode" value={form.paymentMode} onChange={(e) => setForm((f) => ({ ...f, paymentMode: e.target.value }))} options={PAYMENT_MODES} />
          <Input label="Vendor" value={form.vendor} onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))} />
          <Input label="Bill Number" value={form.billNumber} onChange={(e) => setForm((f) => ({ ...f, billNumber: e.target.value }))} />
          <Input label="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="md:col-span-2" />
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-600 mb-1 block">Bill / Receipt Upload</label>
            <input type="file" accept="image/*,.pdf" onChange={(e) => setForm((f) => ({ ...f, bill: e.target.files[0] }))} className="text-sm" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSave}>{editingId ? "Save Changes" : "Add Expense"}</Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
