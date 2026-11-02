import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Shield,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  HeartPulse
} from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900 font-sans antialiased">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        id="admin-sidebar"
        data-testid="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1">
          {/* Logo / Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-950">
            <Link
              to="/admin"
              className="flex items-center gap-2.5 text-white font-extrabold text-xl tracking-tight"
            >
              <div className="bg-blue-600 text-white p-1.5 rounded-lg flex items-center justify-center shadow-xs">
                <Activity className="w-5 h-5" />
              </div>
              <span>
                Medi<span className="text-blue-400">Book</span>
              </span>
              <span className="ml-1 text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                Admin
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Administration
            </div>

            <button
              type="button"
              data-testid="admin-nav-overview"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer text-left bg-blue-600 text-white shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span>Dashboard Overview</span>
            </button>

            <div className="pt-6 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Quick Shortcuts
            </div>

            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <HeartPulse className="w-4 h-4 text-slate-400" />
              <span>Patient Portal</span>
            </Link>
          </nav>
        </div>

        {/* User Card & Logout at bottom of sidebar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs flex-shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {user?.full_name || 'Dr. Rajesh Kulkarni (Admin)'}
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate">
                  {user?.email || 'admin@medibook.com'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              id="admin-logout-btn"
              data-testid="admin-logout-btn"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Admin Center</span>
              <span>/</span>
              <span className="text-slate-900 font-bold">
                Dashboard Overview
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <span className="font-mono">
              Role: <strong className="text-blue-600 uppercase font-bold">ADMIN</strong>
            </span>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
