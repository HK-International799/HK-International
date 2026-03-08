import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <Header />

      <main className="">{children}</main>

      <Footer />
    </>
  );
}
