import React from 'react';
import clsx from 'clsx';
import './Input.css';

export const Input = React.forwardRef(({ 
  label, 
  error, 
  className,
  fullWidth = true,
  ...props 
}, ref) => {
  return (
    <div className={clsx('input-group', fullWidth && 'input-full', className)}>
      {label && <label className="input-label">{label}</label>}
      <input
        ref={ref}
        className={clsx('input-field', error && 'input-error')}
        {...props}
      />
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
