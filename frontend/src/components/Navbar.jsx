import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Calendar, User, LogOut, Menu, X, Shield, Clock } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            id="nav-logo"
            data-testid="nav-logo"
            className="flex items-center gap-2.5 text-blue-600 font-bold text-xl tracking-tight transition hover:opacity-90"
          >
            <div className="bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-slate-900 font-extrabold text-2xl">
              Medi<span className="text-blue-600">Book</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              id="nav-home-link"
              data-testid="nav-home-link"
              className={`text-sm font-medium transition ${
                isActive('/') ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </Link>
            <a
              href="/#services"
              id="nav-services-link"
              data-testid="nav-services-link"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Services
            </a>
            <a
              href="/#about"
              id="nav-about-link"
              data-testid="nav-about-link"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              About
            </a>
            <a
              href="/#contact"
              id="nav-contact-link"
              data-testid="nav-contact-link"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Contact
            </a>

            {isAuthenticated ? (
              <>
                <div className="h-4 w-px bg-slate-200 mx-1"></div>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    id="nav-admin-link"
                    data-testid="nav-admin-link"
                    className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition ${
                      isActive('/admin')
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'text-slate-700 hover:bg-slate-100 border-transparent'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Admin Panel</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      id="nav-dashboard-link"
                      data-testid="nav-dashboard-link"
                      className={`text-sm font-medium transition ${
                        isActive('/dashboard') ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/my-appointments"
                      id="nav-my-appointments-link"
                      data-testid="nav-my-appointments-link"
                      className={`text-sm font-medium transition ${
                        isActive('/my-appointments') ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      My Appointments
                    </Link>
                    <Link
                      to="/book"
                      id="nav-book-link"
                      data-testid="nav-book-link"
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Appointment</span>
                    </Link>
                  </>
                )}

                {/* User menu & logout */}
                <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs">
                      {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 hidden lg:inline-block max-w-[120px] truncate">
                      {user?.full_name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    id="nav-logout-button"
                    data-testid="nav-logout-button"
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium px-2.5 py-1.5 rounded-md hover:bg-rose-50 transition border border-transparent hover:border-rose-200 cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link
                  to="/login"
                  id="nav-login-link"
                  data-testid="nav-login-link"
                  className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  id="nav-register-link"
                  data-testid="nav-register-link"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle"
              data-testid="mobile-menu-toggle"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 font-medium py-2 px-3 rounded hover:bg-slate-50"
          >
            Home
          </Link>
          <a
            href="/#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 font-medium py-2 px-3 rounded hover:bg-slate-50"
          >
            Services
          </a>
          <a
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 font-medium py-2 px-3 rounded hover:bg-slate-50"
          >
            About
          </a>
          <a
            href="/#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 font-medium py-2 px-3 rounded hover:bg-slate-50"
          >
            Contact
          </a>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="px-3 py-1 text-xs text-slate-500 font-semibold">
                Signed in as {user?.full_name} ({user?.role})
              </div>
              {isAdmin ? (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-blue-600 font-medium py-2 px-3 rounded hover:bg-blue-50"
                >
                  Admin Panel
                </Link>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-slate-700 font-medium py-2 px-3 rounded hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/my-appointments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-slate-700 font-medium py-2 px-3 rounded hover:bg-slate-50"
                  >
                    My Appointments
                  </Link>
                  <Link
                    to="/book"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block bg-blue-600 text-white font-medium py-2 px-3 rounded text-center"
                  >
                    Book Appointment
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left text-rose-600 font-medium py-2 px-3 rounded hover:bg-rose-50"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 px-4 border border-slate-300 rounded-lg text-slate-700 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 px-4 bg-blue-600 text-white rounded-lg font-medium"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
