import React from 'react';
import clsx from 'clsx';
import './Card.css';

export const Card = ({ children, className, glass = false, ...props }) => {
  return (
    <div className={clsx('card', glass && 'glass', className)} {...props}>
      {children}
    </div>
  );
};
