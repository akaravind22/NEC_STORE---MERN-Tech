import React from 'react';

const GlassInput = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  rows
}) => {
  return (
    <div className="glass-input-group">
      {label && (
        <label className="glass-input-label" htmlFor={name}>
          {label} {required && <span style={{ color: 'var(--status-danger)' }}>*</span>}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          rows={rows || 3}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="glass-input"
          style={{ resize: 'vertical' }}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="glass-input"
        />
      )}
      {error && <span style={{ fontSize: '0.8rem', color: 'var(--status-danger)' }}>{error}</span>}
    </div>
  );
};

export default GlassInput;
