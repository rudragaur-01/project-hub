import "./App.css";

import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/ProjectDetail";
import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
