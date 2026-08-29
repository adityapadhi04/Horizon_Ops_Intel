import React from 'react';

export const Badge = ({ children, variant = 'neutral', className = '', ...props }) => {
  const styles = {
    success: 'bg-success-green/10 text-success-green border-success-green/20',
    warning: 'bg-warning-amber/10 text-warning-amber border-warning-amber/20',
    critical: 'bg-danger-red/10 text-danger-red border-danger-red/20',
    info: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20',
    neutral: 'bg-white/5 text-text-secondary border-white/10'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${styles[variant] || styles.neutral} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
