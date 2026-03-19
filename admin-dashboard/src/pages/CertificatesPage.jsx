import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Certificates from "../components/certificates/Certificates";
import AdminLayout from "../components/layout/AdminLayout";

const CertificatesPage = () => (
  <AdminLayout>
  <div className="flex">
    <div className="flex-1">
      <div className="p-6">
        <h1 className="text-xl font-bold">Certificates</h1>
        <Certificates studentId="123" courseId="456" />
      </div>
    </div>
  </div>
  </AdminLayout>
);

export default CertificatesPage;
