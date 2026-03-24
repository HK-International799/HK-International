

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Award,
  FileText,
  Edit3,
  Save,
  X,
  Loader2,
  Calendar,
  Shield,
  Camera,
} from "lucide-react";
import { getProfile, updateProfile } from "../../services/studentService";
import { useAuth } from "../../contexts/AuthContext";
import MainLayout from "../../components/layout/MainLayout";

export default function Profile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "" });
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setForm({ name: data.name, mobile: data.mobile || "" });
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await updateProfile({
        name: form.name.trim(),
        mobile: form.mobile,
      });
      setProfile((prev) => ({
        ...prev,
        ...result.student,
      }));
      setEditing(false);
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 pb-12">
          <div className="max-w-3xl">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-6 mb-8">
                <Skeleton className="w-24 h-24 rounded-2xl" />
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 pb-12">
        <div className="max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              My Profile
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage your personal information
            </p>
          </div>

          {/* Success Message */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm"
            >
              {successMsg}
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between"
            >
              {error}
              <button onClick={() => setError(null)}>
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-indigo-600 via-indigo-500 to-orange-500 relative">
              <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-orange-400 flex items-center justify-center text-white text-3xl font-bold">
                      {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              </div>

              {/* Edit button */}
              <div className="absolute top-4 right-4">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur text-white text-sm font-medium hover:bg-white/30 transition"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(false);
                        setForm({
                          name: profile?.name || "",
                          mobile: profile?.mobile || "",
                        });
                      }}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/20 backdrop-blur text-white text-sm hover:bg-white/30 transition"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white text-indigo-700 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-60"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="pt-16 px-8 pb-8">
              <div className="mb-6">
                {editing ? (
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="text-xl font-bold text-gray-900 border-b-2 border-orange-500 bg-transparent focus:outline-none pb-1 w-full"
                    placeholder="Your name"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-gray-900">
                    {profile?.name}
                  </h2>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-sm text-indigo-600 font-medium capitalize">
                    {profile?.role}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                  <div className="p-2.5 rounded-lg bg-blue-100">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Email Address</p>
                    <p className="text-sm text-gray-800 font-medium">
                      {profile?.email}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                  <div className="p-2.5 rounded-lg bg-green-100">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-medium">Mobile Number</p>
                    {editing ? (
                      <input
                        type="text"
                        value={form.mobile}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, mobile: e.target.value }))
                        }
                        className="text-sm text-gray-800 font-medium border-b border-orange-400 bg-transparent focus:outline-none w-full"
                        placeholder="Your mobile number"
                      />
                    ) : (
                      <p className="text-sm text-gray-800 font-medium">
                        {profile?.mobile || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Member since */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                  <div className="p-2.5 rounded-lg bg-purple-100">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Member Since</p>
                    <p className="text-sm text-gray-800 font-medium">
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              {profile?.stats && (
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
                  <div className="text-center p-4 rounded-xl bg-blue-50">
                    <BookOpen className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {profile.stats.enrolledCourses}
                    </p>
                    <p className="text-xs text-gray-500">Courses</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-green-50">
                    <FileText className="w-5 h-5 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {profile.stats.totalSubmissions}
                    </p>
                    <p className="text-xs text-gray-500">Submissions</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-yellow-50">
                    <Award className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {profile.stats.certificates}
                    </p>
                    <p className="text-xs text-gray-500">Certificates</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
