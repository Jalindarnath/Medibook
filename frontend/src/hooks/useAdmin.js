import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/api';

/**
 * Custom hook to manage Admin dashboard metrics, appointments, filters, and status changes.
 */
export const useAdmin = () => {
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
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [resettingDb, setResettingDb] = useState(false);

  const fetchAdminData = useCallback(async () => {
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
      console.error('Failed to load admin data:', err);
      setError('Failed to fetch administrator data.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter, searchQuery]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const updateStatus = async (appointmentId, newStatus) => {
    setActionLoadingId(appointmentId);
    setError('');
    try {
      const res = await adminService.updateStatus(appointmentId, newStatus);
      setSuccessMessage(res.data.message || `Appointment status updated to ${newStatus}.`);
      await fetchAdminData();
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update appointment status.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setActionLoadingId(null);
    }
  };

  const resetDatabase = async () => {
    setResettingDb(true);
    setError('');
    try {
      const res = await adminService.resetTestDatabase();
      setSuccessMessage(res.data.message || 'Database successfully reset.');
      await fetchAdminData();
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to reset database.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setResettingDb(false);
    }
  };

  return {
    stats,
    appointments,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    actionLoadingId,
    resettingDb,
    fetchAdminData,
    updateStatus,
    resetDatabase,
  };
};

export default useAdmin;

