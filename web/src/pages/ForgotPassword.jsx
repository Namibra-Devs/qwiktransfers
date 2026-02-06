import React, { useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isValidEmail(email)) {
            setMsg({ type: 'error', text: 'Please enter a valid email address' });
            return;
        }

        setLoading(true);
        setMsg({ type: '', text: '' });
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMsg({ type: 'success', text: res.data.message });
        } catch (error) {
            setMsg({ type: 'error', text: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div className="card" style={{ maxWidth: '440px', width: '90%', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Reset Password</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Enter your email to receive a reset link</p>

                {msg.text && (
                    <p style={{ color: msg.type === 'success' ? 'var(--success)' : 'var(--danger)', marginBottom: '16px', fontWeight: 600 }}>
                        {msg.text}
                    </p>
                )}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Sending link...' : 'Send Reset Link'}
                    </button>
                </form>

                <p style={{ marginTop: '32px', color: 'var(--text-muted)' }}>
                    Remember your password? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Back to login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
