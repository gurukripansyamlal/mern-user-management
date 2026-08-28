import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="page-loader">
        <div className="spinner spinner-primary"></div>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <div className="spinner"></div>
      {message && <span>{message}</span>}
    </div>
  );
};

export default LoadingSpinner;
