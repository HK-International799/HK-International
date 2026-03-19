import AdminLayout from "../components/layout/AdminLayout";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import ManageUsers from "../components/users/ManageUsers";

const UsersPage = () => (
  <AdminLayout>
  <div className="flex">
    <div className="flex-1">
      <ManageUsers />
    </div>
  </div>
  </AdminLayout>
);

export default UsersPage;
