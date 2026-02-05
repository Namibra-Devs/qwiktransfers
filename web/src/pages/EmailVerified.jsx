import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';

const EmailVerified = () => {
    const [status, setStatus] = useState('verifying');
    const location = useLocation();
    const token = new URLSearchParams(location.search).get('token');

    useEffect(() => {
        const verify = async () => {
            try {
                await api.get(`/auth/verify-email?token=${token}`);
                setStatus('success');
            } catch (error) {
                setStatus('error');
            }
        };
        if (token) verify();
        else setStatus('error');
    }, [token]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
                {status === 'verifying' && <h2>Verifying your email...</h2>}

                {status === 'success' && (
                    <>
                        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>✅</div>
                        <h1 style={{ marginBottom: '16px' }}>Email Verified!</h1>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '32px' }}>
                            Your email has been successfully verified. You can now access all features of Qwiktransfers.
                        </p>
                        <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Finally Login</Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>❌</div>
                        <h1 style={{ marginBottom: '16px' }}>Verification Failed</h1>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '32px' }}>
                            The verification link is invalid or has expired. Please try registering again or contact support.
                        </p>
                        <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Try Again</Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default EmailVerified;
