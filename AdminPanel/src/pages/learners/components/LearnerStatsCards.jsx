import {
  Users,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  CalendarClock,
} from "lucide-react";
import { StatCard } from "../../../components/ui";

const CARDS = [
  { key: "total", title: "Total Users", icon: Users, color: "primary" },
  { key: "students", title: "Students", icon: GraduationCap, color: "primary" },
  { key: "tutors", title: "Tutors", icon: UserCheck, color: "accent" },
  { key: "admins", title: "Admins", icon: ShieldCheck, color: "danger" },
  { key: "registeredToday", title: "Registered Today", icon: CalendarCheck, color: "success" },
  { key: "registeredThisWeek", title: "This Week", icon: CalendarDays, color: "success" },
  { key: "registeredThisMonth", title: "This Month", icon: CalendarRange, color: "success" },
  { key: "registeredThisYear", title: "This Year", icon: CalendarClock, color: "success" },
];

/**
 * Eight stat cards, reusing the admin panel's existing <StatCard>.
 * Values come from GET /admin/users/stats with the page's active filters,
 * so they recompute whenever filters change.
 */
export default function LearnerStatsCards({ stats, loading, error }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-5" aria-live="polite">
      {CARDS.map((c) =>
        loading && !stats ? (
          <div
            key={c.key}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm animate-pulse"
            aria-hidden="true"
          >
            <div className="h-3 w-20 bg-gray-100 rounded" />
            <div className="h-7 w-14 bg-gray-100 rounded mt-3" />
          </div>
        ) : (
          <StatCard
            key={c.key}
            title={c.title}
            value={error ? "—" : (stats?.[c.key] ?? 0).toLocaleString()}
            icon={c.icon}
            color={c.color}
            className={`transition-opacity duration-200 ${loading ? "opacity-60" : "opacity-100"}`}
          />
        ),
      )}
    </div>
  );
}
