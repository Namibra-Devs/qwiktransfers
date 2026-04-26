import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';
import loginBg from '../assets/login_bg.png';

const countryCodes = {
    'Canada': '+1',
};

const VendorRegister = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState('Canada');
    const [pin, setPin] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rate, setRate] = useState(null);

    useEffect(() => {
        const fetchRate = async () => {
            try {
                const res = await api.get('/rates');
                const rawRate = res.data.rate;
                const displayRate = rawRate < 1 ? (1 / rawRate) : rawRate;
                setRate(displayRate.toFixed(2));
            } catch (err) {
                console.error('Failed to fetch rates:', err);
            }
        };
        fetchRate();
    }, []);

    const handleNext = (e) => {
        e.preventDefault();
        setError('');

        const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isValidEmail(email)) {
            setError('Please enter a valid business email');
            return;
        }

        const code = countryCodes[country];
        if (!phone.startsWith(code)) {
            setError(`Phone number must start with ${code} for ${country}`);
            return;
        }
        if (phone.length < 10) {
            setError('Please enter a valid business phone number');
            return;
        }

        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

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
                pin,
                role: 'vendor' // Explicitly set role for vendor registration
            });
            navigate('/register-success', { state: { email, role: 'vendor' } });
        } catch (err) {
            setError(err.response?.data?.error || 'Vendor registration failed. Try a different business email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-split-container">
            {/* Visual Section (Left) - Vendor Themed */}
            <div className="login-visual-section" style={{ backgroundImage: `url(${loginBg})`, filter: 'hue-rotate(180deg)' }}>
                <div className="login-visual-content">
                    <h1>GROW WITH<br />QWIKTRANSFERS</h1>
                    <p>Join Ghana's most trusted payout network and start earning commissions on every movement you facilitate.</p>

                    {rate && (
                        <div className="rate-widget-floating">
                            <span className="rate-label">Global Market Access</span>
                            <span className="rate-value">1 CAD = {rate} GHS</span>
                            <span className="rate-update-time">Facilitate high-volume movements</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Form Section (Right) */}
            <div className="login-form-section">
                <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                    <ThemeSwitcher />
                </div>

                <div className="login-form-card" style={{ maxWidth: '460px' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'inline-block', padding: '4px 12px', background: 'var(--primary)', color: 'white', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '12px', textTransform: 'uppercase' }}>Vendor Partner</div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-deep-brown)' }}>Partner Registration</h2>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {step === 1 ? 'Step 1: Business Contact Details' : 'Step 2: Security & Authorization'}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                        <div style={{ flex: 1, height: '6px', background: step >= 1 ? 'var(--primary)' : 'rgba(0,0,0,0.1)', borderRadius: '10px' }}></div>
                        <div style={{ flex: 1, height: '6px', background: step >= 2 ? 'var(--primary)' : 'rgba(0,0,0,0.1)', borderRadius: '10px' }}></div>
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

                    <form onSubmit={step === 1 ? handleNext : handleSubmit}>
                        {step === 1 ? (
                            <>
                                <Input
                                    label="Business/Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Abbey Payout Services"
                                    required
                                />
                                <Input
                                    label="Business Email Address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="partners@example.com"
                                    required
                                />
                                <div className="form-group">
                                    <label>Operating Region</label>
                                    <select value={country} onChange={(e) => {
                                        setCountry(e.target.value);
                                        setPhone(countryCodes[e.target.value]);
                                    }}>
                                        {Object.keys(countryCodes).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <Input
                                    label="Business Phone Number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder={countryCodes[country]}
                                    required
                                    style={{ marginBottom: '32px' }}
                                />
                                <Button type="submit" style={{ width: '100%', height: '56px', fontSize: '1rem' }}>
                                    Continue to Security
                                </Button>
                            </>
                        ) : (
                            <>
                                <Input
                                    label="Partner Portal Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    required
                                />
                                <div style={{ marginBottom: '32px' }}>
                                    <Input
                                        label="Payout Auth PIN (4 Digits)"
                                        type="password"
                                        maxLength="4"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                        placeholder="••••"
                                        required
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-12px' }}>Required for authorizing payouts and withdrawals.</p>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        style={{ flex: 1, height: '56px', color: 'var(--text-deep-brown)', borderColor: 'var(--border-color)' }}
                                    >
                                        Back
                                    </Button>
                                    <Button type="submit" loading={loading} style={{ flex: 2, height: '56px', fontSize: '1rem' }}>
                                        Registered as Partner
                                    </Button>
                                </div>
                            </>
                        )}
                    </form>

                    <p style={{ marginTop: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Already a partner? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', marginLeft: '4px' }}>Sign in here</Link>
                    </p>
                    <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        By registering, you agree to our <Link to="/privacy-policy" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', marginLeft: '4px' }}>Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VendorRegister;
