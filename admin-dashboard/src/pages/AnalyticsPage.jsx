import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Analytics from "../components/analytics/Analytics";
import AssignmentAnalytics from "../components/analytics/AssignmentAnalytics";
import AdminLayout from "../components/layout/AdminLayout";

const AnalyticsPage = () => (
  <AdminLayout>
  <div className="flex">
    <div className="flex-1">
      <Analytics />
      <AssignmentAnalytics />
    </div>
  </div>
  </AdminLayout>
);

export default AnalyticsPage;
