import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  Printer,
  ArrowRight,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';

export const BookingConfirmation = () => {
  const location = useLocation();
  const appointment = location.state?.appointment;

  // If accessed directly without state, redirect to appointments
  if (!appointment) {
    return <Navigate to="/my-appointments" replace />;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden text-left">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-8 text-center space-y-3">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-xs rounded-full flex items-center justify-center mx-auto text-white">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Appointment Booked Successfully!
          </h1>
          <p className="text-emerald-100 text-sm max-w-md mx-auto">
            Your appointment has been reserved in our system. Please arrive 10 minutes prior to your scheduled time.
          </p>
        </div>

        {/* Confirmation Details Card */}
        <div className="p-6 sm:p-10 space-y-8">
          
          {/* Header Info: ID and Status */}
          <div className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Appointment Reference ID
              </span>
              <div
                id="confirmation-appointment-id"
                data-testid="confirmation-appointment-id"
                className="text-2xl font-mono font-black text-slate-900 mt-0.5"
              >
                {appointment.id}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Booking Status
              </span>
              <div
                id="confirmation-status"
                data-testid="confirmation-status"
              >
                <StatusBadge status={appointment.status} />
              </div>
            </div>
          </div>

          {/* Key Grid Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
            
            {/* Patient Name */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Patient Name</span>
              </div>
              <div
                id="confirmation-patient-name"
                data-testid="confirmation-patient-name"
                className="font-bold text-slate-900 text-base"
              >
                {appointment.patient_name}
              </div>
            </div>

            {/* Doctor */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                <span>Doctor / Specialist</span>
              </div>
              <div
                id="confirmation-doctor"
                data-testid="confirmation-doctor"
                className="font-bold text-slate-900 text-base"
              >
                {appointment.doctor}
              </div>
            </div>

            {/* Appointment Category */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Category</span>
              </div>
              <div
                id="confirmation-category"
                data-testid="confirmation-category"
                className="font-semibold text-slate-800 text-sm"
              >
                {appointment.category}
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Scheduled Date & Time</span>
              </div>
              <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <span id="confirmation-date" data-testid="confirmation-date">
                  {appointment.appointment_date}
                </span>
                <span>•</span>
                <span id="confirmation-time" data-testid="confirmation-time" className="text-blue-600 font-bold">
                  {appointment.appointment_time}
                </span>
              </div>
            </div>

            {/* Reason */}
            {appointment.reason && (
              <div className="md:col-span-2 pt-3 border-t border-slate-200/80 space-y-1">
                <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Clinical Reason</span>
                </div>
                <p className="text-xs text-slate-700 italic">
                  "{appointment.reason}"
                </p>
              </div>
            )}

          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Confirmation</span>
            </button>

            <div className="flex items-center gap-3">
              <Link
                to="/book"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Book Another</span>
              </Link>
              <Link
                to="/my-appointments"
                id="view-my-appointments-btn"
                data-testid="view-my-appointments-btn"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <span>My Appointments</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
