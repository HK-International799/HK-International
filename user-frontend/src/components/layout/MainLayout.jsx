import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";
import { FaWhatsapp } from "react-icons/fa";
import WhatsAppButton from "./WhatsAppButton";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <Header />

      <main className="">{children}</main>

     {/* <WhatsAppButton/> */}

      <Footer />
    </>
  );
}
