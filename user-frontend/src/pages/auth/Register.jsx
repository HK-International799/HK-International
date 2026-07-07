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

export default function LearnerRegistration() {
  const [step, setStep] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copyMessage, setCopyMessage] = useState("");

  const [declarationAccepted, setDeclarationAccepted] = useState(false);

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
    lastName: "",
    dob: "",
    email: "",
    countryCode: "+91",
    mobile: "",
    address: "",
    country: "",
    courseId: "",
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

  const selectedCourse = courses.find((c) => c._id === form.courseId);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

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
        address,
        country,
      } = form;
      if (
        !firstName ||
        !lastName ||
        !dob ||
        !email ||
        !countryCode ||
        !mobile ||
        !address ||
        !country
      ) {
        setError("Please fill in all personal information fields.");
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
      if (!form.courseId) {
        setError("Please select a course.");
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
          "Please confirm that all the information provided is correct before submitting your registration.",
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
      const res = await submitRegistration(form);

      const registrationId = res?.registrationId || res?.data?.registrationId;

      const fd = new FormData();

      if (governmentId) {
        fd.append("governmentId", governmentId);
      }

      additionalFiles.forEach((file) => {
        fd.append("additional", file);
      });

      await uploadRegistrationDocuments(registrationId, fd);

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
      {/* This is a hidden, unlinked self-registration URL shared only with
          specific learners — it must never be indexed or appear in search
          results, so noIndex is hardcoded true (not tied to any prop). */}
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
              <div className="sm:col-span-2">
                <label className={labelClass}>Full Address</label>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Course</label>
                {loadingCourses ? (
                  <p className="text-sm text-gray-400">Loading courses…</p>
                ) : (
                  <select
                    className={inputClass}
                    value={form.courseId}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        courseId: e.target.value,
                        batchId: "",
                      }))
                    }
                  >
                    <option value="">Select a course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {selectedCourse && (
                <div>
                  <label className={labelClass}>Batch (optional)</label>
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
                  ["Name", `${form.firstName} ${form.lastName}`],
                  ["Date of Birth", form.dob],
                  ["Email", form.email],
                  ["Mobile", `${form.countryCode} ${form.mobile}`],
                  ["Address", form.address],
                  ["Country", form.country],
                ]}
              />
              <ReviewSection
                title="Course Selection"
                rows={[
                  ["Course", selectedCourse?.title || "—"],
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
