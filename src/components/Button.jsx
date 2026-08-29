import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
  type = 'button',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center gap-2 font-medium tracking-wide rounded-lg transition-all duration-200 outline-none select-none active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-accent-cyan text-command-base hover:bg-accent-cyan/90 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] font-bold',
    secondary: 'bg-accent-blue text-white hover:bg-accent-blue/90 hover:shadow-[0_0_15px_rgba(59,130,246,0.25)] font-bold',
    outline: 'bg-transparent text-text-primary border border-white/10 hover:border-white/20 hover:bg-white/5',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5',
    danger: 'bg-danger-red text-white hover:bg-danger-red/90 hover:shadow-[0_0_15px_rgba(239,68,68,0.25)] font-bold'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${
        disabled ? 'opacity-40 cursor-not-allowed active:scale-100' : ''
      } ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};
