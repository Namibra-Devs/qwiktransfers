import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../services/api';
import { Link } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import Button from '../components/Button';
import Input from '../components/Input';

const Profile = () => {
    const { user, logout, refreshProfile } = useAuth();
    const [firstName, setFirstName] = useState(user?.first_name || '');
    const [middleName, setMiddleName] = useState(user?.middle_name || '');
    const [lastName, setLastName] = useState(user?.last_name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    // Danger Zone State
    const [dangerAction, setDangerAction] = useState(null); // 'disable' or 'delete'
    const [actionReason, setActionReason] = useState('');
    const [showDangerModal, setShowDangerModal] = useState(false);

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
            setFirstName(user.first_name || '');
            setMiddleName(user.middle_name || '');
            setLastName(user.last_name || '');
            setPhone(user.phone || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch('/auth/profile', { 
                first_name: firstName, 
                middle_name: middleName, 
                last_name: lastName, 
                phone 
            });
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

    const handleDangerAction = async (e) => {
        if (e) e.preventDefault();
        if (!actionReason.trim()) {
            setMsg({ type: 'error', text: 'Please provide a reason' });
            return;
        }

        setLoading(true);
        try {
            const endpoint = dangerAction === 'disable' ? '/auth/disable-account' : '/auth/delete-account';
            await api.post(endpoint, { reason: actionReason });
            
            setShowDangerModal(false);
            setMsg({ 
                type: 'success', 
                text: dangerAction === 'disable' 
                    ? 'Account disabled. You will now be signed out.' 
                    : 'Deletion request submitted. You will now be signed out.' 
            });
            
            setTimeout(() => {
                logout();
            }, 3000);
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.error || 'Action failed' });
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
            <DashboardHeader 
                user={user} 
                logout={logout} 
                config={config} 
                type={user?.role || 'user'} 
            />

            <main className="dashboard-main fade-in" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
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
                        <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>{msg.type === 'success' ? 'check_circle' : 'cancel'}</span>
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
                                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>add_a_photo</span>
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
                                    <span className="kyc-status verified" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>verified</span>
                                        Fully Verified
                                    </span>
                                ) : (
                                    <Link to="/kyc" className="kyc-status unverified" style={{ fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>pending_actions</span>
                                        Verify Identity
                                    </Link>
                                )}
                            </div>
                        </div>
                    </section>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
                        {/* Personal Info */}
                        <section className="card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ background: 'var(--accent-peach)', color: 'var(--primary)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>person</span>
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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <Input
                                        label="First Name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Your first name"
                                    />
                                    <Input
                                        label="Last Name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Your last name"
                                    />
                                </div>
                                <Input
                                    label="Middle Name (Optional)"
                                    value={middleName}
                                    onChange={(e) => setMiddleName(e.target.value)}
                                    placeholder="Your middle name"
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
                                <div style={{ background: 'var(--accent-peach)', color: 'var(--primary)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>lock</span>
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
                                <div style={{ background: 'var(--accent-peach)', color: 'var(--primary)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>shield_person</span>
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

                    {/* Danger Zone */}
                    <section className="card" style={{ 
                        marginTop: '32px', 
                        padding: '32px', 
                        borderColor: 'rgba(239, 68, 68, 0.2)',
                        background: 'rgba(239, 68, 68, 0.02)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ background: '#fee2e2', color: '#ef4444', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>warning</span>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444' }}>Danger Zone</h3>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', fontWeight: 500 }}>
                            Manage your account visibility and data. Actions here are serious and permanent.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--warning)' }}>Disable Account</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Temporarily hide your profile.</p>
                                </div>
                                <Button 
                                    variant="outline" 
                                    style={{ width: 'auto', padding: '10px 20px', borderColor: 'var(--warning)', color: 'var(--warning)' }}
                                    onClick={() => { setDangerAction('disable'); setShowDangerModal(true); }}
                                >
                                    Disable
                                </Button>
                            </div>

                            <div style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>Delete Account</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Purge all your account data.</p>
                                </div>
                                <Button 
                                    variant="primary" 
                                    style={{ width: 'auto', padding: '10px 20px', background: '#ef4444', borderColor: '#ef4444' }}
                                    onClick={() => { setDangerAction('delete'); setShowDangerModal(true); }}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Danger Modal */}
                {showDangerModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        backdropFilter: 'blur(8px)'
                    }}>
                        <div style={{
                            background: 'var(--card-bg)',
                            width: '90%',
                            maxWidth: '500px',
                            padding: '40px',
                            borderRadius: '32px',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                            position: 'relative'
                        }}>
                            <button 
                                onClick={() => setShowDangerModal(false)}
                                style={{
                                    position: 'absolute',
                                    top: '24px',
                                    right: '24px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)'
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>close</span>
                            </button>

                            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-deep-brown)' }}>
                                {dangerAction === 'disable' ? 'Disable Account' : 'Request Deletion'}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 500 }}>
                                {dangerAction === 'disable' 
                                    ? 'Sorry to see you go! Please let us know why you are disabling your account.'
                                    : 'This action is irreversible. Your data will be scheduled for permanent deletion.'
                                }
                            </p>

                            <form onSubmit={handleDangerAction}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reason</label>
                                    <textarea
                                        style={{
                                            width: '100%',
                                            height: '120px',
                                            padding: '16px',
                                            borderRadius: '16px',
                                            background: 'var(--input-bg)',
                                            border: '1px solid var(--border-color)',
                                            color: 'var(--text-deep-brown)',
                                            fontFamily: 'inherit',
                                            fontSize: '1rem',
                                            resize: 'none'
                                        }}
                                        placeholder="Type your reason here..."
                                        value={actionReason}
                                        onChange={(e) => setActionReason(e.target.value)}
                                        required
                                    />
                                </div>

                                <Button 
                                    type="submit" 
                                    loading={loading}
                                    style={{ 
                                        width: '100%', 
                                        height: '56px', 
                                        background: dangerAction === 'disable' ? 'var(--warning)' : '#ef4444',
                                        borderColor: dangerAction === 'disable' ? 'var(--warning)' : '#ef4444'
                                    }}
                                >
                                    Confirm {dangerAction === 'disable' ? 'Deactivation' : 'Deletion'}
                                </Button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Profile;
