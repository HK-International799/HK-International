import { useEffect } from "react";
import { X, Inbox } from "lucide-react";

/* =========================================================
   COLOR SYSTEM
========================================================= */

const colors = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  primarySoft: "bg-indigo-50 text-indigo-600",

  accent: "bg-orange-500 text-white hover:bg-orange-600",
  accentSoft: "bg-orange-50 text-orange-600",

  success: "bg-emerald-500 text-white hover:bg-emerald-600",
  successSoft: "bg-emerald-50 text-emerald-600",

  danger: "bg-red-500 text-white hover:bg-red-600",
  dangerSoft: "bg-red-50 text-red-600",

  graySoft: "bg-gray-100 text-gray-700 hover:bg-gray-200",
};

/* =========================================================
   STAT CARD
========================================================= */

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "primary",
  className = "",
}) {
  const iconColors = {
    primary: "bg-indigo-50 text-indigo-600",
    accent: "bg-orange-50 text-orange-600",
    success: "bg-emerald-50 text-emerald-600",
    danger: "bg-red-50 text-red-600",
  };

  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
    >
      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {title}
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-1">
            {value ?? "—"}
          </h2>

          {trend !== undefined && (
            <p
              className={`text-xs mt-1 font-medium ${
                trend >= 0
                  ? "text-emerald-600"
                  : "text-red-500"
              }`}
            >
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
              <span className="text-gray-400 ml-1">
                from last month
              </span>
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`p-3 rounded-xl ${
              iconColors[color]
            }`}
          >
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   BADGE
========================================================= */

export function Badge({
  children,
  variant = "default",
}) {
  const styles = {
    default:
      "bg-gray-100 text-gray-600",
    primary:
      "bg-indigo-50 text-indigo-600",
    accent:
      "bg-orange-50 text-orange-600",
    success:
      "bg-emerald-50 text-emerald-600",
    warning:
      "bg-orange-100 text-orange-700",
    danger:
      "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

/* =========================================================
   MODAL
========================================================= */

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}) {
  const widths = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  useEffect(() => {
    if (!open) return;

    const esc = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow =
      "hidden";
    window.addEventListener(
      "keydown",
      esc
    );

    return () => {
      document.body.style.overflow =
        "auto";
      window.removeEventListener(
        "keydown",
        esc
      );
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${widths[size]} max-h-[85vh] flex flex-col animate-scaleIn`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">

          <h2 className="text-lg font-bold text-gray-800">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE HEADER
========================================================= */

export function PageHeader({
  title,
  subtitle,
  actions,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {title}
        </h1>

        {subtitle && (
          <p className="text-sm text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

export function EmptyState({
  icon: Icon = Inbox,
  title = "No data found",
  subtitle,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">

      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-indigo-500" />
      </div>

      <h3 className="text-lg font-semibold text-gray-700">
        {title}
      </h3>

      {subtitle && (
        <p className="text-sm text-gray-400 mt-1 max-w-sm">
          {subtitle}
        </p>
      )}

      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   DATA TABLE
========================================================= */

export function DataTable({
  columns,
  data,
  onRowClick,
  emptyMessage = "No records found",
}) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
      />
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">

            {data.map((row, i) => (
              <tr
                key={row._id || i}
                onClick={() =>
                  onRowClick?.(row)
                }
                className={`hover:bg-indigo-50/40 transition ${
                  onRowClick
                    ? "cursor-pointer"
                    : ""
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-5 py-3.5 text-sm text-gray-700"
                  >
                    {col.render
                      ? col.render(row)
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   BUTTON
========================================================= */

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  ...props
}) {
  const variants = {
    primary: colors.primary,
    accent: colors.accent,
    success: colors.success,
    danger: colors.danger,
    secondary: colors.graySoft,
    outline:
      "border border-gray-200 text-gray-700 hover:bg-gray-50",
    ghost:
      "text-gray-600 hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-sm",
  };

  return (
    <button
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="animate-pulse">
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/* =========================================================
   INPUT
========================================================= */

export function Input({
  label,
  error,
  className = "",
  ...props
}) {
  return (
    <div className={className}>

      {label && (
        <label className="text-sm font-medium text-gray-600 mb-1 block">
          {label}
        </label>
      )}

      <input
        className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition ${
          error
            ? "border-red-500"
            : "border-gray-200"
        }`}
        {...props}
      />

      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

export function Select({
  label,
  options,
  className = "",
  ...props
}) {
  return (
    <div className={className}>

      {label && (
        <label className="text-sm font-medium text-gray-600 mb-1 block">
          {label}
        </label>
      )}

      <select
        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
        {...props}
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =========================================================
   TEXTAREA
========================================================= */

export function Textarea({
  label,
  className = "",
  ...props
}) {
  return (
    <div className={className}>

      {label && (
        <label className="text-sm font-medium text-gray-600 mb-1 block">
          {label}
        </label>
      )}

      <textarea
        rows={4}
        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 resize-none"
        {...props}
      />
    </div>
  );
}