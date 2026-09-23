import React from 'react';

const GlassButton = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  icon: Icon
}) => {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    danger: 'btn-danger'
  }[variant] || 'btn-primary';

  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  }[size] || '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`glass-btn ${variantClass} ${sizeClass} ${className}`}
      style={disabled ? { opacity: 0.6, cursor: 'not-allowed', transform: 'none' } : {}}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      {children}
    </button>
  );
};

export default GlassButton;
