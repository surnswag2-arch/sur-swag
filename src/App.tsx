import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import OtpVerifyPage from "./components/auth/OtpVerifyPage";
import ForgotPasswordPage from "./components/auth/ForgotPasswordPage";
import MainLayout from "./components/layout/MainLayout";
import FeedPage from "./pages/FeedPage";
import DiscoverPage from "./pages/DiscoverPage";
import UploadPage from "./pages/UploadPage";
import InboxPage from "./pages/InboxPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#16161a",
              color: "#f5f0e8",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: "13px",
              borderRadius: "12px",
            },
            success: { iconTheme: { primary: "#ff3b7c", secondary: "#f5f0e8" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#f5f0e8" } },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-otp" element={<OtpVerifyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route index element={<FeedPage />} />
              <Route path="discover" element={<DiscoverPage />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="inbox" element={<InboxPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/:userId" element={<ProfilePage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
