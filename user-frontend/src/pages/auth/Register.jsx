// import { useEffect, useState } from "react";
// import MainLayout from "../../components/layout/MainLayout";
// import {
//   CheckCircle2,
//   ChevronLeft,
//   ChevronRight,
//   UploadCloud,
//   FileText,
//   Loader2,
//   Copy,
// } from "lucide-react";
// import {
//   getRegistrationCourses,
//   submitRegistration,
//   uploadRegistrationDocuments,
// } from "../../services/registrationService";
// import SEO from "../../components/SEO";

// const STEPS = [
//   "Personal Information",
//   "Course Registration",
//   "Document Verification",
//   "Review & Submit",
// ];

// const ALLOWED_TYPES = [
//   "image/jpeg",
//   "image/jpg",
//   "image/png",
//   "image/webp",
//   "application/pdf",
// ];
// const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// const inputClass =
//   "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm";
// const labelClass = "block text-sm font-medium text-gray-700 mb-1";

// export default function LearnerRegistration() {
//   const [step, setStep] = useState(0);
//   const [courses, setCourses] = useState([]);
//   const [loadingCourses, setLoadingCourses] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [result, setResult] = useState(null);
//   const [copyMessage, setCopyMessage] = useState("");

//   const [declarationAccepted, setDeclarationAccepted] = useState(false);

//   const copyCredentials = async () => {
//     if (!result?.credentials) return;

//     await navigator.clipboard.writeText(
//       `Email: ${result.credentials.email}
//     Password: ${result.credentials.password}`,
//     );

//     setCopyMessage("✅ Credentials copied successfully");

//     setTimeout(() => {
//       setCopyMessage("");
//     }, 2500);
//   };

//   const [form, setForm] = useState({
//     firstName: "",
//     middleName: "",
//     lastName: "",
//     dob: "",
//     email: "",
//     countryCode: "+91",
//     mobile: "",
//     // Structured postal address (Registration Requirement 2) — this is the
//     // candidate's official postal / certificate-delivery address.
//     addressLine1: "",
//     addressLine2: "",
//     city: "",
//     state: "",
//     postalCode: "",
//     country: "",
//     // Registration Requirement 3: multiple course selection. The first
//     // selected course is treated as the primary course for batch selection.
//     courseIds: [],
//     batchId: "",
//     preferredIntake: "",
//   });

//   const [governmentId, setGovernmentId] = useState(null);
//   const [additionalFiles, setAdditionalFiles] = useState([]);
//   const [fileError, setFileError] = useState("");

//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await getRegistrationCourses();
//         setCourses(data);
//       } catch {
//         setCourses([]);
//       } finally {
//         setLoadingCourses(false);
//       }
//     })();
//   }, []);

//   // Primary course = first one the candidate selected. Used for batch
//   // selection; all selections are preserved in form.courseIds.
//   const selectedCourse = courses.find((c) => c._id === form.courseIds[0]);
//   const selectedCourses = courses.filter((c) => form.courseIds.includes(c._id));

//   const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

//   const toggleCourse = (courseId) => {
//     setForm((f) => {
//       const isSelected = f.courseIds.includes(courseId);
//       const nextIds = isSelected
//         ? f.courseIds.filter((id) => id !== courseId)
//         : [...f.courseIds, courseId];
//       return {
//         ...f,
//         courseIds: nextIds,
//         // Clear the batch choice if the primary (first-selected) course changed.
//         batchId: nextIds[0] === f.courseIds[0] ? f.batchId : "",
//       };
//     });
//   };

//   const validateStep = () => {
//     setError("");
//     if (step === 0) {
//       const {
//         firstName,
//         lastName,
//         dob,
//         email,
//         countryCode,
//         mobile,
//         addressLine1,
//         city,
//         country,
//       } = form;
//       // middleName is intentionally optional.
//       if (
//         !firstName ||
//         !lastName ||
//         !dob ||
//         !email ||
//         !countryCode ||
//         !mobile ||
//         !addressLine1 ||
//         !city ||
//         !country
//       ) {
//         setError(
//           "Please fill in all personal information fields, including your postal address.",
//         );
//         return false;
//       }
//       if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//         setError("Please enter a valid email address.");
//         return false;
//       }
//       if (!/^[0-9]{6,15}$/.test(mobile)) {
//         setError("Please enter a valid mobile number (digits only).");
//         return false;
//       }
//     }
//     if (step === 1) {
//       if (!form.courseIds.length) {
//         setError("Please select at least one course.");
//         return false;
//       }
//     }
//     if (step === 2) {
//       if (!governmentId) {
//         setError("Government ID upload is required.");
//         return false;
//       }
//     }
//     if (step === 3) {
//       if (!declarationAccepted) {
//         setError(
//           "Please confirm that all the information provided is correct before submitting your registration.",
//         );
//         return false;
//       }
//     }
//     return true;
//   };

//   const handleFile = (file, isAdditional = false) => {
//     setFileError("");
//     if (!file) return;
//     if (!ALLOWED_TYPES.includes(file.type)) {
//       setFileError("Only JPG, PNG, WEBP, and PDF files are supported.");
//       return;
//     }
//     if (file.size > MAX_SIZE) {
//       setFileError("Each file must be 5MB or smaller.");
//       return;
//     }
//     if (isAdditional) {
//       setAdditionalFiles((prev) => [...prev, file]);
//     } else {
//       setGovernmentId(file);
//     }
//   };

//   const goNext = () => {
//     if (!validateStep()) return;
//     setStep((s) => Math.min(s + 1, STEPS.length - 1));
//   };
//   const goBack = () => setStep((s) => Math.max(s - 1, 0));

//   const handleSubmit = async () => {
//     if (!validateStep()) return;

//     setSubmitting(true);
//     setError("");

//     try {
//       const payload = {
//         ...form,
//         // Backend accepts either `courseIds` (this flow) or a legacy single
//         // `courseId` — send both so nothing downstream that still expects
//         // `courseId` breaks. `confirmed` persists the declaration checkbox
//         // server-side; the backend independently re-validates it rather
//         // than trusting this client-side flag alone.
//         courseId: form.courseIds[0] || "",
//         confirmed: declarationAccepted,
//       };
//       const res = await submitRegistration(payload);

//       const registrationId = res?.registrationId || res?.data?.registrationId;

//       const fd = new FormData();

//       if (governmentId) {
//         fd.append("governmentId", governmentId);
//       }

//       additionalFiles.forEach((file) => {
//         fd.append("additional", file);
//       });

//       await uploadRegistrationDocuments(registrationId, fd);

//       setResult({
//         registrationId,

//         isNewUser: res?.isNewUser ?? res?.data?.isNewUser,

//         credentials: res?.credentials ?? res?.data?.credentials,
//       });
//     } catch (err) {
//       setError(
//         err?.response?.data?.message || err?.message || "Registration failed",
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (result) {
//     return (
//       <MainLayout>
//         <SEO
//           title="Registration Submitted | 1A HK International"
//           description="Your learner registration has been submitted successfully."
//           url="https://hkinternational.uk/learner-registration"
//           noIndex={true}
//         />
//         <div className="min-h-[80vh] flex justify-center items-center px-5">
//           <div className="bg-white shadow-xl rounded-3xl p-10 max-w-xl w-full text-center">
//             <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />

//             <h2 className="text-2xl font-bold text-gray-800">
//               Registration Submitted!
//             </h2>

//             <p className="text-gray-500 mt-3">
//               Thank you. Your registration has been received and is now pending
//               payment verification and admin approval. We'll notify you once
//               approved.
//             </p>

//             {result.isNewUser && result.credentials && (
//               <div className="mt-8">
//                 <div className="rounded-xl bg-gray-50 border p-6">
//                   <h3 className="font-semibold text-lg mb-6">
//                     Your Login Credentials
//                   </h3>

//                   <div className="text-left space-y-5">
//                     <div>
//                       <div className="text-xs text-gray-400">Email</div>

//                       <div className="font-semibold">
//                         {result.credentials.email}
//                       </div>
//                     </div>

//                     <div>
//                       <div className="text-xs text-gray-400">
//                         Temporary Password
//                       </div>

//                       <div className="font-semibold">
//                         {result.credentials.password}
//                       </div>
//                     </div>
//                   </div>

//                   <button
//                     onClick={copyCredentials}
//                     className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl "
//                   >
//                     <Copy size={18} />
//                     Copy Credentials
//                   </button>
//                   {copyMessage && (
//                     <div className="mt-3 text-sm font-medium text-green-600">
//                       {copyMessage}
//                     </div>
//                   )}

//                   <p className="text-red-500 text-xs mt-5">
//                     Save these credentials. Login becomes available after admin
//                     approval.
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   return (
//     <MainLayout>
//       {/* This is a hidden, unlinked self-registration URL shared only with
//           specific learners — it must never be indexed or appear in search
//           results, so noIndex is hardcoded true (not tied to any prop). */}
//       <SEO
//         title="Learner Registration | 1A HK International"
//         description="Register for your accredited HSE course with 1A HK International."
//         url="https://hkinternational.uk/learner-registration"
//         noIndex={true}
//       />
//       <div className="max-w-3xl mx-auto px-4 py-10">
//         <h1 className="text-3xl font-bold text-gray-800 text-center">
//           Learner Registration
//         </h1>
//         <p className="text-gray-500 text-center mt-2">
//           Complete the steps below to register for a course.
//         </p>
//         <div className="mt-5 mb-8 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5">
//           <h3 className="text-lg font-semibold text-amber-800">
//             ⚠️ Important Registration Notice
//           </h3>

//           <p className="mt-3 text-sm leading-6 text-gray-700">
//             Please complete this registration form carefully. All information
//             entered will be used for your learner profile, official records, and
//             certificate printing.
//           </p>

//           <ul className="mt-4 space-y-2 text-sm text-gray-700 list-disc list-inside">
//             <li>
//               Enter your{" "}
//               <strong>
//                 full name exactly as it appears on your Passport, National ID,
//                 or Government-issued Identification.
//               </strong>
//             </li>

//             <li>
//               Carefully verify the spelling of your first name and last name
//               before proceeding.
//             </li>

//             <li>
//               Ensure your email address, mobile number, date of birth, and other
//               personal details are accurate.
//             </li>

//             <li>
//               Certificates will be issued using the information provided during
//               registration.
//             </li>

//             <li>
//               Incorrect information may result in delays, additional
//               administrative charges, or certificate reissuance fees.
//             </li>
//           </ul>

//           <div className="mt-4 rounded-lg bg-red-100 border border-red-300 p-3">
//             <p className="text-sm font-semibold text-red-700">
//               1A HK International will not be responsible for any spelling
//               mistakes, incorrect personal information, or certificate errors
//               caused by incorrect details submitted by the candidate. The
//               candidate is solely responsible for verifying all information
//               before submitting the registration form.
//             </p>
//           </div>
//         </div>
//         {/* Step indicator */}
//         <div className="flex items-center justify-between mt-8 mb-10">
//           {STEPS.map((label, i) => (
//             <div
//               key={label}
//               className="flex-1 flex flex-col items-center text-center"
//             >
//               <div
//                 className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
//                   i <= step
//                     ? "bg-indigo-600 text-white"
//                     : "bg-gray-200 text-gray-500"
//                 }`}
//               >
//                 {i + 1}
//               </div>
//               <span
//                 className={`text-xs mt-2 ${i === step ? "text-indigo-600 font-medium" : "text-gray-400"}`}
//               >
//                 {label}
//               </span>
//             </div>
//           ))}
//         </div>

//         <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
//           {error && (
//             <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
//               {error}
//             </div>
//           )}

//           {step === 0 && (
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//               <div>
//                 <label className={labelClass}>First Name</label>
//                 <input
//                   className={inputClass}
//                   value={form.firstName}
//                   onChange={(e) => update("firstName", e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Last Name</label>
//                 <input
//                   className={inputClass}
//                   value={form.lastName}
//                   onChange={(e) => update("lastName", e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Middle Name (optional)</label>
//                 <input
//                   className={inputClass}
//                   value={form.middleName}
//                   onChange={(e) => update("middleName", e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Date of Birth</label>
//                 <input
//                   type="date"
//                   className={inputClass}
//                   value={form.dob}
//                   onChange={(e) => update("dob", e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Email</label>
//                 <input
//                   type="email"
//                   className={inputClass}
//                   value={form.email}
//                   onChange={(e) => update("email", e.target.value)}
//                 />
//               </div>
//               <div className="grid grid-cols-3 gap-2">
//                 <div>
//                   <label className={labelClass}>Code</label>
//                   <input
//                     className={inputClass}
//                     value={form.countryCode}
//                     onChange={(e) => update("countryCode", e.target.value)}
//                   />
//                 </div>
//                 <div className="col-span-2">
//                   <label className={labelClass}>Mobile Number</label>
//                   <input
//                     className={inputClass}
//                     value={form.mobile}
//                     onChange={(e) => update("mobile", e.target.value)}
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className={labelClass}>Country</label>
//                 <input
//                   className={inputClass}
//                   value={form.country}
//                   onChange={(e) => update("country", e.target.value)}
//                 />
//               </div>
//               <div className="sm:col-span-2 pt-2">
//                 <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
//                   Official Postal / Certificate Delivery Address
//                 </p>
//                 <p className="text-xs text-gray-500 mb-3">
//                   Your certificate, if applicable, will be physically dispatched
//                   to this address — please double-check it.
//                 </p>
//               </div>
//               <div className="sm:col-span-2">
//                 <label className={labelClass}>Address Line 1</label>
//                 <input
//                   className={inputClass}
//                   value={form.addressLine1}
//                   onChange={(e) => update("addressLine1", e.target.value)}
//                 />
//               </div>
//               <div className="sm:col-span-2">
//                 <label className={labelClass}>Address Line 2 (optional)</label>
//                 <input
//                   className={inputClass}
//                   value={form.addressLine2}
//                   onChange={(e) => update("addressLine2", e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>City</label>
//                 <input
//                   className={inputClass}
//                   value={form.city}
//                   onChange={(e) => update("city", e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>State / Province / Region</label>
//                 <input
//                   className={inputClass}
//                   value={form.state}
//                   onChange={(e) => update("state", e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>Postal Code</label>
//                 <input
//                   className={inputClass}
//                   value={form.postalCode}
//                   onChange={(e) => update("postalCode", e.target.value)}
//                 />
//               </div>
//             </div>
//           )}

//           {step === 1 && (
//             <div className="space-y-5">
//               <div>
//                 <label className={labelClass}>
//                   Courses — select one or more you'd like to apply for
//                 </label>
//                 <p className="text-xs text-gray-500 mb-2">
//                   Selecting a course here is a request to enroll. Our team
//                   reviews your selection and confirms which course(s) you're
//                   actually enrolled into.
//                 </p>
//                 {loadingCourses ? (
//                   <p className="text-sm text-gray-400">Loading courses…</p>
//                 ) : (
//                   <div className="space-y-2 border border-gray-200 rounded-lg p-3 max-h-72 overflow-y-auto">
//                     {courses.map((c) => (
//                       <label
//                         key={c._id}
//                         className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer"
//                       >
//                         <input
//                           type="checkbox"
//                           className="h-4 w-4 accent-indigo-600"
//                           checked={form.courseIds.includes(c._id)}
//                           onChange={() => toggleCourse(c._id)}
//                         />
//                         <span className="text-sm text-gray-800">{c.title}</span>
//                       </label>
//                     ))}
//                     {!courses.length && (
//                       <p className="text-sm text-gray-400 px-2 py-1">
//                         No courses are currently open for registration.
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </div>
//               {selectedCourse && (
//                 <div>
//                   <label className={labelClass}>
//                     Batch for {selectedCourse.title} (optional)
//                   </label>
//                   <select
//                     className={inputClass}
//                     value={form.batchId}
//                     onChange={(e) => update("batchId", e.target.value)}
//                   >
//                     <option value="">No preference</option>
//                     {selectedCourse.batches?.map((b) => (
//                       <option key={b._id} value={b._id}>
//                         {b.name} ({b.seatsLeft} seats left)
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}
//               <div>
//                 <label className={labelClass}>Preferred Intake</label>
//                 <input
//                   className={inputClass}
//                   placeholder="e.g. January 2027"
//                   value={form.preferredIntake}
//                   onChange={(e) => update("preferredIntake", e.target.value)}
//                 />
//               </div>
//             </div>
//           )}

//           {step === 2 && (
//             <div className="space-y-6">
//               {fileError && <p className="text-sm text-red-600">{fileError}</p>}
//               <div>
//                 <label className={labelClass}>Government ID (required)</label>
//                 <UploadBox
//                   onFile={(f) => handleFile(f, false)}
//                   fileName={governmentId?.name}
//                 />
//               </div>
//               <div>
//                 <label className={labelClass}>
//                   Additional Documents (optional)
//                 </label>
//                 <UploadBox
//                   onFile={(f) => handleFile(f, true)}
//                   fileName={null}
//                 />
//                 {additionalFiles.length > 0 && (
//                   <ul className="mt-2 space-y-1">
//                     {additionalFiles.map((f, i) => (
//                       <li
//                         key={i}
//                         className="flex items-center gap-2 text-sm text-gray-600"
//                       >
//                         <FileText className="w-4 h-4" /> {f.name}
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>
//               <p className="text-xs text-gray-400">
//                 Accepted formats: JPG, PNG, WEBP, PDF. Max size 5MB per file.
//               </p>
//             </div>
//           )}

//           {step === 3 && (
//             <div className="space-y-6 text-sm">
//               <ReviewSection
//                 title="Personal Information"
//                 rows={[
//                   [
//                     "Name",
//                     [form.firstName, form.middleName, form.lastName]
//                       .filter(Boolean)
//                       .join(" "),
//                   ],
//                   ["Date of Birth", form.dob],
//                   ["Email", form.email],
//                   ["Mobile", `${form.countryCode} ${form.mobile}`],
//                   [
//                     "Postal Address",
//                     [
//                       form.addressLine1,
//                       form.addressLine2,
//                       form.city,
//                       form.state,
//                       form.postalCode,
//                     ]
//                       .filter(Boolean)
//                       .join(", "),
//                   ],
//                   ["Country", form.country],
//                 ]}
//               />
//               <ReviewSection
//                 title="Course Selection"
//                 rows={[
//                   [
//                     "Courses Requested",
//                     selectedCourses.map((c) => c.title).join(", ") || "—",
//                   ],
//                   [
//                     "Batch",
//                     selectedCourse?.batches?.find((b) => b._id === form.batchId)
//                       ?.name || "No preference",
//                   ],
//                   ["Preferred Intake", form.preferredIntake || "—"],
//                 ]}
//               />
//               <ReviewSection
//                 title="Uploaded Documents"
//                 rows={[
//                   ["Government ID", governmentId?.name || "Not uploaded"],
//                   [
//                     "Additional Documents",
//                     additionalFiles.length
//                       ? `${additionalFiles.length} file(s)`
//                       : "None",
//                   ],
//                 ]}
//               />

//               <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-5">
//                 <label className="flex items-start gap-3 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={declarationAccepted}
//                     onChange={(e) => setDeclarationAccepted(e.target.checked)}
//                     className="mt-1 h-5 w-5 accent-indigo-600"
//                   />

//                   <span className="text-sm leading-6 text-gray-700">
//                     <strong>Declaration:</strong> I confirm that all information
//                     provided by me is true, complete, and matches my official
//                     identification documents. I have carefully checked the
//                     spelling of my name and all personal details. I understand
//                     that my certificate will be issued exactly as per the
//                     information submitted during registration. I accept full
//                     responsibility for any mistakes, spelling errors, incorrect
//                     personal details, or certificate corrections resulting from
//                     inaccurate information provided by me. I understand that
//                     corrections after certificate issuance may not be possible
//                     or may be subject to additional administrative charges.
//                   </span>
//                 </label>
//               </div>
//             </div>
//           )}

//           {/* Navigation */}
//           <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
//             <button
//               type="button"
//               onClick={goBack}
//               disabled={step === 0 || submitting}
//               className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 disabled:opacity-40"
//             >
//               <ChevronLeft className="w-4 h-4" /> Back
//             </button>

//             {step < STEPS.length - 1 ? (
//               <button
//                 type="button"
//                 onClick={goNext}
//                 className="flex items-center gap-1 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
//               >
//                 Next <ChevronRight className="w-4 h-4" />
//               </button>
//             ) : (
//               <button
//                 type="button"
//                 onClick={handleSubmit}
//                 disabled={submitting}
//                 className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-60"
//               >
//                 {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
//                 Submit Registration
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// }

// function UploadBox({ onFile, fileName }) {
//   return (
//     <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-indigo-400 transition-colors">
//       <UploadCloud className="w-7 h-7 text-gray-400" />
//       <span className="text-sm text-gray-500">
//         {fileName || "Click to upload or drag a file here"}
//       </span>
//       <input
//         type="file"
//         accept=".jpg,.jpeg,.png,.webp,.pdf"
//         className="hidden"
//         onChange={(e) => onFile(e.target.files?.[0])}
//       />
//     </label>
//   );
// }

// function ReviewSection({ title, rows }) {
//   return (
//     <div>
//       <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
//       <div className="rounded-lg border border-gray-100 divide-y divide-gray-100">
//         {rows.map(([label, value]) => (
//           <div key={label} className="flex justify-between px-4 py-2">
//             <span className="text-gray-500">{label}</span>
//             <span className="text-gray-800 font-medium text-right">
//               {value}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }



import { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  FileText,
  Loader2,
  Copy,
  X,
} from "lucide-react";
import {
  getRegistrationCourses,
  submitRegistration,
  uploadRegistrationDocuments,
} from "../../services/registrationService";
import SEO from "../../components/SEO";

const STEPS = [
  "Personal Information",
  "Course Registration",
  "Document Verification",
  "Review & Submit",
];

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const inputClass =
  "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

// ── Full Terms & Conditions / Learner Code of Conduct / No-Refund Policy ──
const TERMS_SECTIONS = [
  {
    title: "1. Registration and Learner Information",
    points: [
      "The learner must provide complete, accurate and genuine information during registration.",
      "The learner must provide their correct legal name, email address, telephone number, address and any other information requested by the Organisation.",
      "The Organisation may request identity documents, photographs, educational documents, employment details or other information for registration, assessment and certification purposes.",
      "The learner is responsible for checking all information before submitting the registration form.",
      "If the learner provides false, incomplete, misleading or incorrect information, the Organisation may reject the registration, suspend access, cancel enrolment, withhold results or cancel any certificate issued.",
      "The learner must immediately inform the Organisation of any change to their contact information or other registration details.",
      "Registration is personal to the learner. The learner must not sell, transfer, assign, exchange or give their registration, course place, LMS access or payment to another person without prior written approval from the Organisation.",
    ],
  },
  {
    title: "2. Fees and Payment Terms",
    points: [
      "The learner must pay all applicable fees within the time and through the payment method specified by the Organisation.",
      "Fees may include registration fees, course fees, training fees, LMS fees, study material fees, assessment fees, examination fees, administration fees, verification fees, accreditation fees, certificate fees, printing fees, packaging fees and courier fees.",
      "The learner is responsible for all bank charges, payment gateway charges, currency conversion charges, taxes and other payment related costs.",
      "Registration or a course place will be confirmed only after the Organisation receives the required payment and registration information.",
      "Where payment is made in instalments, each instalment must be paid on time. Failure to pay an instalment may result in suspension or cancellation of LMS access and other services.",
      "The Organisation may withhold LMS access, study materials, assessment results or certification until all required fees have been paid in full.",
    ],
  },
  {
    title: "3. Strict No Refund Policy",
    points: [
      "All payments made to the Organisation are strictly non refundable under any circumstances.",
      "No refund, cancellation, adjustment, reimbursement, credit or compensation will be provided after payment for any reason, including change of mind, personal reasons, family reasons, medical reasons, financial difficulties, employment changes, business commitments, travel, relocation, change of address, visa issues, failure to obtain leave from work, failure to attend classes, late attendance, failure to access the LMS, failure to use course materials, failure to complete the programme, failure to submit assignments, failure to pass an assessment, failure to meet entry requirements, technical problems, internet failure, computer problems, loss of password, accidental payment, duplicate registration, non response to communications, suspension, termination or any other reason.",
      "Payment reserves access to the Organisation services and does not depend on the learner actually using the classes, LMS or materials.",
      "Non attendance, non participation, incomplete work or failure will not create any right to a refund.",
      "The learner must not stop or delay payment because of a complaint, disagreement, absence, technical issue, assessment result or any other matter.",
      "The Organisation may, at its sole discretion, offer a replacement class, rescheduled session or alternative arrangement. This will not be treated as a refund or admission of liability.",
    ],
  },
  {
    title: "4. Online Classes and Mandatory Attendance",
    points: [
      "Attendance at all required online classes is compulsory.",
      "The learner must join every scheduled class on time, use the approved link or platform, attend under their registered name, remain present for the full required period, participate in discussions and activities, respond to attendance checks, follow trainer instructions and complete all required class activities.",
      "The Organisation or trainer may mark a learner absent if the learner joins late, leaves early, remains inactive, does not respond to attendance checks, keeps the device unattended, joins from an unauthorised account, fails to participate or does not follow class requirements.",
      "The learner is responsible for arranging a suitable device, internet connection, software, quiet location, power supply and other technical requirements.",
      "Technical problems caused by the learner equipment, internet service, software or location will not normally excuse non attendance or create a refund right.",
      "The Organisation may change class times, platforms, trainers, delivery methods or schedules when necessary.",
      "The learner must not attend a class while driving, operating machinery or engaging in any activity that creates a safety risk.",
    ],
  },
  {
    title: "5. Assignments, Projects and Assessments",
    points: [
      "The learner must complete all assignments, projects, practical tasks, examinations, interviews and assessments required by the Organisation or trainer.",
      "All work must be submitted by the deadline and in the required format.",
      "The Organisation may refuse to accept late, incomplete, corrupted, copied or improperly submitted work.",
      "The learner is responsible for keeping copies of submitted work and confirming successful submission.",
      "The Organisation may require additional questions, oral verification, identity verification, supervised assessments or reassessment.",
      "The learner must achieve the required pass mark and meet all assessment standards before certification.",
      "The Organisation may change assessment methods, requirements, marking procedures or submission arrangements when necessary.",
    ],
  },
  {
    title: "6. Academic Honesty and Prohibited Conduct",
    points: [
      "All submitted work must be the learner's own original work unless collaboration or external assistance is expressly permitted by the Organisation.",
      "Prohibited conduct includes: plagiarism, copying, cheating, collusion, contract cheating, purchasing assignments, submitting another person's work, allowing another person to complete work, impersonation, using unauthorised notes/software/assistance, falsifying attendance, falsifying documents, sharing examination questions, recording or distributing examinations, manipulating assessment systems, and attempting to obtain an unfair academic advantage.",
      "The Organisation may investigate suspected misconduct.",
      "During an investigation, the Organisation may withhold results, suspend LMS access, require a new assessment or request an explanation.",
      "If misconduct is confirmed, the Organisation may cancel the assessment, refuse certification, withdraw a certificate, terminate enrolment and permanently restrict access to its services.",
      "Fees will not be refunded following academic misconduct or disciplinary action.",
    ],
  },
  {
    title: "7. LMS Access and Account Security",
    points: [
      "LMS access is provided only to the registered learner.",
      "The learner must protect their username, password, access code and other login information.",
      "The learner must not share login details, allow another person to use the account, create false accounts, transfer access, access another learner's account, bypass security controls, interfere with the LMS, upload harmful files, introduce viruses or malware, use automated tools to extract content, copy or scrape LMS information or attempt unauthorised access to Organisation systems.",
      "The learner must immediately notify the Organisation if they suspect unauthorised access.",
      "The Organisation may suspend or terminate LMS access without refund where it believes the account has been misused or this policy has been breached.",
      "LMS access will remain available only for the period determined by the Organisation or stated for the relevant programme.",
      "The Organisation may carry out maintenance, upgrades, security checks or system changes. Temporary interruption of access will not create a refund right.",
    ],
  },
  {
    title: "8. Confidentiality of Training Materials",
    points: [
      "All training materials and Organisation information are confidential and may be used only for the learner's personal educational purposes.",
      "Confidential information includes course videos, live class content, recordings, presentations, manuals, notes, workbooks, assignments, examination questions, assessment criteria, marking schemes, trainer explanations, LMS content, login information, internal notices, learner information, Organisation procedures, business information, pricing information and accreditation information.",
      "The learner must not copy, photograph, screenshot, record, reproduce, publish, forward, upload, sell, distribute or disclose confidential materials to any person.",
      "The learner must not post Organisation materials on social media, websites, messaging groups, file sharing platforms or public forums.",
      "The learner must not use Organisation materials to provide training, consultancy, coaching or other services to another person or organisation without written permission.",
      "The learner must not record a class, trainer, staff member or other learner without prior written permission from the Organisation.",
      "Confidentiality obligations continue after the learner completes, withdraws from or is removed from the programme.",
      "The Organisation may take disciplinary, civil or other appropriate action for unauthorised use or disclosure of confidential information.",
    ],
  },
  {
    title: "9. Intellectual Property",
    points: [
      "All course content, materials, logos, names, designs, videos, documents, assessments, software and other resources supplied by the Organisation belong to the Organisation or its authorised licensors.",
      "The learner receives limited permission to use the materials only for personal learning during the authorised course period.",
      "No ownership or intellectual property rights are transferred to the learner.",
      "The learner must not modify, translate, reproduce, distribute, sell, license, publish, display or commercially use the materials without prior written permission.",
      "Unauthorised use may result in cancellation of access, cancellation of certification and further action by the Organisation.",
    ],
  },
  {
    title: "10. Learner Code of Conduct",
    points: [
      "The learner must behave honestly, responsibly, respectfully and professionally in all dealings with the Organisation.",
      "The learner must respect trainers, management, staff, assessors and other learners; use polite and professional language; follow reasonable instructions; attend classes responsibly; participate without disrupting others; communicate truthfully; protect confidential information; respect personal and cultural differences; use their correct identity; follow assessment rules; respect intellectual property rights; keep account information secure; use official communication channels; and protect the legitimate interests and reputation of the Organisation.",
      "The learner must not engage in bullying, harassment, threatening behaviour, abuse, discrimination, hate speech, sexual harassment, defamation, insults, intimidation, unwanted contact, disruptive behaviour, fraud, bribery, impersonation, false complaints, malicious online publications, unauthorised recording, unauthorised disclosure, academic misconduct, cyber misuse or any conduct that may harm the Organisation, its staff, trainers or learners.",
    ],
  },
  {
    title: "11. Respect for Trainers and Staff",
    points: [
      "The learner must treat every trainer, manager, employee, representative, assessor and service provider of the Organisation with respect.",
      "The learner must not insult, threaten, pressure, intimidate, harass or abuse any trainer or staff member.",
      "Any disagreement with a trainer, result, policy, schedule or decision must be communicated through a professional and official process.",
      "The learner must not contact trainers or staff through personal channels for inappropriate purposes or outside reasonable professional communication.",
      "The Organisation may restrict or terminate communication with a learner whose conduct is abusive, threatening or disruptive.",
    ],
  },
  {
    title: "12. Organisation Authority",
    points: [
      "The Organisation has the authority to appoint, replace or change trainers and assessors.",
      "Trainers and authorised staff may control classes, manage participation, enforce deadlines, mark attendance, set reasonable instructions and maintain discipline.",
      "The Organisation may change course content, learning materials, delivery methods, class schedules, platforms, assessment procedures or administrative arrangements.",
      "The Organisation may refuse participation where a learner is unprepared, disruptive, unauthorised or in breach of this policy.",
      "The Organisation may rely on attendance records, LMS records, submitted work, communication records and assessment records when making academic or administrative decisions.",
      "The Organisation retains final decision making authority regarding scheduling, curriculum, attendance, assessments, learner conduct, LMS access and certification.",
    ],
  },
  {
    title: "13. Certification Requirements",
    points: [
      "A certificate will be issued only when the learner has completed all requirements set by the Organisation.",
      "Requirements may include required attendance, active participation, completion of assignments, completion of projects, passing examinations, passing assessments, identity verification, payment of all fees, compliance with this policy and compliance with applicable accreditation or awarding body requirements.",
      "No certificate is guaranteed merely because the learner has registered or paid.",
      "The Organisation may delay, withhold, cancel or withdraw a certificate if any requirement has not been satisfied.",
      "A certificate may be withdrawn if it was issued using false information, fraudulent documents, academic misconduct, impersonation or any other improper method.",
      "The Organisation may correct or replace a certificate where an administrative or printing error occurs.",
      "A certificate does not guarantee employment, promotion, admission, professional registration, immigration approval or acceptance by any third party.",
    ],
  },
  {
    title: "14. Digital and Hard Copy Documents",
    points: [
      "Certificates, completion letters, transcripts and other documents will normally be issued electronically.",
      "Digital documents may include an electronic signature, verification number, QR code, digital seal or other authentication feature.",
      "A hard copy may be requested separately if this service is available.",
      "The learner must pay all hard copy and delivery charges in advance.",
      "Charges may include printing, accreditation, administration, verification, packaging, handling, postage, courier, customs and redelivery fees.",
      "The learner is responsible for providing a complete and correct delivery address.",
      "The Organisation is not responsible for delays, failed delivery, customs charges, incorrect addresses, courier problems or events outside its control.",
      "A replacement hard copy may require payment of additional charges.",
    ],
  },
  {
    title: "15. Communication",
    points: [
      "The Organisation may communicate with the learner by email, telephone, SMS, WhatsApp, LMS notification or any other contact details provided during registration.",
      "The learner is responsible for checking all official communications, including spam and junk folders.",
      "The Organisation will not be responsible for missed information caused by an incorrect email address, inactive telephone number, full inbox, blocked message or failure to check communications.",
      "The learner must communicate respectfully and use official support or administration channels.",
    ],
  },
  {
    title: "16. Personal Information",
    points: [
      "The learner authorises the Organisation to use the information provided during registration for registration, training administration, attendance, communication, assessment, examination, certification, certificate verification, accreditation, payment processing, quality control, record keeping and security purposes.",
      "The Organisation may share necessary information with trainers, assessors, technology providers, payment providers, couriers, accreditation organisations and authorised representatives.",
      "The learner must not disclose the personal information of trainers, staff or other learners.",
    ],
  },
  {
    title: "17. Suspension, Cancellation and Termination",
    points: [
      "The Organisation may suspend, restrict or terminate the learner's access or enrolment if the learner fails to pay fees, breaches this policy, shares LMS access, misuses training materials, commits academic misconduct, provides false information, disrupts classes, behaves abusively, threatens or harasses staff or learners, damages the Organisation's reputation or creates a security, legal or operational risk.",
      "The Organisation may take immediate action where necessary.",
      "Suspension or termination will not create any right to a refund.",
      "The Organisation may withhold assessments, results, documents and certificates after suspension or termination.",
    ],
  },
  {
    title: "18. Complaints and Requests",
    points: [
      "Complaints, requests or concerns must be submitted through the official communication channel provided by the Organisation.",
      "The learner must provide their name, learner details, programme information, issue and supporting documents.",
      "Complaints must be written clearly and communicated respectfully.",
      "The Organisation may refuse to process repeated, abusive, threatening or malicious communications.",
      "Submitting a complaint does not suspend payment obligations, attendance requirements, assessment deadlines or LMS expiry.",
    ],
  },
  {
    title: "19. Changes to This Policy",
    points: [
      "The Organisation may update or change this policy, course arrangements, LMS rules, assessment requirements or administrative procedures whenever necessary.",
      "Updated policies or instructions communicated by the Organisation will apply to the learner's continuing participation.",
      "The learner is responsible for reviewing communications and updated policies.",
    ],
  },
  {
    title: "20. Events Beyond the Organisation's Control",
    points: [
      "The Organisation may reschedule, modify, suspend or delay training or related services due to technical issues, platform failure, internet interruption, power failure, natural events, government directions, emergencies, security incidents, staff unavailability, third party service failure or any other event beyond the Organisation's reasonable control.",
      "Such circumstances will not create a refund right.",
    ],
  },
  {
    title: "21. Final Acceptance",
    points: [
      "I confirm that I have read and understood this complete policy.",
      "I agree to the strict no refund policy.",
      "I agree to attend all required classes.",
      "I agree to complete all assignments, projects and assessments.",
      "I understand the certification requirements.",
      "I agree to protect all training materials and confidential information.",
      "I agree to respect trainers, management, staff and other learners.",
      "I agree to follow all instructions of 1A HK International Organisation.",
      "I agree to use the LMS properly.",
      "I understand the digital certificate and hard copy document conditions.",
      "I understand that breach of this policy may result in suspension, cancellation, termination or withdrawal of certification.",
      "I voluntarily accept all terms and conditions stated above.",
    ],
  },
];

function TermsModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            Terms &amp; Conditions, Learner Code of Conduct and No-Refund
            Policy
          </h2>
          <button
            onClick={onClose}
            aria-label="Close terms and conditions"
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-6">
          {TERMS_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-gray-800 mb-2">
                {section.title}
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-600 leading-relaxed">
                {section.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LearnerRegistration() {
  const [step, setStep] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copyMessage, setCopyMessage] = useState("");

  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  // ── Credentials copy-to-clipboard — UNCHANGED from your original flow ──
  const copyCredentials = async () => {
    if (!result?.credentials) return;

    await navigator.clipboard.writeText(
      `Email: ${result.credentials.email}
    Password: ${result.credentials.password}`,
    );

    setCopyMessage("✅ Credentials copied successfully");

    setTimeout(() => {
      setCopyMessage("");
    }, 2500);
  };

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    email: "",
    countryCode: "+91",
    mobile: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    courseIds: [],
    batchId: "",
    preferredIntake: "",
  });

  const [governmentId, setGovernmentId] = useState(null);
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getRegistrationCourses();
        setCourses(data);
      } catch {
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    })();
  }, []);

  const selectedCourse = courses.find((c) => c._id === form.courseIds[0]);
  const selectedCourses = courses.filter((c) => form.courseIds.includes(c._id));

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleCourse = (courseId) => {
    setForm((f) => {
      const isSelected = f.courseIds.includes(courseId);
      const nextIds = isSelected
        ? f.courseIds.filter((id) => id !== courseId)
        : [...f.courseIds, courseId];
      return {
        ...f,
        courseIds: nextIds,
        batchId: nextIds[0] === f.courseIds[0] ? f.batchId : "",
      };
    });
  };

  const validateStep = () => {
    setError("");
    if (step === 0) {
      const {
        firstName,
        lastName,
        dob,
        email,
        countryCode,
        mobile,
        addressLine1,
        city,
        country,
      } = form;
      if (
        !firstName ||
        !lastName ||
        !dob ||
        !email ||
        !countryCode ||
        !mobile ||
        !addressLine1 ||
        !city ||
        !country
      ) {
        setError(
          "Please fill in all personal information fields, including your postal address.",
        );
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address.");
        return false;
      }
      if (!/^[0-9]{6,15}$/.test(mobile)) {
        setError("Please enter a valid mobile number (digits only).");
        return false;
      }
    }
    if (step === 1) {
      if (!form.courseIds.length) {
        setError("Please select at least one course.");
        return false;
      }
    }
    if (step === 2) {
      if (!governmentId) {
        setError("Government ID upload is required.");
        return false;
      }
    }
    if (step === 3) {
      if (!declarationAccepted) {
        setError(
          "Please confirm that you have read and accept the Terms & Conditions, Learner Code of Conduct and No-Refund Policy before submitting your registration.",
        );
        return false;
      }
    }
    return true;
  };

  const handleFile = (file, isAdditional = false) => {
    setFileError("");
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("Only JPG, PNG, WEBP, and PDF files are supported.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setFileError("Each file must be 5MB or smaller.");
      return;
    }
    if (isAdditional) {
      setAdditionalFiles((prev) => [...prev, file]);
    } else {
      setGovernmentId(file);
    }
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...form,
        courseId: form.courseIds[0] || "",
        confirmed: declarationAccepted,
      };
      const res = await submitRegistration(payload);

      const registrationId = res?.registrationId || res?.data?.registrationId;

      const fd = new FormData();

      if (governmentId) {
        fd.append("governmentId", governmentId);
      }

      additionalFiles.forEach((file) => {
        fd.append("additional", file);
      });

      await uploadRegistrationDocuments(registrationId, fd);

      // ── This is the piece that carries the credentials through to the
      // result screen. It reads BOTH `res.isNewUser`/`res.credentials`
      // (flat) AND `res.data.isNewUser`/`res.data.credentials` (nested),
      // so it works regardless of whether submitRegistration's response
      // interceptor unwraps `.data` or not. If your backend response
      // shape doesn't match either of these, credentials will silently
      // come back undefined here — see the note below the code.
      setResult({
        registrationId,
        isNewUser: res?.isNewUser ?? res?.data?.isNewUser,
        credentials: res?.credentials ?? res?.data?.credentials,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Registration failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <MainLayout>
        <SEO
          title="Registration Submitted | 1A HK International"
          description="Your learner registration has been submitted successfully."
          url="https://hkinternational.uk/learner-registration"
          noIndex={true}
        />
        <div className="min-h-[80vh] flex justify-center items-center px-5">
          <div className="bg-white shadow-xl rounded-3xl p-10 max-w-xl w-full text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />

            <h2 className="text-2xl font-bold text-gray-800">
              Registration Submitted!
            </h2>

            <p className="text-gray-500 mt-3">
              Thank you. Your registration has been received and is now pending
              payment verification and admin approval. We'll notify you once
              approved.
            </p>

            {result.isNewUser && result.credentials && (
              <div className="mt-8">
                <div className="rounded-xl bg-gray-50 border p-6">
                  <h3 className="font-semibold text-lg mb-6">
                    Your Login Credentials
                  </h3>

                  <div className="text-left space-y-5">
                    <div>
                      <div className="text-xs text-gray-400">Email</div>

                      <div className="font-semibold">
                        {result.credentials.email}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-400">
                        Temporary Password
                      </div>

                      <div className="font-semibold">
                        {result.credentials.password}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={copyCredentials}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl "
                  >
                    <Copy size={18} />
                    Copy Credentials
                  </button>
                  {copyMessage && (
                    <div className="mt-3 text-sm font-medium text-green-600">
                      {copyMessage}
                    </div>
                  )}

                  <p className="text-red-500 text-xs mt-5">
                    Save these credentials. Login becomes available after admin
                    approval.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO
        title="Learner Registration | 1A HK International"
        description="Register for your accredited HSE course with 1A HK International."
        url="https://hkinternational.uk/learner-registration"
        noIndex={true}
      />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          Learner Registration
        </h1>
        <p className="text-gray-500 text-center mt-2">
          Complete the steps below to register for a course.
        </p>

        <div className="mt-5 mb-8 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5">
          <h3 className="text-lg font-semibold text-amber-800">
            ⚠️ Important Registration Notice
          </h3>

          <p className="mt-3 text-sm leading-6 text-gray-700">
            Please complete this registration form carefully. All information
            entered will be used for your learner profile, official records, and
            certificate printing.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-gray-700 list-disc list-inside">
            <li>
              Enter your{" "}
              <strong>
                full name exactly as it appears on your Passport, National ID,
                or Government-issued Identification.
              </strong>
            </li>

            <li>
              Carefully verify the spelling of your first name and last name
              before proceeding.
            </li>

            <li>
              Ensure your email address, mobile number, date of birth, and other
              personal details are accurate.
            </li>

            <li>
              Certificates will be issued using the information provided during
              registration.
            </li>

            <li>
              Incorrect information may result in delays, additional
              administrative charges, or certificate reissuance fees.
            </li>
          </ul>

          <div className="mt-4 rounded-lg bg-red-100 border border-red-300 p-3">
            <p className="text-sm font-semibold text-red-700">
              1A HK International will not be responsible for any spelling
              mistakes, incorrect personal information, or certificate errors
              caused by incorrect details submitted by the candidate. The
              candidate is solely responsible for verifying all information
              before submitting the registration form.
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mt-8 mb-10">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className="flex-1 flex flex-col items-center text-center"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                  i <= step
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-xs mt-2 ${i === step ? "text-indigo-600 font-medium" : "text-gray-400"}`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
          {error && (
            <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  className={inputClass}
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  className={inputClass}
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Middle Name (optional)</label>
                <input
                  className={inputClass}
                  value={form.middleName}
                  onChange={(e) => update("middleName", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.dob}
                  onChange={(e) => update("dob", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass}>Code</label>
                  <input
                    className={inputClass}
                    value={form.countryCode}
                    onChange={(e) => update("countryCode", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Mobile Number</label>
                  <input
                    className={inputClass}
                    value={form.mobile}
                    onChange={(e) => update("mobile", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input
                  className={inputClass}
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                  Official Postal / Certificate Delivery Address
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Your certificate, if applicable, will be physically dispatched
                  to this address — please double-check it.
                </p>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Address Line 1</label>
                <input
                  className={inputClass}
                  value={form.addressLine1}
                  onChange={(e) => update("addressLine1", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Address Line 2 (optional)</label>
                <input
                  className={inputClass}
                  value={form.addressLine2}
                  onChange={(e) => update("addressLine2", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input
                  className={inputClass}
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>State / Province / Region</label>
                <input
                  className={inputClass}
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Postal Code</label>
                <input
                  className={inputClass}
                  value={form.postalCode}
                  onChange={(e) => update("postalCode", e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className={labelClass}>
                  Courses — select one or more you'd like to apply for
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Selecting a course here is a request to enroll. Our team
                  reviews your selection and confirms which course(s) you're
                  actually enrolled into.
                </p>
                {loadingCourses ? (
                  <p className="text-sm text-gray-400">Loading courses…</p>
                ) : (
                  <div className="space-y-2 border border-gray-200 rounded-lg p-3 max-h-72 overflow-y-auto">
                    {courses.map((c) => (
                      <label
                        key={c._id}
                        className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-indigo-600"
                          checked={form.courseIds.includes(c._id)}
                          onChange={() => toggleCourse(c._id)}
                        />
                        <span className="text-sm text-gray-800">{c.title}</span>
                      </label>
                    ))}
                    {!courses.length && (
                      <p className="text-sm text-gray-400 px-2 py-1">
                        No courses are currently open for registration.
                      </p>
                    )}
                  </div>
                )}
              </div>
              {selectedCourse && (
                <div>
                  <label className={labelClass}>
                    Batch for {selectedCourse.title} (optional)
                  </label>
                  <select
                    className={inputClass}
                    value={form.batchId}
                    onChange={(e) => update("batchId", e.target.value)}
                  >
                    <option value="">No preference</option>
                    {selectedCourse.batches?.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.seatsLeft} seats left)
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className={labelClass}>Preferred Intake</label>
                <input
                  className={inputClass}
                  placeholder="e.g. January 2027"
                  value={form.preferredIntake}
                  onChange={(e) => update("preferredIntake", e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {fileError && <p className="text-sm text-red-600">{fileError}</p>}
              <div>
                <label className={labelClass}>Government ID (required)</label>
                <UploadBox
                  onFile={(f) => handleFile(f, false)}
                  fileName={governmentId?.name}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Additional Documents (optional)
                </label>
                <UploadBox
                  onFile={(f) => handleFile(f, true)}
                  fileName={null}
                />
                {additionalFiles.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {additionalFiles.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <FileText className="w-4 h-4" /> {f.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="text-xs text-gray-400">
                Accepted formats: JPG, PNG, WEBP, PDF. Max size 5MB per file.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-sm">
              <ReviewSection
                title="Personal Information"
                rows={[
                  [
                    "Name",
                    [form.firstName, form.middleName, form.lastName]
                      .filter(Boolean)
                      .join(" "),
                  ],
                  ["Date of Birth", form.dob],
                  ["Email", form.email],
                  ["Mobile", `${form.countryCode} ${form.mobile}`],
                  [
                    "Postal Address",
                    [
                      form.addressLine1,
                      form.addressLine2,
                      form.city,
                      form.state,
                      form.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", "),
                  ],
                  ["Country", form.country],
                ]}
              />
              <ReviewSection
                title="Course Selection"
                rows={[
                  [
                    "Courses Requested",
                    selectedCourses.map((c) => c.title).join(", ") || "—",
                  ],
                  [
                    "Batch",
                    selectedCourse?.batches?.find((b) => b._id === form.batchId)
                      ?.name || "No preference",
                  ],
                  ["Preferred Intake", form.preferredIntake || "—"],
                ]}
              />
              <ReviewSection
                title="Uploaded Documents"
                rows={[
                  ["Government ID", governmentId?.name || "Not uploaded"],
                  [
                    "Additional Documents",
                    additionalFiles.length
                      ? `${additionalFiles.length} file(s)`
                      : "None",
                  ],
                ]}
              />

              <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={declarationAccepted}
                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    className="mt-1 h-5 w-5 accent-indigo-600"
                  />

                  <span className="text-sm leading-6 text-gray-700">
                    <strong>Declaration:</strong> I confirm that all information
                    provided by me is true, complete, and matches my official
                    identification documents. I have carefully checked the
                    spelling of my name and all personal details. I understand
                    that my certificate will be issued exactly as per the
                    information submitted during registration. I accept full
                    responsibility for any mistakes, spelling errors, incorrect
                    personal details, or certificate corrections resulting from
                    inaccurate information provided by me. I understand that
                    corrections after certificate issuance may not be possible
                    or may be subject to additional administrative charges.
                    <br />
                    <br />
                    I have read and agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setTermsModalOpen(true)}
                      className="text-indigo-600 font-semibold underline hover:text-indigo-800"
                    >
                      Terms &amp; Conditions, Learner Code of Conduct and
                      No-Refund Policy
                    </button>
                    , including the strict no-refund policy, mandatory
                    attendance requirements, academic honesty rules,
                    confidentiality obligations, and all other terms set out
                    therein. By checking this box, I voluntarily accept all of
                    the above.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0 || submitting}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-1 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-60"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Registration
              </button>
            )}
          </div>
        </div>
      </div>

      <TermsModal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
      />
    </MainLayout>
  );
}

function UploadBox({ onFile, fileName }) {
  return (
    <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-indigo-400 transition-colors">
      <UploadCloud className="w-7 h-7 text-gray-400" />
      <span className="text-sm text-gray-500">
        {fileName || "Click to upload or drag a file here"}
      </span>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </label>
  );
}

function ReviewSection({ title, rows }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="rounded-lg border border-gray-100 divide-y divide-gray-100">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between px-4 py-2">
            <span className="text-gray-500">{label}</span>
            <span className="text-gray-800 font-medium text-right">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}