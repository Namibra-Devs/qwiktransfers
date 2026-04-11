import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';
import loginBg from '../assets/login_bg.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const [otp, setOtp] = useState('');
    const [rate, setRate] = useState(null);

    useEffect(() => {
        const fetchRate = async () => {
            try {
                const res = await api.get('/rates');
                // The API might return CAD->GHS or GHS->CAD. We want to show CAD->GHS (usually > 1)
                const rawRate = res.data.rate;
                const displayRate = rawRate < 1 ? (1 / rawRate) : rawRate;
                setRate(displayRate.toFixed(2));
            } catch (err) {
                console.error('Failed to fetch rates:', err);
            }
        };
        fetchRate();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const res = await login(email, password, show2FA ? otp : null);
            
            if (res.requires_2fa) {
                setShow2FA(true);
                setLoading(false);
                return;
            }

            if (res.user.role === 'admin') {
                navigate('/admin');
            } else if (res.user.role === 'vendor') {
                navigate('/vendor');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            if (err.code === 'ECONNABORTED') {
                setError('Login request timed out. Please check your internet connection.');
            } else if (!err.response) {
                setError('Network error. Please check your internet connection and try again.');
            } else {
                setError(err.response?.data?.error || 'Invalid email or password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-split-container">
            {/* Visual Section (Left) */}
            <div className="login-visual-section" style={{ backgroundImage: `url(${loginBg})` }}>
                <div className="login-visual-content">
                    <h1>QWIK<br />TRANSFERS</h1>
                    <p>Fast, secure, and reliable international money transfers. Moving your money at the speed of life.</p>

                    {rate && (
                        <div className="rate-widget-floating">
                            <span className="rate-label">Current Exchange Rate</span>
                            <span className="rate-value">1 CAD = {rate} GHS</span>
                            <span className="rate-update-time">Real-time market rate applied</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Form Section (Right) */}
            <div className="login-form-section">
                <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                    <ThemeSwitcher />
                </div>

                <div className="login-form-card">
                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-deep-brown)' }}>Welcome back</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Sign in to manage your transfers</p>
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: 'rgba(216, 59, 1, 0.1)',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            borderLeft: '4px solid var(--danger)'
                        }}>
                            <p style={{ color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 600 }}>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {show2FA ? (
                            <div className="fade-in">
                                <p style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>
                                    Enter the 6-digit code from your authenticator app.
                                </p>
                                <Input
                                    label="Authentication Code"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    maxLength={6}
                                    required
                                />
                                <Button type="submit" loading={loading} style={{ width: '100%', height: '56px', fontSize: '1rem', marginTop: '16px' }}>
                                    Verify Code
                                </Button>
                                <button type="button" onClick={() => { setShow2FA(false); setOtp(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', marginTop: '16px', cursor: 'pointer', display: 'block', width: '100%', fontWeight: 600 }}>
                                    Back to Login
                                </button>
                            </div>
                        ) : (
                            <div className="fade-in">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    required
                                />
                                <div style={{ marginBottom: '8px' }}>
                                    <Input
                                        label="Password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div style={{ textAlign: 'right', marginBottom: '32px' }}>
                                    <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</Link>
                                </div>
                                <Button type="submit" loading={loading} style={{ width: '100%', height: '56px', fontSize: '1rem' }}>
                                    Sign In
                                </Button>
                            </div>
                        )}
                    </form>

                    <p style={{ marginTop: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', marginLeft: '4px' }}>Sign up for free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
