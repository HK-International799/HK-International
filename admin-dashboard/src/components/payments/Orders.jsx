import { useEffect, useState } from "react";
import { getOrders } from "../../services/paymentService";
import AdminLayout from "../layout/AdminLayout";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrders().then(setOrders);
  }, []);

  return (
    <AdminLayout>
    <div className="p-6">
      <h1 className="text-xl font-bold">Payment Records</h1>
      {orders.map((o) => (
        <div key={o._id} className="border p-4 mb-2">
          <p>Student: {o.studentId.name}</p>
          <p>Course: {o.courseId.title}</p>
          <p>Status: {o.status}</p>
        </div>
      ))}
    </div>
    </AdminLayout>
  );
};

export default Orders;
