import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(email, password);
            navigate('/');
        } catch (err) {
            setError('Registration failed. Try a different email.');
        }
    };

    return (
        <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'radial-gradient(circle at bottom left, #1e1b4b, #0f172a)' }}>
            <div className="card" style={{ maxWidth: '400px', width: '90%' }}>
                <h1 style={{ textAlign: 'center', color: '#818cf8', marginBottom: '0.5rem' }}>QWIK<span style={{ color: '#fff' }}>TRANSFERS</span></h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Get started with your first transfer.</p>

                {error && <p style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" required />
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Create Account</button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Login instead</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
