import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { COMPONENTS } from '../../styles/designSystem';

export const FormInput = ({
  label,
  type = 'text',
  icon: Icon,
  error,
  hint,
  required,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-bold text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500 text-slate-400">
            <Icon className="h-5 w-5" />
          </div>
        )}

        <input
          type={inputType}
          className={`${Icon ? 'pl-12' : ''} ${COMPONENTS.inputBase} ${
            error ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' : ''
          }`}
          {...props}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-xs font-medium mt-1.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {hint && !error && (
        <p className="text-xs text-slate-400 font-medium">{hint}</p>
      )}
    </div>
  );
};

export default FormInput;
