import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { PageHeader, Button, Input, Textarea } from "../../components/ui";
import { getSettings, upsertSetting, bulkUpdateSettings } from "../../services/settingsService";
import { Settings as SettingsIcon, Globe, Mail, CreditCard, Bell, Palette, Save, Plus, Trash2 } from "lucide-react";

const categories = [
  { key: "general", label: "General", icon: Globe, desc: "Platform name, timezone, and basic settings" },
  { key: "email", label: "Email", icon: Mail, desc: "SMTP configuration and email templates" },
  { key: "payment", label: "Payment", icon: CreditCard, desc: "Payment gateway and pricing settings" },
  { key: "notification", label: "Notifications", icon: Bell, desc: "Push & email notification preferences" },
  { key: "branding", label: "Branding", icon: Palette, desc: "Logo, colors, and appearance" },
];

const defaultSettings = {
  general: [
    { key: "platform_name", value: "LMS Platform", description: "Platform display name" },
    { key: "platform_url", value: "https://lms.example.com", description: "Platform URL" },
    { key: "timezone", value: "Asia/Kolkata", description: "Default timezone" },
    { key: "max_upload_size", value: "10", description: "Max upload size in MB" },
  ],
  email: [
    { key: "smtp_host", value: "smtp.gmail.com", description: "SMTP Host" },
    { key: "smtp_port", value: "587", description: "SMTP Port" },
    { key: "smtp_user", value: "", description: "SMTP Username" },
    { key: "from_email", value: "noreply@lms.com", description: "From email address" },
  ],
  payment: [
    { key: "currency", value: "INR", description: "Default currency" },
    { key: "stripe_enabled", value: "true", description: "Enable Stripe payments" },
    { key: "tax_rate", value: "18", description: "Tax rate percentage" },
  ],
  notification: [
    { key: "email_on_enroll", value: "true", description: "Email on new enrollment" },
    { key: "email_on_submission", value: "true", description: "Email on assignment submission" },
    { key: "email_on_grade", value: "true", description: "Email when graded" },
  ],
  branding: [
    { key: "primary_color", value: "#6366f1", description: "Primary brand color" },
    { key: "logo_url", value: "", description: "Logo URL" },
    { key: "favicon_url", value: "", description: "Favicon URL" },
  ],
};

export default function Settings() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await getSettings();
      const grouped = {};
      (Array.isArray(data) ? data : []).forEach((s) => {
        if (!grouped[s.category]) grouped[s.category] = [];
        grouped[s.category].push(s);
      });
      // Merge with defaults
      const merged = {};
      for (const cat of Object.keys(defaultSettings)) {
        merged[cat] = defaultSettings[cat].map((def) => {
          const existing = grouped[cat]?.find((s) => s.key === def.key);
          return existing || { ...def, category: cat };
        });
      }
      setSettings(merged);
    } catch {
      setSettings(defaultSettings);
    }
  };

  const updateSettingValue = (cat, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [cat]: prev[cat].map((s) => s.key === key ? { ...s, value } : s),
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const toSave = (settings[activeCategory] || []).map((s) => ({
        key: s.key, value: s.value, category: activeCategory,
      }));
      await bulkUpdateSettings(toSave);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Error saving settings");
    }
    setSaving(false);
  };

  const activeCat = categories.find((c) => c.key === activeCategory);
  const activeSettings = settings[activeCategory] || [];

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        <PageHeader title="Settings" subtitle="Configure your LMS platform" />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Category Nav */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {categories.map((cat) => (
                <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm transition-all border-l-2 ${
                    activeCategory === cat.key
                      ? "bg-primary/5 border-primary text-primary font-medium"
                      : "border-transparent text-gray-600 hover:bg-gray-50"
                  }`}>
                  <cat.icon size={18} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Form */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    {activeCat && <activeCat.icon size={20} className="text-primary" />}
                    {activeCat?.label} Settings
                  </h3>
                  <p className="text-sm text-gray-400 mt-0.5">{activeCat?.desc}</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="relative">
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Save size={16} /> Save Changes</>
                  )}
                </Button>
              </div>

              {saved && (
                <div className="mb-4 px-4 py-3 bg-success/10 border border-success/20 text-success text-sm rounded-xl animate-fadeIn">
                  Settings saved successfully!
                </div>
              )}

              <div className="space-y-5">
                {activeSettings.map((setting) => (
                  <div key={setting.key} className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {setting.description || setting.key}
                    </label>
                    <p className="text-xs text-gray-400 mb-1.5 font-mono">{setting.key}</p>
                    {setting.value === "true" || setting.value === "false" ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateSettingValue(activeCategory, setting.key, setting.value === "true" ? "false" : "true")}
                          className={`relative w-11 h-6 rounded-full transition-colors ${setting.value === "true" ? "bg-primary" : "bg-gray-300"}`}>
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${setting.value === "true" ? "translate-x-5.5" : "translate-x-0.5"}`} />
                        </button>
                        <span className="text-sm text-gray-600">{setting.value === "true" ? "Enabled" : "Disabled"}</span>
                      </div>
                    ) : setting.key.includes("color") ? (
                      <div className="flex items-center gap-3">
                        <input type="color" value={setting.value}
                          onChange={(e) => updateSettingValue(activeCategory, setting.key, e.target.value)}
                          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                        <input type="text" value={setting.value}
                          onChange={(e) => updateSettingValue(activeCategory, setting.key, e.target.value)}
                          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm w-32 font-mono" />
                      </div>
                    ) : (
                      <input type="text" value={setting.value}
                        onChange={(e) => updateSettingValue(activeCategory, setting.key, e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
