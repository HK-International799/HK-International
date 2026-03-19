import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Orders from "../components/payments/Orders";

const OrdersPage = () => (
  <AdminLayout>
  <div className="flex">
    <div className="flex-1">
      <Orders />
    </div>
  </div>
  </AdminLayout>
);

export default OrdersPage;
