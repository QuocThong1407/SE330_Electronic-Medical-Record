import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.18),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef6fb_100%)]">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-soft border border-slate-100 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <svg
              viewBox="0 0 24 24"
              className="h-10 w-10 text-red-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-950 mb-2">
          Unauthorized Access
        </h1>
        <p className="text-slate-600 mb-6">
          You do not have permission to access this page. This system is restricted to authorized personnel only.
        </p>
        
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
          <p className="font-semibold">Access Denied</p>
          <p className="text-red-600">
            Your account role does not have sufficient privileges to view this content.
          </p>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(8,86,207,0.18)] transition hover:bg-brand-800 hover:shadow-[0_16px_36px_rgba(8,86,207,0.22)] active:scale-[0.99]"
        >
          Logout and Return to Login
        </button>
      </div>
    </div>
  );
}