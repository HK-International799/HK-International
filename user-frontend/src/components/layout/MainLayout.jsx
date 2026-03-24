
import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { useAuth } from "../../contexts/AuthContext";

export default function MainLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();

  return (
    <>
      <Navbar />
     {!isAuthenticated?( <Header />):""}

      {isAuthenticated && !loading ? (
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-6 bg-gray-50 pt-24">{children}</main>
        </div>
      ) : (
        <main className="">{children}</main>
      )}

      <Footer />
    </>
  );
}
