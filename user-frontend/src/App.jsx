import { AuthProvider } from "./contexts/AuthContext";
import { AOProvider } from "./contexts/AOContext";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
      <AOProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            duration: 4000,
            style: { borderRadius: "12px" },
          }}
        />
      </AOProvider>
    </AuthProvider>
  );
}
