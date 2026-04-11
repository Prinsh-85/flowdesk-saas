import React from 'react';
import clsx from 'clsx';
import './Button.css';

export const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={clsx(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth && 'btn-full',
        isLoading && 'btn-loading',
        className
      )}
      {...props}
    >
      {isLoading ? <span className="loader"></span> : children}
    </button>
  );
});

Button.displayName = 'Button';
