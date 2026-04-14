import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Alert = ({ type = 'info', title, message, onClose, dismissible = true }) => {
  const config = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      title: 'text-blue-900',
      message: 'text-blue-700',
      icon: Info,
      iconColor: 'text-blue-500',
    },
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      title: 'text-emerald-900',
      message: 'text-emerald-700',
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      title: 'text-amber-900',
      message: 'text-amber-700',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      title: 'text-red-900',
      message: 'text-red-700',
      icon: AlertCircle,
      iconColor: 'text-red-500',
    },
  };

  const { bg, border, title: titleClass, message: messageClass, icon: Icon, iconColor } = config[type];

  return (
    <div className={`${bg} border ${border} rounded-xl p-4 flex items-start gap-3`}>
      <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        {title && <p className={`font-semibold ${titleClass}`}>{title}</p>}
        {message && <p className={`text-sm font-medium ${messageClass} ${title ? 'mt-1' : ''}`}>{message}</p>}
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
