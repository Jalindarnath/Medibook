import { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '../services/api';

/**
 * Custom hook to manage user appointments, search, filtering, and cancellation.
 */
export const useAppointments = (initialStatus = 'all') => {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await appointmentService.getMyAppointments(
        statusFilter === 'all' ? '' : statusFilter,
        searchQuery
      );
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError('Unable to load appointments from server.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const cancelAppointment = async (id) => {
    setError('');
    try {
      const res = await appointmentService.cancelAppointment(id);
      setSuccessMessage(res.data.message || `Appointment ${id} has been cancelled.`);
      await fetchAppointments();
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to cancel appointment.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  return {
    appointments,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    fetchAppointments,
    cancelAppointment,
  };
};

export default useAppointments;

