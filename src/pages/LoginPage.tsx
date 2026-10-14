import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  AlertCircle,
  Activity,
  CheckCircle2,
  Server,
  FileCode,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors: Record<string, string[]> = {};
    if (!email.trim()) errors.email = ['The email field is required.'];
    if (!password.trim()) errors.password = ['The password field is required.'];

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'These credentials do not match our records.');
      }
    } catch {
      setError('An unexpected error occurred during login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Activity className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          MedCase Pro System
        </h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          Jajal Medical Software Developer Intern Practical Assignment
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-200/80">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Authentication Failed</h3>
                <p className="text-sm text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: [] });
                  }}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors ${
                    fieldErrors.email && fieldErrors.email.length > 0
                      ? 'border-red-300 bg-red-50/30'
                      : 'border-slate-300'
                  }`}
                  placeholder="name@jajalmedical.com"
                />
              </div>
              {fieldErrors.email && fieldErrors.email[0] && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: [] });
                  }}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors ${
                    fieldErrors.password && fieldErrors.password.length > 0
                      ? 'border-red-300 bg-red-50/30'
                      : 'border-slate-300'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {fieldErrors.password && fieldErrors.password[0] && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {fieldErrors.password[0]}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in to Dashboard'}
            </button>
          </form>

          {/* Quick Seed Accounts */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
              One-Click Seed Accounts (Documented in README)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillCredentials('admin@jajalmedical.com', 'admin123')}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-left transition-colors group"
              >
                <div className="p-1 rounded bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-900 group-hover:text-emerald-950">
                    Admin Role
                  </div>
                  <div className="text-[11px] text-emerald-700">Full CRUD + Status</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('viewer@jajalmedical.com', 'viewer123')}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-left transition-colors group"
              >
                <div className="p-1 rounded bg-amber-100 text-amber-700">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-900 group-hover:text-amber-950">
                    Viewer Role
                  </div>
                  <div className="text-[11px] text-amber-700">Read-Only (403 on edit/del)</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Assignment Information Card */}
        <div className="mt-6 bg-white/70 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Server className="w-4 h-4 text-blue-600" />
            Environment & Assignment Notice
          </div>
          <p className="text-slate-600 leading-relaxed">
            Per assignment requirements, this application runs a live full-stack Express + React prototype with Sanctum token auth, backend Policy gates (403), Form Requests (422), dynamic dashboard counts, and 25 seeded cases.
          </p>
          <div className="flex items-center gap-1.5 text-purple-700 font-medium pt-1">
            <FileCode className="w-3.5 h-3.5" />
            Complete Laravel 11 source codebase available under <code className="bg-purple-50 px-1 py-0.5 rounded border border-purple-200">/laravel-app</code> and the in-app inspector.
          </div>
        </div>
      </div>
    </div>
  );
};
