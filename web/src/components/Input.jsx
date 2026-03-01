import React from 'react';

const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    error = '',
    style = {},
    className = '',
    ...props
}) => {
    return (
        <div className={`form-group ${className}`} style={{ marginBottom: label ? '24px' : '0' }}>
            {label && <label>{label}</label>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                style={{
                    borderColor: error ? 'var(--danger)' : 'var(--border-color)',
                    ...style
                }}
                {...props}
            />
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>{error}</p>}
        </div>
    );
};

export default Input;
