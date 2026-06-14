import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import imageIcon from "../../assets/icon.png";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [from, isAuthenticated, isLoading, navigate]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password, rememberSession);
      navigate(from, { replace: true });
    } catch {
      setError("Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative w-full max-w-[460px] overflow-hidden rounded-2xl border-t-4 border-brand-600 bg-white shadow-soft">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,_rgba(11,87,208,0.08),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(11,87,208,0.06),_transparent_35%)]" />

      <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-8">
        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl">
            <img
              src={imageIcon}
              alt="MedRecord Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="text-center">
            <div className="text-[20px] font-bold uppercase tracking-[0.22em] text-brand-700">
              MedRecord OS
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <h1 className="text-[28px] font-semibold tracking-tight text-slate-950">
            Sign In
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in to access authorized electronic health records securely.
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Email
            </label>
            <input
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@emr.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Password
            </label>
            <div className="relative">
              <input
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                className="absolute inset-y-0 right-3 inline-flex items-center justify-center text-slate-500 transition hover:text-brand-700"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 fill-none stroke-current"
                    strokeWidth="1.8"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58A3 3 0 0013.42 13.42" />
                    <path d="M9.88 5.08A9.77 9.77 0 0112 4c5 0 9.27 3.11 11 8-1.05 2.94-2.99 5.19-5.42 6.6" />
                    <path d="M6.69 6.69C3.97 8.28 2.08 10.92 1 12c1.73 4.89 6 8 11 8 1.11 0 2.18-.12 3.18-.35" />
                    <path d="M9.88 14.12A3 3 0 019.88 9.88" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 fill-none stroke-current"
                    strokeWidth="1.8"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
              />
              <span>Remember session</span>
            </label>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="pt-4">
            <button
              className="flex h-14 w-full items-center justify-center rounded-xl bg-brand-700 text-[16px] font-semibold text-white shadow-[0_12px_30px_rgba(8,86,207,0.18)] transition hover:bg-brand-800 hover:shadow-[0_16px_36px_rgba(8,86,207,0.22)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          HIPAA Compliant Environment - AES-256 Encrypted
        </p>
      </div>
    </main>
  );
}
