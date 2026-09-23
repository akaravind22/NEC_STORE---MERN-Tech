import React from 'react';

const GlassCard = ({ children, className = '', hover = true, style = {}, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`glass-card ${hover ? 'glass-card-hover' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
