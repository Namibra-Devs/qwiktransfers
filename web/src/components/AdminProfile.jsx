import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../services/api';
import { toast } from 'react-hot-toast';

const AdminProfile = () => {
    const { user, refreshProfile } = useAuth();
    const [firstName, setFirstName] = useState(user?.first_name || '');
    const [middleName, setMiddleName] = useState(user?.middle_name || '');
    const [lastName, setLastName] = useState(user?.last_name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPin, setNewPin] = useState({ pin: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    const [qrCode, setQrCode] = useState(null);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [show2FASetup, setShow2FASetup] = useState(false);

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
            toast.success('Profile updated successfully!');
            if (refreshProfile) await refreshProfile();
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/change-password', { currentPassword, newPassword });
            toast.success('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to change password');
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
            toast.success('Avatar updated!');
            if (refreshProfile) await refreshProfile();
        } catch (error) {
            toast.error('Avatar upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSetPin = async (e) => {
        e.preventDefault();
        if (newPin.pin.length !== 4) {
            return toast.error('PIN must be exactly 4 digits');
        }
        if (newPin.pin !== newPin.confirm) {
            return toast.error('PINs do not match');
        }
        setLoading(true);
        try {
            await api.post('/auth/set-pin', { pin: newPin.pin });
            toast.success('Security PIN updated successfully!');
            setNewPin({ pin: '', confirm: '' });
            if (refreshProfile) await refreshProfile();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to set PIN');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate2FA = async () => {
        setLoading(true);
        try {
            const res = await api.post('/auth/2fa/generate');
            setQrCode(res.data.qr_code);
            setShow2FASetup(true);
        } catch (error) {
            toast.error('Failed to generate 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/2fa/verify', { token: twoFactorCode });
            toast.success('2FA Enabled!');
            setShow2FASetup(false);
            setTwoFactorCode('');
            if (refreshProfile) await refreshProfile();
        } catch (error) {
            toast.error('Invalid 2FA Code');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!window.confirm('Are you sure you want to disable 2FA? This makes your account less secure.')) return;
        setLoading(true);
        try {
            await api.post('/auth/2fa/disable');
            toast.success('2FA Disabled');
            if (refreshProfile) await refreshProfile();
        } catch (error) {
            toast.error('Failed to disable 2FA');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Admin Profile</h2>
                <p style={{ color: 'var(--text-muted)' }}>Manage your administrator account details.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                {/* Avatar Section */}
                <section className="card" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <div style={{ position: 'relative', cursor: 'pointer' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--accent-peach)' }}>
                            {user?.profile_picture ? (
                                <img
                                    src={getImageUrl(user.profile_picture)}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-peach)', color: 'var(--primary)', fontWeight: 900, fontSize: '2.5rem' }}>
                                    {(user?.first_name || user?.email || 'A')[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: '0px',
                            right: '0px',
                            background: 'var(--primary)',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid white',
                            color: 'white'
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add_a_photo</span>
                        </div>
                        <input
                            type="file"
                            onChange={(e) => handleAvatarUpload(e.target.files[0])}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                        />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Profile Picture</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Click the image to upload a new one.</p>
                    </div>
                </section>

                {/* Personal Info */}
                <section className="card">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>Personal Information</h3>
                    <form onSubmit={handleUpdateProfile}>
                        <div className="form-group">
                            <label>Email Address (Immutable)</label>
                            <input type="text" value={user?.email || ''} readOnly style={{ background: 'var(--accent-peach)', cursor: 'not-allowed', opacity: 0.8 }} />
                        </div>
                        <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label>First Name</label>
                                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
                            </div>
                            <div>
                                <label>Last Name</label>
                                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Middle Name (Optional)</label>
                            <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Moro" />
                        </div>
                        <div className="form-group" style={{ marginBottom: '32px' }}>
                            <label>Phone Number</label>
                            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233..." />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: 'auto', padding: '12px 32px' }}>
                            {loading ? 'Saving...' : 'Update Profile'}
                        </button>
                    </form>
                </section>

                {/* Security */}
                <section className="card">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>Security</h3>
                    <form onSubmit={handleChangePassword}>
                        <div className="form-group">
                            <label>Current Password</label>
                            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" required />
                        </div>
                        <div className="form-group" style={{ marginBottom: '32px' }}>
                            <label>New Password</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" required />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: 'auto', padding: '12px 32px' }}>
                            {loading ? 'Updating...' : 'Change Password'}
                        </button>
                    </form>
                </section>

                {/* Two Factor Authentication */}
                <section className="card">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Two-Factor Authentication (2FA)</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                        Protect your admin account with an authenticator app (like Google Authenticator or Authy).
                    </p>
                    
                    {user?.two_factor_enabled ? (
                        <div style={{ padding: '16px', background: 'rgba(5, 150, 105, 0.1)', borderRadius: '8px', border: '1px solid var(--success)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ color: 'var(--success)', margin: '0 0 4px 0' }}>2FA is Currently Enabled</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Your account is highly secure.</p>
                                </div>
                                <button onClick={handleDisable2FA} disabled={loading} className="btn-primary" style={{ width: 'auto', padding: '8px 16px', background: 'var(--danger)', border: 'none' }}>
                                    Disable 2FA
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {!show2FASetup ? (
                                <button onClick={handleGenerate2FA} disabled={loading} className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
                                    Setup 2FA Now
                                </button>
                            ) : (
                                <div style={{ border: '1px dashed var(--border-color)', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                                    <h4 style={{ margin: '0 0 16px 0' }}>Scan this QR Code</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>Open your Authenticator app and scan this code.</p>
                                    <img src={qrCode} alt="2FA QR Code" style={{ background: '#fff', padding: '8px', borderRadius: '8px', marginBottom: '24px', width: '200px', height: '200px' }} />
                                    
                                    <form onSubmit={handleVerify2FA} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px', margin: '0 auto' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Enter 6-digit code" 
                                            maxLength="6"
                                            value={twoFactorCode}
                                            onChange={(e) => setTwoFactorCode(e.target.value)}
                                            style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '2px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                            required
                                        />
                                        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
                                            {loading ? 'Verifying...' : 'Enable 2FA'}
                                        </button>
                                        <button type="button" onClick={() => setShow2FASetup(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>
                                            Cancel Setup
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Transaction PIN */}
                <section className="card">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Security PIN</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                        Required when manually confirming transactions as an Admin override.
                    </p>
                    <form onSubmit={handleSetPin}>
                        <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                            <div>
                                <label>New 4-Digit PIN</label>
                                <input 
                                    type="password" 
                                    maxLength="4" 
                                    pattern="\d{4}" 
                                    value={newPin.pin} 
                                    onChange={(e) => setNewPin({ ...newPin, pin: e.target.value.replace(/\D/g, '') })} 
                                    placeholder="••••" 
                                    required 
                                />
                            </div>
                            <div>
                                <label>Confirm PIN</label>
                                <input 
                                    type="password" 
                                    maxLength="4" 
                                    pattern="\d{4}" 
                                    value={newPin.confirm} 
                                    onChange={(e) => setNewPin({ ...newPin, confirm: e.target.value.replace(/\D/g, '') })} 
                                    placeholder="••••" 
                                    required 
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: 'auto', padding: '12px 32px', background: 'var(--accent-peach)', color: 'var(--primary)' }}>
                            {loading ? 'Saving...' : 'Set PIN'}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default AdminProfile;
