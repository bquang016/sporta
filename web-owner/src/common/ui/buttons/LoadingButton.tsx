import React from 'react';
import { Button } from './Button';
import type { ButtonProps } from './Button';

export interface LoadingButtonProps extends ButtonProps {}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading = true, ...props }, ref) => {
    return <Button ref={ref} loading={loading} {...props} />;
  }
);

LoadingButton.displayName = 'LoadingButton';
export default LoadingButton;
