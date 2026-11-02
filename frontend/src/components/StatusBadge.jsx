import React from 'react';
import { CheckCircle2, Clock, XCircle, CheckCheck } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const normStatus = (status || '').toLowerCase();

  const config = {
    confirmed: {
      label: 'Confirmed',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: CheckCircle2,
    },
    pending: {
      label: 'Pending',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: Clock,
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: XCircle,
    },
    completed: {
      label: 'Completed',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: CheckCheck,
    },
  };

  const current = config[normStatus] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: Clock,
  };

  const Icon = current.icon;

  return (
    <span
      data-testid={`status-badge-${normStatus}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${current.border}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{current.label}</span>
    </span>
  );
};

export default StatusBadge;
