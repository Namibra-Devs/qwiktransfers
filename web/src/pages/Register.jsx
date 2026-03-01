import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher';
import Button from '../components/Button';
import Input from '../components/Input';

const countryCodes = {
    'Ghana': '+233',
    'Canada': '+1',
    // 'Nigeria': '+234',
    // 'USA': '+1',
    // 'UK': '+44'
};

const Register = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState('Ghana');
    const [pin, setPin] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNext = (e) => {
        e.preventDefault();
        setError('');

        const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Simple phone validation
        const code = countryCodes[country];
        if (!phone.startsWith(code)) {
            setError(`Phone number must start with ${code} for ${country}`);
            return;
        }
        if (phone.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (pin.length !== 4) {
            setError('PIN must be exactly 4 digits');
            return;
        }

        setLoading(true);
        try {
            await register({
                email,
                password,
                full_name: fullName,
                phone,
                country,
                pin
            });
            navigate('/register-success', { state: { email } });
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Try a different email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', transition: 'background-color 0.3s ease' }}>
            <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                <ThemeSwitcher />
            </div>
            <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>QWIK</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                    {step === 1 ? 'Personal Information' : 'Account Security'}
                </p>

                {error && <p style={{ color: 'var(--danger)', marginBottom: '16px', fontWeight: 600 }}>{error}</p>}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '40px', height: '4px', background: step >= 1 ? 'var(--primary)' : '#ddd', borderRadius: '2px' }}></div>
                    <div style={{ width: '40px', height: '4px', background: step >= 2 ? 'var(--primary)' : '#ddd', borderRadius: '2px' }}></div>
                </div>

                <form onSubmit={step === 1 ? handleNext : handleSubmit} style={{ textAlign: 'left' }}>
                    {step === 1 ? (
                        <>
                            <Input
                                label="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Hamza Ibrahim"
                                required
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                required
                            />
                            <div className="form-group">
                                <label>Your Country</label>
                                <select value={country} onChange={(e) => {
                                    setCountry(e.target.value);
                                    setPhone(countryCodes[e.target.value]);
                                }}>
                                    {Object.keys(countryCodes).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <Input
                                label="Phone Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder={countryCodes[country]}
                                required
                                style={{ marginBottom: '32px' }}
                            />
                            <Button type="submit" style={{ width: '100%' }}>Next Step</Button>
                        </>
                    ) : (
                        <>
                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimum 6 characters"
                                required
                            />
                            <div style={{ marginBottom: '32px' }}>
                                <Input
                                    label="4-Digit Transaction PIN"
                                    type="password"
                                    maxLength="4"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                    placeholder="••••"
                                    required
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-16px', marginBottom: '8px' }}>Used to authorize transfers and uploads.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Button
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    style={{ flex: 1, color: 'var(--text-deep-brown)', borderColor: 'var(--border-color)' }}
                                >
                                    Back
                                </Button>
                                <Button type="submit" loading={loading} style={{ flex: 2 }}>
                                    Complete Registration
                                </Button>
                            </div>
                        </>
                    )}
                </form>

                <p style={{ marginTop: '32px', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
