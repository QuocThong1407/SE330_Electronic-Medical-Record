import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.18),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef6fb_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10">
        <Outlet />
      </div>
    </div>
  );
}
