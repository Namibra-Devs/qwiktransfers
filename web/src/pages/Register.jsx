import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [country, setCountry] = useState('Ghana');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        try {
            await register(email, password, country);
            navigate('/');
        } catch (err) {
            setError('Registration failed. Try a different email.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div className="card" style={{ maxWidth: '440px', width: '90%', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>QWIK</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Create your Qwiktransfers account</p>

                {error && <p style={{ color: 'var(--danger)', marginBottom: '16px', fontWeight: 600 }}>{error}</p>}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Your Country</label>
                        <select value={country} onChange={(e) => setCountry(e.target.value)}>
                            <option value="Ghana">Ghana</option>
                            <option value="Canada">Canada</option>
                            <option value="Nigeria">Nigeria</option>
                            <option value="USA">USA</option>
                            <option value="UK">United Kingdom</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimum 6 characters"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary">Create Account</button>
                </form>

                <p style={{ marginTop: '32px', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
