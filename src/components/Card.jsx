import React from 'react';

export const Card = ({ children, onClick, className = '', style = {}, ...props }) => {
  const isClickable = !!onClick;
  return (
    <div
      onClick={onClick}
      style={style}
      className={`glass-panel rounded-xl shadow-lg transition-all duration-300 overflow-hidden ${
        isClickable ? 'cursor-pointer hover:border-accent-cyan/30 hover:bg-command-card-hover/80 hover:translate-y-[-2px]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', style = {} }) => (
  <div style={style} className={`px-6 py-4 border-b border-white/5 flex flex-col gap-1 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', style = {} }) => (
  <h3 style={style} className={`text-sm font-bold tracking-wide uppercase text-text-primary ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '', style = {} }) => (
  <p style={style} className={`text-xs text-text-secondary ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '', style = {} }) => (
  <div style={style} className={`p-6 flex-1 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', style = {} }) => (
  <div style={style} className={`px-6 py-4 bg-white/[0.01] border-t border-white/5 flex justify-end gap-3 ${className}`}>
    {children}
  </div>
);
