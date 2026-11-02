import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(email.trim(), password);
      // Redirect based on role or intended destination
      const destination = location.state?.from?.pathname || (loggedInUser.role === 'admin' ? '/admin' : '/dashboard');
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid email address or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 mb-4">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-sm">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            Medi<span className="text-blue-600">Book</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to access your appointments and medical schedule.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200 rounded-2xl space-y-6">
          
          {error && (
            <div
              id="login-error"
              data-testid="login-error"
              className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  data-testid="email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  data-testid="password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-button"
              data-testid="login-button"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials for STQA Evaluation & Testing */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block text-center">
              Testing & Evaluation Credentials
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillQuickCredentials('patient@medibook.com', 'Patient123!')}
                className="p-2 border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 rounded-lg text-left transition flex items-center gap-1.5 text-blue-900 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span className="truncate font-medium">Patient Demo</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('admin@medibook.com', 'AdminPassword123!')}
                className="p-2 border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 rounded-lg text-left transition flex items-center gap-1.5 text-purple-900 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                <span className="truncate font-medium">Admin Demo</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-slate-600">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                id="register-link"
                data-testid="register-link"
                className="font-semibold text-blue-600 hover:text-blue-500 underline decoration-blue-200 hover:decoration-blue-600 underline-offset-4 transition"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
