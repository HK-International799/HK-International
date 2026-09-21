import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import MainLayout from "../../components/layout/MainLayout";
import SEO from "../../components/SEO";
import { useAuth } from "../../contexts/AuthContext";
import { resetPassword, validateResetToken } from "../../services/authService";

const inputClass =
  "w-full border rounded-lg pl-10 pr-10 py-3 focus:ring-2 focus:ring-indigo-500 outline-none";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // "validating" → checking the link | "ready" → show form
  // "invalid" → expired / used / bad link | "success" → password changed
  const [status, setStatus] = useState("validating");
  const [linkError, setLinkError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check the link up-front so an expired link is reported immediately,
  // not after the user has typed a new password.
  useEffect(() => {
    let cancelled = false;

    validateResetToken(token)
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setLinkError(
          err.message ||
            "Invalid or expired password reset link. Please request a new one.",
        );
        setStatus("invalid");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  // After a successful reset, send the user to the login page.
  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => navigate("/login", { replace: true }), 3500);
    return () => clearTimeout(timer);
  }, [status, navigate]);

  const passwordChecks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "Contains an uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Contains a lowercase letter", valid: /[a-z]/.test(password) },
    { label: "Contains a number", valid: /\d/.test(password) },
    {
      label: "Contains a special character",
      valid: /[^A-Za-z0-9]/.test(password),
    },
    {
      label: "Passwords match",
      valid: confirmPassword.length > 0 && password === confirmPassword,
    },
  ];
  const allChecksPass = passwordChecks.every((c) => c.valid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!allChecksPass) {
      setError("Please meet all the password requirements");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, password, confirmPassword });
      // Drop any session that may still be open in this browser.
      logout();
      toast.success("Password reset successfully");
      setStatus("success");
    } catch (err) {
      const message =
        err.message || "Failed to reset password. Please try again.";

      // The link itself became unusable (expired / already used).
      if (/invalid or expired/i.test(message)) {
        setLinkError(message);
        setStatus("invalid");
      } else {
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <SEO
        title="Reset Password | 1A HK International LMS"
        description="Choose a new password for your 1A HK International LMS account."
        url="https://hkinternational.uk/reset-password"
        noIndex={true}
      />
      {/* The token lives in the URL — stop it leaking via the Referer header. */}
      <meta name="referrer" content="no-referrer" />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
        >
          {/* ── Checking link ───────────────────────────────────────── */}
          {status === "validating" && (
            <div className="text-center py-10" role="status">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-indigo-500" />
              <p className="text-gray-500 mt-4">Verifying your reset link...</p>
            </div>
          )}

          {/* ── Invalid / expired link ──────────────────────────────── */}
          {status === "invalid" && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="text-red-600" />
              </div>

              <h3 className="text-2xl font-bold mt-4">Link not valid</h3>
              <p className="text-gray-500 mt-2">{linkError}</p>

              <Link
                to="/forgot-password"
                className="inline-block mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
              >
                Request a New Link
              </Link>

              <div className="mt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-indigo-600 font-medium"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </div>
            </motion.div>
          )}

          {/* ── Success ─────────────────────────────────────────────── */}
          {status === "success" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="text-green-600" />
              </div>

              <h3 className="text-2xl font-bold mt-4">Password Reset</h3>
              <p className="text-gray-500 mt-2">
                Your password has been changed. You can now log in with your new
                password.
              </p>

              <Link
                to="/login"
                className="inline-block mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
              >
                Go to Login
              </Link>
            </motion.div>
          )}

          {/* ── Reset form ──────────────────────────────────────────── */}
          {status === "ready" && (
            <>
              <h2 className="text-3xl font-bold text-gray-800">
                Reset Password
              </h2>
              <p className="text-gray-500 mt-2">
                Choose a strong new password for your account.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                {/* New password */}
                <div>
                  <label
                    htmlFor="reset-password"
                    className="text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="reset-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      maxLength={72}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className={inputClass}
                    />
                    <Lock
                      size={18}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-indigo-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="reset-confirm-password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="reset-confirm-password"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      maxLength={72}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className={inputClass}
                    />
                    <ShieldCheck
                      size={18}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      aria-label={
                        showConfirm ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-indigo-600"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Strength checklist */}
                {(password.length > 0 || confirmPassword.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      PASSWORD REQUIREMENTS
                    </p>
                    <div className="space-y-1.5">
                      {passwordChecks.map((check) => (
                        <div key={check.label} className="flex items-center gap-2">
                          {check.valid ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />
                          )}
                          <span
                            className={`text-xs ${
                              check.valid ? "text-green-600" : "text-gray-500"
                            }`}
                          >
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !allChecksPass}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-indigo-600 font-medium"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}
