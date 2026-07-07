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
  // Check if a custom font weight is passed in className, if not default to font-extrabold
  const hasFontWeight = /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/.test(className);
  const baseStyles = `inline-flex items-center justify-center font-sans ${hasFontWeight ? '' : 'font-extrabold'} rounded-xl transition-all active:scale-95 duration-150 focus:outline-none`;
  
  const variants = {
    primary: "bg-brand-yellow text-brand-emerald hover:bg-yellow-400 active:bg-yellow-500",
    secondary: "bg-brand-emerald text-white hover:bg-emerald-800 active:bg-emerald-900",
    ghost: "bg-transparent text-brand-emerald border border-brand-emerald/30 hover:bg-brand-emerald/5"
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base"
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
export default Button;
