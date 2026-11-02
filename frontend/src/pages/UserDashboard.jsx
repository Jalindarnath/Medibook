import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  User,
  Phone,
  Mail,
  Shield,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await appointmentService.getUserDashboardStats();
      setStats(res.data.stats || { total: 0, upcoming: 0, completed: 0, cancelled: 0 });
      setRecentAppointments(res.data.recent_appointments || []);
    } catch (err) {
      console.error("Dashboard stats error:", err);
      setError('Unable to load dashboard statistics from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner: Greeting and CTA */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Patient Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, <span className="text-blue-600">{user?.full_name || 'Patient'}</span>!
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Manage your medical schedule, view upcoming doctor appointments, and check status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            title="Refresh statistics"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/book"
            id="dashboard-book-button"
            data-testid="dashboard-book-button"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition cursor-pointer text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book Appointment</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Profile Card + Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* User Profile Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{user?.full_name}</h3>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Shield className="w-3 h-3" />
                <span>Verified Patient</span>
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="font-mono text-xs truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="font-mono text-xs">{user?.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="capitalize text-xs font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                Role: {user?.role}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/my-appointments"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-between"
            >
              <span>Manage all appointments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Statistics Cards */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          {/* Total Appointments */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div
              id="stat-total-appointments"
              data-testid="stat-total-appointments"
              className="text-3xl font-extrabold text-slate-900"
            >
              {loading ? '...' : stats.total}
            </div>
            <p className="text-xs text-slate-500">All bookings to date</p>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Upcoming</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div
              id="stat-upcoming-appointments"
              data-testid="stat-upcoming-appointments"
              className="text-3xl font-extrabold text-amber-600"
            >
              {loading ? '...' : stats.upcoming}
            </div>
            <p className="text-xs text-slate-500">Confirmed & pending</p>
          </div>

          {/* Completed Appointments */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Completed</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div
              id="stat-completed-appointments"
              data-testid="stat-completed-appointments"
              className="text-3xl font-extrabold text-emerald-600"
            >
              {loading ? '...' : stats.completed}
            </div>
            <p className="text-xs text-slate-500">Past attended visits</p>
          </div>

          {/* Cancelled Appointments */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Cancelled</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div
              id="stat-cancelled-appointments"
              data-testid="stat-cancelled-appointments"
              className="text-3xl font-extrabold text-rose-600"
            >
              {loading ? '...' : stats.cancelled}
            </div>
            <p className="text-xs text-slate-500">Released time slots</p>
          </div>

        </div>
      </div>

      {/* Recent Appointments Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Appointments</h2>
            <p className="text-xs text-slate-500">Your latest medical consultations and history</p>
          </div>
          <Link
            to="/my-appointments"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-900 text-base">No appointments booked yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't scheduled any healthcare consultations yet. Book a visit with one of our certified specialists.
            </p>
            <Link
              to="/book"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Book Your First Appointment</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold text-xs uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Appointment ID</th>
                  <th className="py-3 px-4">Doctor / Specialty</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAppointments.map((app) => (
                  <tr
                    key={app.id}
                    data-testid={`appointment-row-${app.id}`}
                    className="hover:bg-slate-50/80 transition"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">
                      {app.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{app.doctor}</div>
                      <div className="text-xs text-slate-500">{app.category}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{app.appointment_date}</div>
                      <div className="text-xs text-slate-500">{app.appointment_time}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/my-appointments"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition underline underline-offset-2"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default UserDashboard;
