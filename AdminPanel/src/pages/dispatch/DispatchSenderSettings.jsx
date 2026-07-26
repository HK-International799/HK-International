import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, Button, Input, EmptyState } from "../../components/ui";
import { getSenderSettings, updateSenderSettings } from "../../services/dispatchService";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { Building2, Save } from "lucide-react";

const FIELDS = [
  ["name", "Sender Name"],
  ["careOf", "Care Of"],
  ["addressLine1", "Address Line 1"],
  ["addressLine2", "Address Line 2"],
  ["area", "Area"],
  ["landmark", "Landmark"],
  ["city", "City"],
  ["state", "State"],
  ["pinCode", "PIN Code"],
  ["country", "Country"],
  ["mobile", "Mobile"],
  ["email", "Email"],
  ["website", "Website"],
];

export default function DispatchSenderSettings() {
  const { user } = useAdminAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSenderSettings().then((d) => setForm(d.data || d)).catch(console.error);
  }, []);

  const isSuperAdmin = user?.role === "super_admin";

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSenderSettings(form);
      alert("Sender settings updated");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update sender settings");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <AdminLayout><EmptyState title="Loading sender settings..." /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-5 animate-fadeIn">
        <PageHeader
          title="Dispatch Sender Settings"
          subtitle="Fixed return address auto-filled on every certificate dispatch"
        />

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={16} className="text-indigo-600" />
            <p className="text-sm font-semibold text-gray-700">Sender Address</p>
          </div>

          {!isSuperAdmin && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
              Only a Super Admin can edit sender settings. You're viewing in read-only mode.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FIELDS.map(([key, label]) => (
              <Input
                key={key}
                label={label}
                value={form[key] || ""}
                disabled={!isSuperAdmin}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            ))}
            <Input label="Courier (fixed)" value="India Post - Speed Post" disabled />
          </div>

          {isSuperAdmin && (
            <div className="flex justify-end pt-4">
              <Button loading={saving} onClick={handleSave}><Save size={15} /> Save Changes</Button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
