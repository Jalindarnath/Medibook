import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import AdminLayout from '../layouts/AdminLayout';
import StatusBadge from '../components/StatusBadge';
import {
  Shield,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Check,
  X,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCheck,
  User,
  Phone
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_appointments: 0,
    pending_appointments: 0,
    confirmed_appointments: 0,
    cancelled_appointments: 0,
    completed_appointments: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals & Action States
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, appointmentsRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getAppointments(
          statusFilter === 'all' ? '' : statusFilter,
          dateFilter,
          searchQuery
        ),
      ]);
      setStats(statsRes.data.stats || {});
      setAppointments(appointmentsRes.data.appointments || []);
    } catch (err) {
      console.error('Admin dashboard fetch error:', err);
      setError('Failed to fetch administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [statusFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    setActionLoadingId(appointmentId);
    setError('');
    try {
      const res = await adminService.updateStatus(appointmentId, newStatus);
      setSuccessMessage(res.data.message || `Appointment status updated to ${newStatus}.`);
      fetchDashboardData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update status.';
      setError(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Top Header Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
              <Shield className="w-4 h-4" />
              <span>Administrator Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hospital Operations & Appointments
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time schedule oversight, slot validation, and patient appointment management.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={fetchDashboardData}
              title="Refresh records"
              className="p-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white bg-slate-800 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-xs font-semibold text-emerald-700">
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 5 Admin Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          
          {/* Total Users */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Users</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div
              id="admin-total-users"
              data-testid="admin-total-users"
              className="text-3xl font-extrabold text-slate-900"
            >
              {loading ? '...' : stats.total_users}
            </div>
            <p className="text-[11px] text-slate-500">Registered patients</p>
          </div>

          {/* Total Appointments */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Appointments</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div
              id="admin-total-appointments"
              data-testid="admin-total-appointments"
              className="text-3xl font-extrabold text-blue-600"
            >
              {loading ? '...' : stats.total_appointments}
            </div>
            <p className="text-[11px] text-slate-500">All database bookings</p>
          </div>

          {/* Pending Appointments */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Pending</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div
              id="admin-pending-appointments"
              data-testid="admin-pending-appointments"
              className="text-3xl font-extrabold text-amber-600"
            >
              {loading ? '...' : stats.pending_appointments}
            </div>
            <p className="text-[11px] text-slate-500">Awaiting approval</p>
          </div>

          {/* Confirmed Appointments */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Confirmed</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div
              id="admin-confirmed-appointments"
              data-testid="admin-confirmed-appointments"
              className="text-3xl font-extrabold text-emerald-600"
            >
              {loading ? '...' : stats.confirmed_appointments}
            </div>
            <p className="text-[11px] text-slate-500">Verified consultations</p>
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
              id="admin-cancelled-appointments"
              data-testid="admin-cancelled-appointments"
              className="text-3xl font-extrabold text-rose-600"
            >
              {loading ? '...' : stats.cancelled_appointments}
            </div>
            <p className="text-[11px] text-slate-500">Released / Rejected</p>
          </div>

        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
          
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="w-full lg:w-80 relative">
            <input
              id="admin-search"
              name="admin-search"
              type="text"
              data-testid="admin-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, doctor, phone, ID..."
              className="w-full pl-10 pr-20 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Filter controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Date Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold">Date:</span>
              <input
                id="admin-date-filter"
                type="date"
                data-testid="admin-date-filter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white"
              />
              {dateFilter && (
                <button
                  type="button"
                  onClick={() => setDateFilter('')}
                  className="text-slate-400 hover:text-slate-600 text-xs underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold">Status:</span>
              <select
                id="admin-status-filter"
                data-testid="admin-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Admin Appointments Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-xs text-slate-500 mt-3 font-medium">Fetching clinic appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No appointment records match filters</h4>
              <p className="text-xs text-slate-500">Try adjusting your date, status, or search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600" id="admin-appointments-table">
                <thead className="bg-slate-50 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Ref ID</th>
                    <th className="py-3.5 px-4">Patient Information</th>
                    <th className="py-3.5 px-4">Doctor & Department</th>
                    <th className="py-3.5 px-4">Schedule</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((app) => (
                    <tr
                      key={app.id}
                      id={`admin-app-${app.id}`}
                      data-testid={`admin-appointment-row-${app.id}`}
                      className="hover:bg-slate-50/70 transition"
                    >
                      {/* ID */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-900 text-xs">
                        {app.id}
                      </td>

                      {/* Patient */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">{app.patient_name}</div>
                        <div className="text-xs font-mono text-slate-500">{app.phone}</div>
                      </td>

                      {/* Doctor & Category */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900">{app.doctor}</div>
                        <div className="text-xs text-slate-500">{app.category}</div>
                      </td>

                      {/* Schedule */}
                      <td className="py-4 px-4">
                        <div className="text-xs font-semibold text-slate-900">{app.appointment_date}</div>
                        <div className="text-xs text-slate-500">{app.appointment_time}</div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={app.status} />
                      </td>

                      {/* Action Controls */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          
                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => setSelectedAppointment(app)}
                            data-testid={`admin-view-${app.id}`}
                            title="View Details"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Approve Button (when pending) */}
                          {app.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(app.id, 'confirmed')}
                              id={`approve-btn-${app.id}`}
                              data-testid={`approve-btn-${app.id}`}
                              disabled={actionLoadingId === app.id}
                              title="Approve Appointment"
                              className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg transition shadow-xs cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {/* Reject Button (when pending or confirmed) */}
                          {(app.status === 'pending' || app.status === 'confirmed') && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(app.id, 'cancelled')}
                              id={`reject-btn-${app.id}`}
                              data-testid={`reject-btn-${app.id}`}
                              disabled={actionLoadingId === app.id}
                              title="Reject/Cancel Appointment"
                              className="inline-flex items-center gap-1 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}

                          {/* Complete Button (when confirmed) */}
                          {app.status === 'confirmed' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(app.id, 'completed')}
                              id={`complete-btn-${app.id}`}
                              data-testid={`complete-btn-${app.id}`}
                              disabled={actionLoadingId === app.id}
                              title="Mark as Completed"
                              className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>Complete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Patient & Appointment Details Modal */}
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-6 text-left animate-fadeIn">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                    {selectedAppointment.id}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">Admin Inspection</h3>
                </div>
                <StatusBadge status={selectedAppointment.status} />
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Patient Name:</span>
                  <span className="font-semibold text-slate-900">{selectedAppointment.patient_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Contact Number:</span>
                  <span className="font-mono text-slate-900">{selectedAppointment.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Department:</span>
                  <span className="font-semibold text-slate-900">{selectedAppointment.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Doctor Assigned:</span>
                  <span className="font-semibold text-slate-900">{selectedAppointment.doctor}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Slot Reserved:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedAppointment.appointment_date} @ {selectedAppointment.appointment_time}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium block mb-1">Reason for appointment:</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                    "{selectedAppointment.reason}"
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {selectedAppointment.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleStatusChange(selectedAppointment.id, 'confirmed');
                        setSelectedAppointment(null);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Approve Now
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
