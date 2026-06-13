import { Navigate, useLocation, Outlet } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: ("ADMIN" | "DOCTOR" | "RECEPTIONIST" | "PATIENT")[];
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-soft border border-slate-100">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" />
          <span className="text-sm font-medium text-slate-500">Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role as any)) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
