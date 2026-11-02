import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  XCircle,
  Eye,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  Stethoscope,
  RefreshCw,
  User,
  Phone,
  FileText
} from 'lucide-react';

export const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancellingAppointment, setCancellingAppointment] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await appointmentService.getMyAppointments(
        statusFilter === 'all' ? '' : statusFilter,
        searchQuery
      );
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      setError('Unable to load appointments from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  const handleConfirmCancel = async () => {
    if (!cancellingAppointment) return;

    setCancelLoading(true);
    setError('');
    try {
      const res = await appointmentService.cancelAppointment(cancellingAppointment.id);
      setSuccessMessage(res.data.message || `Appointment ${cancellingAppointment.id} has been cancelled.`);
      setCancellingAppointment(null);
      fetchAppointments();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to cancel appointment.';
      setError(msg);
      setCancellingAppointment(null);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Appointments
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Review your upcoming consultations, view details, and manage cancellations.
          </p>
        </div>

        <Link
          to="/book"
          id="book-new-appointment-btn"
          data-testid="book-new-appointment-btn"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm text-sm transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Appointment</span>
        </Link>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div
          id="cancellation-alert"
          data-testid="cancellation-alert"
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center justify-between animate-fadeIn"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
          <input
            id="search"
            name="search"
            type="text"
            data-testid="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctor, ID, or category..."
            className="w-full pl-10 pr-20 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition"
          >
            Search
          </button>
        </form>

        {/* Filter Tabs & Refresh */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              id="status_filter"
              data-testid="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Appointments</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button
            onClick={fetchAppointments}
            title="Refresh list"
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-xs text-slate-500 mt-3 font-medium">Loading appointments from database...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">No appointments found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'No appointments match your search or filter criteria.'
                : "You don't have any appointments booked yet."}
            </p>
            <Link
              to="/book"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600" id="appointments-table">
              <thead className="bg-slate-50 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Appointment ID</th>
                  <th className="py-3.5 px-4">Doctor & Department</th>
                  <th className="py-3.5 px-4">Schedule</th>
                  <th className="py-3.5 px-4">Booking Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((app) => {
                  const canCancel = app.status === 'confirmed' || app.status === 'pending';

                  return (
                    <tr
                      key={app.id}
                      id={`appointment-${app.id}`}
                      data-testid={`appointment-row-${app.id}`}
                      className="hover:bg-slate-50/70 transition"
                    >
                      {/* ID */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-900 text-xs">
                        {app.id}
                      </td>

                      {/* Doctor & Category */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">{app.doctor}</div>
                        <div className="text-xs text-slate-500">{app.category}</div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.appointment_date}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.appointment_time}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={app.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right space-x-2">
                        {/* View Details Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedAppointment(app)}
                          data-testid={`view-appointment-${app.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>

                        {/* Cancel Button */}
                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => setCancellingAppointment(app)}
                            id={`cancel-appointment-${app.id}`}
                            data-testid="cancel-appointment-button"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-6 text-left animate-fadeIn">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                  {selectedAppointment.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900">Appointment Details</h3>
              </div>
              <StatusBadge status={selectedAppointment.status} />
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Patient:</span>
                <span className="font-semibold text-slate-900">{selectedAppointment.patient_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Contact:</span>
                <span className="font-mono text-slate-900">{selectedAppointment.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Stethoscope className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Doctor:</span>
                <span className="font-semibold text-slate-900">{selectedAppointment.doctor}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-semibold text-slate-900">
                  {selectedAppointment.appointment_date} at {selectedAppointment.appointment_time}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium block mb-1">Reason for consultation:</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                  "{selectedAppointment.reason}"
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
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

      {/* Cancellation Confirmation Modal */}
      {cancellingAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 text-left animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Cancel Appointment?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to cancel appointment{' '}
                <span className="font-mono font-bold text-slate-800">{cancellingAppointment.id}</span> with{' '}
                <span className="font-medium text-slate-800">{cancellingAppointment.doctor}</span> on{' '}
                <span className="font-medium text-slate-800">{cancellingAppointment.appointment_date}</span>?
              </p>
              <p className="text-xs text-rose-600 font-medium">
                This will release the reserved time slot for other patients.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancellingAppointment(null)}
                disabled={cancelLoading}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                id="confirm-cancel-button"
                data-testid="confirm-cancel-button"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-70 cursor-pointer flex items-center gap-1.5"
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyAppointments;
