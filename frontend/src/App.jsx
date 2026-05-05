import { Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import LandingPage from "./pages/LandingPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import VideoPlayerPage from "./pages/VideoPlayerPage";
import ChatPage from "./pages/ChatPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import AdminRoute from "./components/routing/AdminRoute";
import AdminRoutes from "./admin/AdminRoutes";

export default function App() {
  return (
    <Routes>
      {/* Public / user routes — share MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route
          path="/videos/:videoId"
          element={
            <ProtectedRoute>
              <VideoPlayerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Admin panel — own Layout (Sidebar + Topbar), no MainLayout */}
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminRoutes />
          </AdminRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
