import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-colors focus:outline-none";

  const variants = {
    primary: "bg-brand-yellow text-brand-emerald hover:bg-yellow-400 active:bg-yellow-500",
    secondary: "bg-brand-emerald text-white hover:bg-emerald-800 active:bg-emerald-900",
    ghost: "bg-transparent text-brand-emerald border border-brand-emerald/30 hover:bg-brand-emerald/5"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3.5 text-lg"
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};