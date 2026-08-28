import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';
import type { InputProps } from './Input';
import { IconButton } from '../buttons/IconButton';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'suffixIcon'> {}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleShow = () => {
      setShowPassword((prev) => !prev);
    };

    const toggleButton = (
      <IconButton
        variant="ghost"
        size="sm"
        onClick={toggleShow}
        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
        className="text-slate-400 hover:text-slate-600 focus:ring-0 active:scale-100 -mr-1"
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </IconButton>
    );

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        suffixIcon={toggleButton}
        className={className}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
