import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher';
import Button from '../components/Button';
import Input from '../components/Input';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            const res = await login(email, password);
            if (res.user.role === 'admin') {
                navigate('/admin');
            } else if (res.user.role === 'vendor') {
                navigate('/vendor');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', transition: 'background-color 0.3s ease' }}>
            <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                <ThemeSwitcher />
            </div>
            <div className="card" style={{ maxWidth: '440px', width: '90%', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>QWIK</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Sign in to Qwiktransfers</p>

                {error && <p style={{ color: 'var(--danger)', marginBottom: '16px', fontWeight: 600 }}>{error}</p>}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
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
                    <Button type="submit" loading={loading} style={{ width: '100%' }}>
                        Sign In
                    </Button>
                </form>

                <p style={{ marginTop: '32px', color: 'var(--text-muted)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
