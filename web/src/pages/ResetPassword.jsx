import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const token = new URLSearchParams(location.search).get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMsg({ type: 'error', text: 'Passwords do not match' });
            return;
        }
        if (newPassword.length < 6) {
            setMsg({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setMsg({ type: 'success', text: 'Password reset successful! Redirecting to login...' });
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.error || 'Something went wrong' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div className="card" style={{ maxWidth: '440px', width: '90%', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>New Password</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Set your new secure password</p>

                {msg.text && (
                    <p style={{ color: msg.type === 'success' ? 'var(--success)' : 'var(--danger)', marginBottom: '16px', fontWeight: 600 }}>
                        {msg.text}
                    </p>
                )}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            required
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat password"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Resetting...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
