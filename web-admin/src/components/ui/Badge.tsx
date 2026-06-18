import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
    const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    const variants = {
        success: 'bg-primary-container/20 text-brand-emerald',
        warning: 'bg-secondary-container/40 text-on-secondary-container',
        error: 'bg-error-container text-on-error-container',
        info: 'bg-surface-container-highest text-on-surface',
        default: 'bg-surface-variant text-on-surface-variant'
    };

    return (
        <span className={`${baseStyles} ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
