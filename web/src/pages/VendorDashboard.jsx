import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const VendorDashboard = () => {
    const { user, logout, refreshProfile } = useAuth();
    const [isOnline, setIsOnline] = useState(user?.is_online || false);
    const [pool, setPool] = useState([]);
    const [myTransactions, setMyTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('pool');

    // Preview Modal States
    const [previewImage, setPreviewImage] = useState('');
    const [previewDate, setPreviewDate] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    // Detail Modal States
    const [showTxModal, setShowTxModal] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);

    // Profile & Settings States
    const [profileData, setProfileData] = useState({
        full_name: user?.full_name || '',
        phone: user?.phone || ''
    });
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [newPin, setNewPin] = useState({
        pin: '',
        confirm: ''
    });

    // PIN Verification States
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinToVerify, setPinToVerify] = useState('');
    const [pendingAction, setPendingAction] = useState(null); // { type: 'accept' | 'complete', id: string }

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            if (isOnline) fetchPool();
        }, 5000); // Poll every 5 seconds for new transactions
        return () => clearInterval(interval);
    }, [isOnline]);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchPool(), fetchMyTransactions()]);
        setLoading(false);
    };

    const fetchPool = async () => {
        try {
            const res = await api.get('/vendor/pool');
            setPool(res.data);
        } catch (error) {
            console.error('Pool fetch error:', error);
        }
    };

    const fetchMyTransactions = async () => {
        try {
            const res = await api.get('/vendor/transactions');
            setMyTransactions(res.data);
        } catch (error) {
            console.error('My transactions fetch error:', error);
        }
    };

    const toggleStatus = async () => {
        try {
            const res = await api.post('/vendor/toggle-status');
            setIsOnline(res.data.is_online);
            toast.success(res.data.is_online ? "You are now ONLINE" : "You are now OFFLINE");
            refreshProfile();
        } catch (error) {
            toast.error("Failed to toggle status");
        }
    };

    const acceptTransaction = async (transactionId) => {
        // If user has a PIN, we must verify it first
        if (user?.transaction_pin) {
            setPendingAction({ type: 'accept', id: transactionId });
            setShowPinModal(true);
            return;
        }

        try {
            await api.post('/vendor/accept', { transactionId });
            toast.success("Transaction claimed!");
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to claim transaction");
        }
    };

    const completeTransaction = async (transactionId) => {
        // Always require PIN for completion for security
        if (!user?.transaction_pin) {
            toast.error("Please set a security PIN in Settings before completing transfers.");
            setActiveTab('settings');
            return;
        }

        setPendingAction({ type: 'complete', id: transactionId });
        setShowPinModal(true);
    };

    const executeAcceptedTransaction = async (transactionId) => {
        try {
            await api.post('/vendor/accept', { transactionId });
            toast.success("Transaction claimed!");
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to claim transaction");
        }
    };

    const executeCompletedTransaction = async (transactionId) => {
        try {
            await api.post('/vendor/complete', { transactionId });
            toast.success("Transaction marked as completed");
            fetchData();
        } catch (error) {
            toast.error("Failed to complete transaction");
        }
    };

    const handlePinSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/verify-pin', { pin: pinToVerify });
            setShowPinModal(false);
            setPinToVerify('');

            if (pendingAction.type === 'accept') {
                await executeAcceptedTransaction(pendingAction.id);
            } else if (pendingAction.type === 'complete') {
                await executeCompletedTransaction(pendingAction.id);
            }
            setPendingAction(null);
        } catch (error) {
            toast.error(error.response?.data?.error || "Invalid PIN");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch('/auth/profile', profileData);
            toast.success("Profile updated successfully");
            refreshProfile();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!passwords.current) {
            return toast.error("Please enter your current password");
        }
        if (passwords.new.length < 6) {
            return toast.error("New password must be at least 6 characters long");
        }
        if (passwords.new !== passwords.confirm) {
            return toast.error("New passwords do not match");
        }
        setLoading(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            toast.success("Password changed successfully");
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    const handleSetPin = async (e) => {
        e.preventDefault();
        if (newPin.pin.length !== 4) {
            return toast.error("PIN must be exactly 4 digits");
        }
        if (newPin.pin !== newPin.confirm) {
            return toast.error("PINs do not match");
        }
        setLoading(true);
        try {
            await api.post('/auth/set-pin', { pin: newPin.pin });
            toast.success("Security PIN updated");
            setNewPin({ pin: '', confirm: '' });
            refreshProfile();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to set PIN");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setLoading(true);
        try {
            await api.post('/auth/avatar', formData);
            toast.success("Profile picture updated");
            refreshProfile();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to upload image");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <header style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>QWIK<span style={{ fontWeight: 400, opacity: 0.6 }}>VENDOR</span></h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f5f5f5', padding: '6px 16px', borderRadius: '20px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isOnline ? 'var(--success)' : '#ccc' }}></div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isOnline ? 'var(--text-deep-brown)' : 'var(--text-muted)' }}>
                            {isOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                        <button
                            onClick={toggleStatus}
                            style={{ marginLeft: '12px', padding: '4px 12px', borderRadius: '12px', border: 'none', background: isOnline ? 'var(--danger)' : 'var(--primary)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                            Go {isOnline ? 'Offline' : 'Online'}
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                    <div
                        onClick={() => setActiveTab('settings')}
                        style={{ textAlign: 'right', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', transition: 'all 0.2s', minWidth: '150px' }}
                        className="header-profile-toggle"
                    >
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.full_name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Verified Vendor</div>
                    </div>
                    <button
                        onClick={logout}
                        className="btn-outline"
                        style={{
                            padding: '8px 20px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            border: '1.5px solid var(--text-deep-brown)',
                            borderRadius: '10px',
                            background: 'transparent',
                            color: 'var(--text-deep-brown)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </header >

            <main>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <button
                        onClick={() => setActiveTab('pool')}
                        style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'pool' ? 'var(--text-deep-brown)' : '#fff', color: activeTab === 'pool' ? '#fff' : 'var(--text-deep-brown)', fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                    >
                        Available Pool ({pool.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('my')}
                        style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'my' ? 'var(--text-deep-brown)' : '#fff', color: activeTab === 'my' ? '#fff' : 'var(--text-deep-brown)', fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                    >
                        My Active Transfers ({myTransactions.filter(tx => tx.status === 'processing').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'settings' ? 'var(--text-deep-brown)' : '#fff', color: activeTab === 'settings' ? '#fff' : 'var(--text-deep-brown)', fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                    >
                        Security & Profile
                    </button>
                </div>

                {!isOnline && (
                    <div className="card" style={{ textAlign: 'center', padding: '60px', background: 'var(--accent-peach)', border: 'none' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💤</div>
                        <h2 style={{ color: 'var(--text-deep-brown)' }}>You are currently Offline</h2>
                        <p style={{ color: 'var(--text-deep-brown)', opacity: 0.7 }}>Go online to start receiving and processing client transactions.</p>
                        <button onClick={toggleStatus} className="btn-primary" style={{ marginTop: '24px' }}>Go Online Now</button>
                    </div>
                )}

                {isOnline && activeTab === 'pool' && (
                    <div className="card" style={{ padding: '0' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
                            <h3 style={{ margin: 0 }}>Dispatch Pool</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>First come, first served. Claim transactions quickly!</p>
                        </div>
                        <table style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th>Patient/User</th>
                                    <th>Amount</th>
                                    <th>Destination</th>
                                    <th>Proof status</th>
                                    <th style={{ textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pool.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No pending transactions in the pool. Waiting for customers...</td>
                                    </tr>
                                ) : (
                                    pool.map(tx => (
                                        <tr key={tx.id}>
                                            <td>
                                                <div style={{ fontWeight: 700 }}>{tx.user?.full_name}</div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{tx.user?.email}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{tx.amount_sent} GHS</div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Wait: {tx.amount_received} CAD</div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem' }}>{tx.recipient_details?.bank_name}</div>
                                                <div style={{ fontWeight: 600 }}>{tx.recipient_details?.phone}</div>
                                            </td>
                                            <td>
                                                {tx.proof_url ? (
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', background: '#d1fae5', padding: '4px 10px', borderRadius: '4px' }}>UPLOADED</span>
                                                ) : (
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706', background: '#fef3c7', padding: '4px 10px', borderRadius: '4px' }}>PENDING</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    onClick={() => acceptTransaction(tx.id)}
                                                    className="btn-primary"
                                                    style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                                                >
                                                    Claim & Process
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {isOnline && activeTab === 'my' && (
                    <div className="card" style={{ padding: '0' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
                            <h3 style={{ margin: 0 }}>Handled by me</h3>
                        </div>
                        <table style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Proof</th>
                                    <th style={{ textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myTransactions.map(tx => (
                                    <tr
                                        key={tx.id}
                                        onClick={() => {
                                            setSelectedTx(tx);
                                            setShowTxModal(true);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td>
                                            <div style={{ fontWeight: 700 }}>{tx.user?.full_name}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(tx.createdAt).toLocaleString()}</div>
                                        </td>
                                        <td>{tx.amount_sent} GHS</td>
                                        <td><span className={`badge badge-${tx.status}`}>{tx.status.toUpperCase()}</span></td>
                                        <td>
                                            {tx.proof_url ? (
                                                <span
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewImage(`http://localhost:5000${tx.proof_url}`);
                                                        setPreviewDate(tx.proof_uploaded_at || tx.updatedAt);
                                                        setShowPreviewModal(true);
                                                    }}
                                                    style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                                                >
                                                    View Proof
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {tx.status === 'processing' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        completeTransaction(tx.id);
                                                    }}
                                                    style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--success)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                                                >
                                                    Mark Completed
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {isOnline && activeTab === 'settings' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        <div className="card">
                            <h3 style={{ marginBottom: '20px' }}>Personal Profile</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                                <img
                                    src={user?.profile_picture ? `http://localhost:5000${user.profile_picture}` : 'https://ui-avatars.com/api/?name=' + user?.full_name}
                                    alt="Profile"
                                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-peach)' }}
                                />
                                <div>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        hidden
                                        onChange={handleAvatarUpload}
                                        accept="image/*"
                                    />
                                    <label htmlFor="avatar-upload" className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                        Change Picture
                                    </label>
                                </div>
                            </div>

                            <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                                <div style={{ marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Account Email</label>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.email}</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Joined</label>
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{new Date(user?.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Status</label>
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--success)' }}>Active Now</div>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateProfile}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Full Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={profileData.full_name}
                                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Phone Number</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>Update Profile</button>
                            </form>
                        </div>

                        <div className="card">
                            <h3 style={{ marginBottom: '20px' }}>Security Settings</h3>
                            <div style={{ marginBottom: '32px' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>Security PIN ({user?.transaction_pin ? 'Enabled' : 'Not Set'})</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Required for processing and completing any transaction.</p>
                                <form onSubmit={handleSetPin}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                        <input
                                            type="password"
                                            maxLength="4"
                                            placeholder="4-digit PIN"
                                            className="form-control"
                                            value={newPin.pin}
                                            onChange={(e) => setNewPin({ ...newPin, pin: e.target.value.replace(/\D/g, '') })}
                                            required
                                        />
                                        <input
                                            type="password"
                                            maxLength="4"
                                            placeholder="Confirm PIN"
                                            className="form-control"
                                            value={newPin.confirm}
                                            onChange={(e) => setNewPin({ ...newPin, confirm: e.target.value.replace(/\D/g, '') })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn-outline" disabled={loading} style={{ border: '1px solid var(--text-deep-brown)', width: '100%' }}>
                                        {loading ? 'Updating PIN...' : 'Update PIN'}
                                    </button>
                                </form>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>Update Password</h4>
                                <form onSubmit={handleChangePassword}>
                                    <div style={{ marginBottom: '12px' }}>
                                        <input
                                            type="password"
                                            placeholder="Current Password"
                                            className="form-control"
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <input
                                            type="password"
                                            placeholder="New Password"
                                            className="form-control"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <input
                                            type="password"
                                            placeholder="Confirm New Password"
                                            className="form-control"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn-outline" disabled={loading} style={{ border: '1px solid var(--text-deep-brown)', width: '100%' }}>
                                        {loading ? 'Changing...' : 'Change Password'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div >
                )}
            </main >

            {
                showPreviewModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(10px)' }}>
                        <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }} className="fade-in">
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                style={{ position: 'absolute', top: '-40px', right: '-40px', background: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 800, fontSize: '1.2rem' }}
                            >
                                &times;
                            </button>
                            {previewImage.endsWith('.pdf') ? (
                                <iframe src={previewImage} style={{ width: '80vw', height: '80vh', border: 'none', borderRadius: '12px' }} title="Proof PDF"></iframe>
                            ) : (
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                                />
                            )}
                            {previewDate && (
                                <div style={{ position: 'absolute', bottom: '-40px', left: 0, width: '100%', textAlign: 'center', color: 'white', fontWeight: 600 }}>
                                    Uploaded on: {new Date(previewDate).toLocaleString('en-US', {
                                        month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {
                showTxModal && selectedTx && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                        <div className="card scale-in" style={{ width: '100%', maxWidth: '500px', padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0 }}>Transaction Details</h3>
                                <button onClick={() => setShowTxModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>User</label>
                                        <div style={{ fontWeight: 700 }}>{selectedTx.user?.full_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedTx.user?.email}</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Status</label>
                                        <div style={{ marginTop: '4px' }}><span className={`badge badge-${selectedTx.status}`}>{selectedTx.status.toUpperCase()}</span></div>
                                    </div>
                                </div>

                                <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Recipient Details</label>
                                    <div style={{ marginTop: '8px', display: 'grid', gap: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '0.85rem' }}>Name:</span>
                                            <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '0.85rem' }}>Number:</span>
                                            <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.phone}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '0.85rem' }}>Bank/Provider:</span>
                                            <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.bank_name}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedTx.recipient_details?.payment_reference}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedTx.recipient_details?.note && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>User Note</label>
                                        <div style={{ fontSize: '0.9rem', fontStyle: 'italic', marginTop: '4px' }}>"{selectedTx.recipient_details?.note}"</div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => setShowTxModal(false)}
                                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Close
                                    </button>
                                    {selectedTx.status === 'processing' && (
                                        <button
                                            onClick={() => { completeTransaction(selectedTx.id); setShowTxModal(false); }}
                                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--success)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            Mark as Sent
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showPinModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
                        <div className="card" style={{ maxWidth: '360px', width: '90%', textAlign: 'center' }}>
                            <h3 style={{ marginBottom: '16px' }}>Authorize Transfer</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Enter your 4-digit security PIN to proceed with this action.</p>
                            <form onSubmit={handlePinSubmit}>
                                <input
                                    type="password"
                                    maxLength="4"
                                    value={pinToVerify}
                                    onChange={(e) => setPinToVerify(e.target.value.replace(/\D/g, ''))}
                                    style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '12px', marginBottom: '24px', width: '100%' }}
                                    placeholder="••••"
                                    autoFocus
                                    required
                                />
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" onClick={() => setShowPinModal(false)} className="btn-outline" style={{ border: '1px solid var(--border-color)', flex: 1 }}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
                                        {loading ? 'Verifying...' : 'Verify PIN'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default VendorDashboard;
