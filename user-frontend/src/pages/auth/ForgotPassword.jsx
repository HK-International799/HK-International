// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";
// import { Mail, ArrowLeft } from "lucide-react";
// import MainLayout from "../../components/layout/MainLayout";

// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [sent, setSent] = useState(false);

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // later call API
//     // axios.post("/auth/forgot-password",{email})

//     setSent(true);
//   };

//   return (
//     <MainLayout>
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-6">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
//         >
//           {!sent ? (
//             <>
//               <h2 className="text-3xl font-bold text-gray-800">
//                 Forgot Password?
//               </h2>

//               <p className="text-gray-500 mt-2">
//                 Please contact to the Developer <b>Anurag Pandey</b>
//                 <br />
//                 Email : anurag.p@hkinternational.uk <br />
//                 Mo. : +91 - 7991845638
//               </p>
//               {/* <p className="text-gray-500 mt-2">
//                 Enter your registered email and we'll send you a password reset
//                 link.
//               </p> */}

//               {/* <form onSubmit={handleSubmit} className="mt-6 space-y-5">
//                 <div>
//                   <label className="text-sm font-medium text-gray-700">
//                     Email Address
//                   </label>

//                   <div className="relative mt-1">
//                     <input
//                       type="email"
//                       required
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       placeholder="[email protected]"
//                       className="w-full border rounded-lg px-10 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
//                     />

//                     <Mail
//                       size={18}
//                       className="absolute left-3 top-3.5 text-gray-400"
//                     />
//                   </div>
//                 </div>

//                 <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
//                   Send Reset Link
//                 </button>
//               </form> */}

//               <div className="mt-6 text-center">
//                 <Link
//                   to="/login"
//                   className="flex items-center justify-center gap-2 text-indigo-600 font-medium"
//                 >
//                   <ArrowLeft size={16} />
//                   Back to Login
//                 </Link>
//               </div>
//             </>
//           ) : (
//             <motion.div
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ duration: 0.5 }}
//               className="text-center"
//             >
//               <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
//                 <Mail className="text-green-600" />
//               </div>

//               <h3 className="text-2xl font-bold mt-4">Check Your Email</h3>

//               <p className="text-gray-500 mt-2">
//                 We have sent a password reset link to
//                 <br />
//                 <span className="font-semibold">{email}</span>
//               </p>

//               <Link
//                 to="/login"
//                 className="inline-block mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
//               >
//                 Back to Login
//               </Link>
//             </motion.div>
//           )}
//         </motion.div>
//       </div>
//     </MainLayout>
//   );
// }




import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import MainLayout from "../../components/layout/MainLayout";
import SEO from "../../components/SEO";
import { forgotPassword } from "../../services/authService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      // The API always answers with the same generic message, so the UI
      // never reveals whether the email is registered.
      await forgotPassword(cleanEmail);
      setEmail(cleanEmail);
      setSent(true);
    } catch (err) {
      const message = err.message || "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <SEO
        title="Forgot Password | 1A HK International LMS"
        description="Reset your 1A HK International LMS password."
        url="https://hkinternational.uk/forgot-password"
        noIndex={true}
      />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
        >
          {!sent ? (
            <>
              <h2 className="text-3xl font-bold text-gray-800">
                Forgot Password?
              </h2>

              <p className="text-gray-500 mt-2">
                Enter your registered email and we'll send you a password reset
                link.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>

                  <div className="relative mt-1">
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border rounded-lg px-10 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />

                    <Mail
                      size={18}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="mt-4 text-xs text-gray-400 text-center">
                Still can't access your account? Contact us at
                <br />
                info@hkinternational.uk
              </p>

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
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="text-green-600" />
              </div>

              <h3 className="text-2xl font-bold mt-4">Check Your Email</h3>

              <p className="text-gray-500 mt-2">
                If an account exists for
                <br />
                <span className="font-semibold break-all">{email}</span>
                <br />a password reset link has been sent.
              </p>

              <p className="text-gray-400 text-sm mt-3">
                The link expires in 15 minutes. Don't see it? Check your spam
                folder.
              </p>

              <Link
                to="/login"
                className="inline-block mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
              >
                Back to Login
              </Link>

              <button
                type="button"
                onClick={() => setSent(false)}
                className="block mx-auto mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Use a different email
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}
