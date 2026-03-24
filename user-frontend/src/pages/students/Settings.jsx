import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings as SettingsIcon,
  Lock,
  Bell,
  Palette,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  User,
  LogOut,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import { changePassword } from "../../services/studentService";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("password");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifSettings, setNotifSettings] = useState({
    email: true,
    assignments: true,
    grades: true,
    messages: true,
    announcements: true,
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordForm.newPassword.length < 8) {
      return setError("New password must be at least 8 characters");
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setError("Passwords do not match");
    }

    setSubmitting(true);
    try {
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess("Password changed successfully!");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const sections = [
    { key: "password", label: "Change password", icon: Lock },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "appearance", label: "Appearance", icon: Palette },
    { key: "privacy", label: "Privacy & security", icon: Shield },
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-orange-500" />
            Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your account preferences
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* User Card */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav className="p-2">
                {sections.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      activeSection === key
                        ? "bg-orange-50 text-orange-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}

                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {activeSection === "password" && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="p-5 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-gray-400" />
                      Change password
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Keep your account secure by using a strong password
                    </p>
                  </div>

                  <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
                    <AnimatePresence>
                      {success && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {success}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Old password */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                        Current password
                      </label>
                      <div className="relative">
                        <input
                          type={showOld ? "text" : "password"}
                          value={passwordForm.oldPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                          className="w-full px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
                          placeholder="Enter current password"
                          required
                        />
                        <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New password */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                        New password
                      </label>
                      <div className="relative">
                        <input
                          type={showNew ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
                          placeholder="Enter new password (min 8 characters)"
                          required
                          minLength={8}
                        />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordForm.newPassword.length > 0 && passwordForm.newPassword.length < 8 && (
                        <p className="text-xs text-red-500 mt-1">Password must be at least 8 characters</p>
                      )}
                    </div>

                    {/* Confirm */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                        Confirm new password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full px-4 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition"
                          placeholder="Confirm new password"
                          required
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                      )}
                    </div>

                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                    )}

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={submitting}
                      className="flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-60 shadow-sm"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                      {submitting ? "Changing..." : "Change password"}
                    </motion.button>
                  </form>
                </motion.div>
              )}

              {activeSection === "notifications" && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="p-5 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-gray-400" />
                      Notification preferences
                    </h2>
                  </div>
                  <div className="p-5 divide-y divide-gray-50">
                    {[
                      { key: "email", label: "Email notifications", desc: "Receive updates via email" },
                      { key: "assignments", label: "New assignments", desc: "When a tutor posts a new assignment" },
                      { key: "grades", label: "Grade updates", desc: "When your work is graded" },
                      { key: "messages", label: "Messages", desc: "New chat messages" },
                      { key: "announcements", label: "Announcements", desc: "Platform and course announcements" },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifSettings((p) => ({ ...p, [key]: !p[key] }))}
                          className={`w-10 h-6 rounded-full transition-colors relative ${
                            notifSettings[key] ? "bg-orange-500" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                              notifSettings[key] ? "left-[18px]" : "left-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeSection === "appearance" && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                >
                  <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5 text-gray-400" />
                    Appearance
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">Customize how the platform looks</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-4 rounded-xl border-2 border-orange-400 bg-white text-center">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-800">Light</p>
                    </button>
                    <button className="p-4 rounded-xl border border-gray-200 bg-gray-900 text-center opacity-50 cursor-not-allowed">
                      <div className="w-8 h-8 rounded-lg bg-gray-700 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-300">Dark (soon)</p>
                    </button>
                  </div>
                </motion.div>
              )}

              {activeSection === "privacy" && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                >
                  <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-gray-400" />
                    Privacy & security
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <p className="text-sm font-semibold text-green-700">Account is secure</p>
                      </div>
                      <p className="text-xs text-green-600 mt-1 ml-7">
                        Your password was last changed recently. Keep it strong and unique.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200">
                      <p className="text-sm font-semibold text-gray-800">Active sessions</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        You are currently logged in on this device.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-200">
                      <p className="text-sm font-semibold text-gray-800">Data & privacy</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Your data is securely stored and never shared with third parties.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
