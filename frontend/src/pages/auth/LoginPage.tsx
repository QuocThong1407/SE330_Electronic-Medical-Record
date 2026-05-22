import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      setError("Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-2">
      <div className="flex flex-col justify-center">
        <div className="mb-4 inline-flex w-fit rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-800">
          EMR Administration
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Electronic Medical Record
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
          React + Vite + TypeScript frontend scaffold for managing users,
          doctors, patients, departments, and specializations.
        </p>
      </div>

      <div className="card p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-slate-900">Login</h2>
        <p className="mt-1 text-sm text-slate-500">
          Use your admin account to enter the system.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@emr.com"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
