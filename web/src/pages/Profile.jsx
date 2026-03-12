import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../services/api';
import { Link } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher';
import Button from '../components/Button';
import Input from '../components/Input';

const Profile = () => {
    const { user, logout, refreshProfile } = useAuth();
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const [config, setConfig] = useState({
        system_name: 'QWIK',
        system_logo: ''
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const configRes = await api.get('/system/config/public');
                setConfig({
                    system_name: configRes.data.system_name || 'QWIK',
                    system_logo: configRes.data.system_logo || ''
                });
            } catch (error) {
                console.error('Config fetch error:', error);
            }
        };
        fetchConfig();
    }, []);

    useEffect(() => {
        if (user) {
            setFullName(user.full_name || '');
            setPhone(user.phone || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch('/auth/profile', { full_name: fullName, phone });
            setMsg({ type: 'success', text: 'Profile updated successfully!' });
            if (refreshProfile) await refreshProfile();
        } catch (error) {
            setMsg({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/change-password', { currentPassword, newPassword });
            setMsg({ type: 'success', text: 'Password changed successfully!' });
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.error || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    const handleSetPin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/set-pin', { pin });
            setMsg({ type: 'success', text: 'Transaction PIN updated successfully!' });
            setPin('');
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.error || 'Failed to set PIN' });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('avatar', file);
        setLoading(true);
        try {
            await api.post('/auth/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMsg({ type: 'success', text: 'Avatar updated!' });
            if (refreshProfile) await refreshProfile();
        } catch (error) {
            setMsg({ type: 'error', text: 'Avatar upload failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="dashboard-brand">
                    <Link to="/" className="brand-link">
                        {config.system_logo ? (
                            <img 
                                src={getImageUrl(`/${config.system_logo}`)} 
                                alt="Logo" 
                                className="nav-logo"
                            />
                        ) : (
                            <div className="nav-logo-placeholder">Q</div>
                        )}
                        <span className="brand-name">{config.system_name}</span>
                    </Link>
                </div>

                <div className="dashboard-actions">
                    <nav className="dashboard-nav-links">
                        <Link 
                            to={user?.role === 'admin' ? '/admin' : user?.role === 'vendor' ? '/vendor' : '/dashboard'} 
                            style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-deep-brown)', textDecoration: 'none' }}
                        >
                            Dashboard
                        </Link>
                    </nav>

                    <div className="header-utilities">
                        <ThemeSwitcher />
                        
                        <Link to="/profile" className="user-profile-pill">
                            <div className="profile-details">
                                <span className="user-name">{user?.full_name || user?.email?.split('@')[0]}</span>
                                <span className="user-acc">{user?.account_number || 'ID: QT-USER'}</span>
                            </div>
                            {user?.profile_picture ? (
                                <img
                                    src={getImageUrl(user.profile_picture)}
                                    alt="Avatar"
                                    className="user-avatar"
                                />
                            ) : (
                                <div className="user-avatar-placeholder">
                                    {(user?.full_name || user?.email || 'Q')[0].toUpperCase()}
                                </div>
                            )}
                        </Link>

                        <button onClick={logout} className="sign-out-btn">
                            <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            <span className="text">Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ marginBottom: '48px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-deep-brown)', marginBottom: '12px', letterSpacing: '-1px' }}>
                        Account Settings
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                        Manage your profile, security, and payment preferences
                    </p>
                </div>

                {msg.text && (
                    <div style={{
                        padding: '16px 24px',
                        borderRadius: '16px',
                        marginBottom: '32px',
                        background: msg.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: msg.type === 'success' ? '#16a34a' : '#dc2626',
                        borderLeft: `6px solid ${msg.type === 'success' ? '#16a34a' : '#dc2626'}`,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        backdropFilter: 'blur(8px)'
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>{msg.type === 'success' ? '✓' : '✕'}</span>
                        {msg.text}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
                    {/* Avatar & Basic Info */}
                    <section className="card" style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        gap: '24px',
                        padding: '40px',
                        background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--accent-peach) 100%)',
                        textAlign: 'center'
                    }}>
                        <div style={{ position: 'relative', cursor: 'pointer' }} className="avatar-upload-wrapper">
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                padding: '4px',
                                background: 'linear-gradient(45deg, var(--primary), var(--accent-peach))',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                            }}>
                                {user?.profile_picture ? (
                                    <img
                                        src={getImageUrl(user.profile_picture)}
                                        alt="Profile"
                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid white' }}
                                    />
                                ) : (
                                    <div style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        borderRadius: '50%', 
                                        background: 'var(--accent-peach)', 
                                        color: 'var(--primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2.5rem',
                                        fontWeight: 900,
                                        border: '4px solid white'
                                    }}>
                                        {(user?.full_name || 'Q')[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div style={{
                                position: 'absolute',
                                bottom: '4px',
                                right: '4px',
                                background: 'var(--primary)',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '3px solid white',
                                color: 'white'
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                    <circle cx="12" cy="13" r="4"></circle>
                                </svg>
                            </div>
                            <input
                                type="file"
                                onChange={(e) => handleAvatarUpload(e.target.files[0])}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                            />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-deep-brown)' }}>{user?.full_name}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{user?.email}</p>
                            <div style={{ marginTop: '12px' }}>
                                {user?.kyc_status === 'verified' ? (
                                    <span className="kyc-status verified" style={{ fontSize: '0.75rem' }}>✓ Fully Verified</span>
                                ) : (
                                    <Link to="/kyc" className="kyc-status unverified" style={{ fontSize: '0.75rem', textDecoration: 'none' }}>Verify Identity</Link>
                                )}
                            </div>
                        </div>
                    </section>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
                        {/* Personal Info */}
                        <section className="card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ padding: '10px', background: 'rgba(183, 71, 42, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Personal Details</h3>
                            </div>
                            
                            <form onSubmit={handleUpdateProfile}>
                                <Input
                                    label="Account ID"
                                    value={user?.account_number || 'QT-PENDING'}
                                    readOnly
                                    style={{ background: 'var(--accent-peach)', cursor: 'not-allowed', opacity: 0.8, fontWeight: 700 }}
                                />
                                <Input
                                    label="Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                />
                                <Input
                                    label="Phone Number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+233..."
                                    style={{ marginBottom: '24px' }}
                                />
                                <Button type="submit" loading={loading} style={{ width: '100%', height: '52px' }}>
                                    Save Changes
                                </Button>
                            </form>
                        </section>

                        {/* Security */}
                        <section className="card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ padding: '10px', background: 'rgba(183, 71, 42, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Security Center</h3>
                            </div>

                            <form onSubmit={handleChangePassword}>
                                <Input
                                    label="Current Password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <Input
                                    label="New Password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min 6 characters"
                                    required
                                    style={{ marginBottom: '24px' }}
                                />
                                <Button type="submit" loading={loading} style={{ width: '100%', height: '52px' }}>
                                    Update Password
                                </Button>
                            </form>
                        </section>

                        {/* Transaction PIN */}
                        <section className="card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ padding: '10px', background: 'rgba(183, 71, 42, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Transaction PIN</h3>
                            </div>

                            <form onSubmit={handleSetPin}>
                                <div style={{ marginBottom: '24px' }}>
                                    <Input
                                        label="Secure 4-Digit PIN"
                                        type="password"
                                        maxLength="4"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                        placeholder="••••"
                                        required
                                    />
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '-12px', fontWeight: 500 }}>
                                        Required for authorizing all fund transfers.
                                    </p>
                                </div>
                                <Button type="submit" loading={loading} style={{ width: '100%', height: '52px' }}>
                                    Set New PIN
                                </Button>
                            </form>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
