import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/api';
import {
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Info
} from 'lucide-react';

export const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [doctorsMap, setDoctorsMap] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [allSlots, setAllSlots] = useState([]);

  // Default date = tomorrow
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    patient_name: user?.full_name || '',
    phone: user?.phone || '',
    category: searchParams.get('category') || '',
    doctor: '',
    appointment_date: getTomorrowString(),
    appointment_time: '',
    reason: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Fetch categories and doctors on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await appointmentService.getCategories();
        setCategories(res.data.categories || []);
        setDoctorsMap(res.data.doctors_by_category || {});

        const initialCategory = searchParams.get('category') || res.data.categories[0];
        const defaultDoctors = res.data.doctors_by_category[initialCategory] || [];
        setFormData((prev) => ({
          ...prev,
          category: prev.category || initialCategory,
          doctor: prev.doctor || defaultDoctors[0] || '',
        }));
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load doctor categories.");
      }
    };

    fetchMetadata();
  }, [searchParams]);

  // When category changes, update available doctors
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    const docs = doctorsMap[newCategory] || [];
    setFormData((prev) => ({
      ...prev,
      category: newCategory,
      doctor: docs[0] || '',
      appointment_time: '',
    }));
    setError('');
  };

  // Fetch slot availability whenever doctor or date changes
  useEffect(() => {
    if (!formData.doctor || !formData.appointment_date) return;

    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const res = await appointmentService.getAvailableSlots(
          formData.doctor,
          formData.appointment_date
        );
        setAllSlots(res.data.all_slots || []);
        setAvailableSlots(res.data.available_slots || []);
        setBookedSlots(res.data.booked_slots || []);

        // If currently selected slot is now booked, reset it
        if (formData.appointment_time && res.data.booked_slots.includes(formData.appointment_time)) {
          setFormData((prev) => ({ ...prev, appointment_time: '' }));
        }
      } catch (err) {
        console.error("Failed to check available slots:", err);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [formData.doctor, formData.appointment_date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSlotSelect = (slot) => {
    if (bookedSlots.includes(slot)) return;
    setFormData((prev) => ({ ...prev, appointment_time: slot }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Mandatory checks
    if (!formData.patient_name.trim()) {
      setError('Patient name is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required.');
      return;
    }
    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }
    if (!formData.category) {
      setError('Please choose an appointment category.');
      return;
    }
    if (!formData.doctor) {
      setError('Please select a healthcare doctor.');
      return;
    }
    if (!formData.appointment_date) {
      setError('Please pick an appointment date.');
      return;
    }
    if (formData.appointment_date < getTodayString()) {
      setError('Appointment date cannot be in the past.');
      return;
    }
    if (!formData.appointment_time) {
      setError('Please select an available appointment time slot.');
      return;
    }
    if (bookedSlots.includes(formData.appointment_time)) {
      setError('Selected time slot is already booked. Please choose an alternative slot.');
      return;
    }
    if (!formData.reason.trim()) {
      setError('Please specify the reason for the appointment.');
      return;
    }

    setLoading(true);
    try {
      const res = await appointmentService.createAppointment({
        patient_name: formData.patient_name.trim(),
        phone: formData.phone.trim(),
        category: formData.category,
        doctor: formData.doctor,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        reason: formData.reason.trim(),
      });

      // Navigate to Booking Confirmation page
      navigate('/booking-confirmation', {
        state: { appointment: res.data.appointment },
        replace: true,
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Booking failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-4 h-4" />
            <span>Dedicated Consultation Booking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Schedule Your Appointment
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Fill in your consultation details and reserve a guaranteed time slot.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-10">
          
          {error && (
            <div
              id="booking-error"
              data-testid="booking-error"
              className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-start gap-3 animate-fadeIn"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            
            {/* Row 1: Patient Name & Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="patient_name"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  Patient Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-lg shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="patient_name"
                    name="patient_name"
                    type="text"
                    data-testid="name-input"
                    value={formData.patient_name}
                    onChange={handleChange}
                    placeholder="e.g. Aarav Deshmukh"
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
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
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Category & Doctor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  Appointment Category <span className="text-rose-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  data-testid="appointment-category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="doctor"
                  className="block text-sm font-semibold text-slate-800 mb-1"
                >
                  Doctor / Service Provider <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-lg shadow-xs">
                  <select
                    id="doctor"
                    name="doctor"
                    data-testid="doctor-select"
                    value={formData.doctor}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    {(doctorsMap[formData.category] || []).map((doc) => (
                      <option key={doc} value={doc}>
                        {doc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Row 3: Appointment Date */}
            <div>
              <label
                htmlFor="appointment_date"
                className="block text-sm font-semibold text-slate-800 mb-1"
              >
                Appointment Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-xs max-w-sm">
                <input
                  id="appointment_date"
                  name="appointment_date"
                  type="date"
                  min={getTodayString()}
                  data-testid="appointment-date"
                  value={formData.appointment_date}
                  onChange={handleChange}
                  className="block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Select today or a future date. Past dates are rejected.
              </p>
            </div>

            {/* Row 4: Interactive Time Slots */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="appointment_time_select"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Available Time Slot <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-3 h-3 rounded bg-white border border-slate-300"></span>
                    Available
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-3 h-3 rounded bg-blue-600"></span>
                    Selected
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-3 h-3 rounded bg-slate-200 line-through"></span>
                    Booked
                  </span>
                </div>
              </div>

              {/* Primary Visible Dropdown for direct selection and Selenium WebDriver automated testing */}
              <div className="mb-3">
                <select
                  id="appointment_time"
                  name="appointment_time"
                  data-testid="appointment-time"
                  value={formData.appointment_time}
                  onChange={handleChange}
                  className="block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer"
                >
                  <option value="">-- Choose an available time slot --</option>
                  {allSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    return (
                      <option
                        key={slot}
                        value={slot}
                        disabled={isBooked}
                      >
                        {slot} {isBooked ? '(Booked)' : '(Available)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Visual Interactive Time Slot Quick-Pick Grid */}
              <div className="space-y-1.5">
                <span className="text-xs text-slate-500 font-medium block">Or click a slot directly:</span>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {allSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    const isSelected = formData.appointment_time === slot;

                    return (
                      <button
                        type="button"
                        key={slot}
                        data-testid={`slot-${slot.replace(/\s+/g, '-').toLowerCase()}`}
                        disabled={isBooked}
                        onClick={() => handleSlotSelect(slot)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition text-center cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                            : isBooked
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                            : 'bg-white border-slate-300 text-slate-800 hover:border-blue-500 hover:bg-blue-50/50'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.appointment_time && (
                <div className="text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 font-medium mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Selected slot: {formData.appointment_time}</span>
                </div>
              )}
            </div>

            {/* Row 5: Reason for Appointment */}
            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-semibold text-slate-800 mb-1"
              >
                Reason for Appointment <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                data-testid="reason-input"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Briefly describe your symptoms or reason for visit..."
                className="block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
              <button
                type="submit"
                id="book-appointment-button"
                data-testid="book-appointment-button"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-md transition disabled:opacity-70 cursor-pointer text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
