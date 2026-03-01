import React from 'react';

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    loading = false,
    disabled = false,
    style = {},
    className = '',
    icon = null
}) => {
    const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-outline';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseClass} ${className}`}
            style={{
                position: 'relative',
                ...style
            }}
        >
            {loading ? (
                <div className="spinner-small" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
            ) : (
                <>
                    {icon && <span style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;
