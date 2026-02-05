import React from 'react';
import { Link } from 'react-router-dom';

const RegisterSuccess = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🎉</div>
                <h1 style={{ marginBottom: '16px' }}>Congratulations!</h1>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '32px' }}>
                    Your account has been created successfully. We've sent a verification email to your inbox.
                    Please click the link in the email to activate your account.
                </p>
                <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Go to Login</Link>
                <p style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Didn't receive an email? Check your spam folder.
                </p>
            </div>
        </div>
    );
};

export default RegisterSuccess;
