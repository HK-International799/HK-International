// import { useState } from "react";
// import Navbar from "./Navbar";
// import Sidebar from "./Sidebar";

// export default function AdminLayout({ children }) {
//   const [collapsed, setCollapsed] = useState(false);
//   const [mobileOpen, setMobileOpen] = useState(false);

//   return (
//     <div className="flex h-screen bg-gray-50 overflow-hidden">

//       {/* Desktop Sidebar */}
//       <div className="hidden lg:block">
//         <Sidebar
//           collapsed={collapsed}
//           onToggle={() => setCollapsed(!collapsed)}
//         />
//       </div>

//       {/* Mobile Sidebar */}
//       {mobileOpen && (
//         <div className="fixed inset-0 z-50 lg:hidden">

//           <div
//             className="absolute inset-0 bg-black/40"
//             onClick={() => setMobileOpen(false)}
//           />

//           <div className="relative w-64 h-full">
//             <Sidebar
//               collapsed={false}
//               onToggle={() => setMobileOpen(false)}
//             />
//           </div>

//         </div>
//       )}

//       {/* Main */}
//       <div className="flex-1 flex flex-col min-w-0">

//         <Navbar
//           toggleSidebar={() => setMobileOpen(!mobileOpen)}
//         />

//         <main className="flex-1 overflow-y-auto">
//           <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
//             {children}
//           </div>
//         </main>

//       </div>
//     </div>
//   );
// }




import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

// `printBare` (opt-in, used by the Label Printer): when printing, hide the
// sidebar / navbar and remove the fixed-height scroll container so only the
// page content prints, across as many pages as it needs. Pages that don't
// pass it render and print exactly as before.
export default function AdminLayout({ children, printBare = false }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const p = (classes) => (printBare ? classes : "");

  return (
    <div className={`flex h-screen bg-gray-50 overflow-hidden ${p("print:block print:h-auto print:overflow-visible print:bg-white")}`}>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:block ${p("print:hidden")}`}>
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className={`fixed inset-0 z-50 lg:hidden ${p("print:hidden")}`}>

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          <div className="relative w-64 h-full">
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
            />
          </div>

        </div>
      )}

      {/* Main */}
      <div className={`flex-1 flex flex-col min-w-0 ${p("print:block")}`}>

        {printBare ? (
          <div className="print:hidden">
            <Navbar toggleSidebar={() => setMobileOpen(!mobileOpen)} />
          </div>
        ) : (
          <Navbar
            toggleSidebar={() => setMobileOpen(!mobileOpen)}
          />
        )}

        <main className={`flex-1 overflow-y-auto ${p("print:overflow-visible")}`}>
          <div className={`p-4 md:p-6 max-w-[1600px] mx-auto ${p("print:p-0 print:max-w-none print:m-0")}`}>
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}