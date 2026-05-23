import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { LoginPage } from "./pages/auth/LoginPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { UsersPage } from "./pages/users/UsersPage";
import { DepartmentsPage } from "./pages/departments/DepartmentsPage";
import { SpecializationsPage } from "./pages/specializations/SpecializationsPage";
import { DoctorsPage } from "./pages/doctors/DoctorsPage";
import { PatientsPage } from "./pages/patients/PatientsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/specializations" element={<SpecializationsPage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/patients" element={<PatientsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
