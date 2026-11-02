import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, User, Mail, Phone, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validate = () => {
    const { full_name, email, phone, password, confirm_password } = formData;

    if (!full_name.trim()) {
      return 'Full name is required.';
    }

    if (!email.trim()) {
      return 'Email address is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address.';
    }

    if (!phone.trim()) {
      return 'Phone number is required.';
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      return 'Phone number must be exactly 10 digits.';
    }

    if (!password) {
      return 'Password is required.';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }

    if (password !== confirm_password) {
      return 'Password confirmation does not match.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
      });

      setSuccess('Account created successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please verify your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
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
          Create Patient Account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Sign up to schedule and manage your medical appointments online.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200 rounded-2xl space-y-6">
          
          {error && (
            <div
              id="register-error"
              data-testid="register-error"
              className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              id="register-success"
              data-testid="register-success"
              className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-start gap-2.5 animate-fadeIn"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  data-testid="name-input"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Eleanor Vance"
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
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
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number (10 Digits) <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  maxLength={10}
                  data-testid="phone-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password (min. 8 characters) <span className="text-rose-500">*</span>
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
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-slate-700 mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  data-testid="confirm-password-input"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              id="register-button"
              data-testid="register-button"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-70 cursor-pointer mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                id="login-link"
                data-testid="login-link"
                className="font-semibold text-blue-600 hover:text-blue-500 underline decoration-blue-200 hover:decoration-blue-600 underline-offset-4 transition"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
