import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const Alert = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const iconMap = {
    error: <AlertCircle size={18} className="alert-icon" />,
    success: <CheckCircle2 size={18} className="alert-icon" />,
    info: <Info size={18} className="alert-icon" />,
  };

  return (
    <div className={`alert alert-${type}`} role="alert">
      {iconMap[type] || iconMap.info}
      <div className="alert-content">{message}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
