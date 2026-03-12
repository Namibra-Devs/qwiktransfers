import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../services/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ThemeSwitcher from '../components/ThemeSwitcher';
import NotificationPanel from '../components/NotificationPanel';
import Button from '../components/Button';
import Input from '../components/Input';

const VendorDashboard = () => {
    const { user, logout, refreshProfile } = useAuth();
    const [isOnline, setIsOnline] = useState(user?.is_online || false);
    const [pool, setPool] = useState([]);
    const [myTransactions, setMyTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [poolLoading, setPoolLoading] = useState(false);
    const [myTxLoading, setMyTxLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('pool');

    const [config, setConfig] = useState({
        system_name: 'QWIK',
        system_logo: ''
    });

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
        if (showTxModal || showPreviewModal || showPinModal) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    }, [showTxModal, showPreviewModal, showPinModal]);

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
        fetchData();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isOnline) fetchPool();
        }, 5000);
        return () => clearInterval(interval);
    }, [isOnline]);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchPool(), fetchMyTransactions()]);
        setLoading(false);
    };

    const fetchPool = async () => {
        setPoolLoading(true);
        try {
            const res = await api.get('/vendor/pool');
            setPool(res.data);
        } catch (error) {
            console.error('Pool fetch error:', error);
        } finally {
            setPoolLoading(false);
        }
    };

    const fetchMyTransactions = async () => {
        setMyTxLoading(true);
        try {
            const res = await api.get('/vendor/transactions');
            setMyTransactions(res.data);
        } catch (error) {
            console.error('My transactions fetch error:', error);
        } finally {
            setMyTxLoading(false);
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'just now';

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    const getCountryBadge = (country) => {
        if (!country) return null;
        
        const countryMap = {
            'Ghana': { flag: '🇬🇭', label: 'Ghana' },
            'Canada': { flag: '🇨🇦', label: 'Canada' },
            'Nigeria': { flag: '🇳🇬', label: 'Nigeria' },
            'UK': { flag: '🇬🇧', label: 'UK' },
            'USA': { flag: '🇺🇸', label: 'USA' }
        };
        
        const cData = countryMap[country] || { flag: '🌍', label: country };
        
        return (
            <span style={{ 
                background: 'rgba(183, 71, 42, 0.1)', 
                color: 'var(--primary)', 
                padding: '4px 10px', 
                borderRadius: '8px', 
                fontSize: '0.8rem', 
                fontWeight: 800, 
                marginLeft: '12px',
                verticalAlign: 'middle',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
            }}>
                {cData.flag} {cData.label} Region
            </span>
        );
    };

    const TableSkeleton = ({ rows = 5, cols = 5 }) => (
        <>
            {[...Array(rows)].map((_, i) => (
                <tr key={i} className="skeleton-row">
                    {[...Array(cols)].map((_, j) => (
                        <td key={j}>
                            <div className="skeleton-box" style={{ height: '24px', width: j === 0 ? '150px' : '100px', borderRadius: '4px' }}></div>
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );

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
        if (!user?.transaction_pin) {
            toast.error("Please set a security PIN in Profile Settings before completing transfers.");
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
            await api.post('/auth/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
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
                        <span className="brand-badge vendor">VENDOR</span>
                    </Link>
                </div>

                <div className="dashboard-actions">
                    <div className="vendor-status-pill">
                        <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
                        <span className="status-text">{isOnline ? 'Online' : 'Offline'}</span>
                        <button onClick={toggleStatus} className={`status-toggle ${isOnline ? 'on' : 'off'}`}>
                            {isOnline ? 'Go Offline' : 'Go Online'}
                        </button>
                    </div>

                    <div className="header-utilities">
                        <NotificationPanel />
                        <ThemeSwitcher />

                        <Link to="/profile" className="user-profile-pill">
                            <div className="profile-details">
                                <span className="user-name">{user?.full_name || user?.email?.split('@')[0]}</span>
                                <span className="user-acc">{user?.account_number || 'ID: QT-VENDOR'}</span>
                            </div>
                            {user?.profile_picture ? (
                                <img
                                    src={getImageUrl(user.profile_picture)}
                                    alt="Avatar"
                                    className="user-avatar"
                                />
                            ) : (
                                <div className="user-avatar-placeholder">
                                    {(user?.full_name || user?.email || 'V')[0].toUpperCase()}
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

            <main className="dashboard-main">
                <div className="vendor-stats-grid">
                    <div className="stat-card">
                        <span className="label">Successful Payouts</span>
                        <span className="value">{myTransactions.filter(tx => tx.status === 'completed').length}</span>
                        <div className="accent-bar green"></div>
                    </div>
                    <div className="stat-card">
                        <span className="label">Processing Now</span>
                        <span className="value">{myTransactions.filter(tx => tx.status === 'processing').length}</span>
                        <div className="accent-bar yellow"></div>
                    </div>
                    <div className="stat-card">
                        <span className="label">Verified Status</span>
                        <span className="value success">LEVEL 2</span>
                        <div className="accent-bar blue"></div>
                    </div>
                </div>

                <div className="tab-navigation">
                    <button
                        onClick={() => setActiveTab('pool')}
                        className={`tab-btn ${activeTab === 'pool' ? 'active' : ''}`}
                    >
                        Available Pool ({pool.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
                    >
                        My Operations ({myTransactions.filter(tx => tx.status === 'processing').length})
                    </button>
                </div>

                {!isOnline && (
                    <div className="card offline-notice" style={{ textAlign: 'center', padding: '80px 40px' }}>
                        <div className="offline-icon">💤</div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>You're currently Offline</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1.1rem' }}>
                            Claim and process customer transactions by going online.
                        </p>
                        <Button onClick={toggleStatus} style={{
                            width: '100%',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            borderRadius: '50px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}>
                            Establish Connection
                        </Button>
                    </div>
                )}

                {isOnline && activeTab === 'pool' && (
                    <div className="card editorial-card">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                                    Dispatch Pool
                                    {getCountryBadge(user?.country)}
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    First come, first served. Claim transactions quickly!
                                </p>
                            </div>
                            <button onClick={fetchPool} className="refresh-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 700 }}>
                                ↻ Refresh Pool
                            </button>
                        </div>

                        <div className="table-responsive">
                            <table className="editorial-table">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {poolLoading ? (
                                        <TableSkeleton rows={5} cols={5} />
                                    ) : pool.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                                                No pending transactions in the pool right now.
                                            </td>
                                        </tr>
                                    ) : (
                                        pool.map(tx => (
                                            <tr key={tx.id} className="table-row" onClick={() => { setSelectedTx(tx); setShowTxModal(true); }} style={{ cursor: 'pointer' }}>
                                                <td>
                                                    <div className="user-info">
                                                        <span className="name">{tx.user?.full_name || 'Customer'}</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span className="acc" style={{ fontSize: '0.75rem' }}>{tx.user?.phone || `#${String(tx.transaction_id).toUpperCase()}`}</span>
                                                            <span style={{
                                                                fontSize: '0.7rem',
                                                                color: 'var(--primary)',
                                                                background: 'rgba(183, 71, 42, 0.08)',
                                                                padding: '2px 8px',
                                                                borderRadius: '10px',
                                                                fontWeight: 700
                                                            }}>
                                                                {formatTimeAgo(tx.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                                        {tx.amount_sent} {tx.type?.split('-')[0] || 'GHS'}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                                        {tx.type} | Rate: {tx.exchange_rate}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                                                        {tx.recipient_details?.type === 'momo' ? (tx.recipient_details?.momo_provider || 'Momo') :
                                                            tx.recipient_details?.type === 'bank' ? (tx.recipient_details?.bank_name || 'Bank') :
                                                                tx.recipient_details?.type === 'interac' ? 'Interac' : 'Recipient'}
                                                    </div>
                                                    <div style={{ fontWeight: 700 }}>
                                                        {tx.recipient_details?.account || tx.recipient_details?.interac_email || tx.recipient_details?.phone}
                                                    </div>
                                                </td>
                                                <td>
                                                    {tx.proof_url ? (
                                                        <span className="status-badge completed">Proof Attached</span>
                                                    ) : (
                                                        <span className="status-badge pending">Awaiting Proof</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            acceptTransaction(tx.id);
                                                        }}
                                                        className="complete-cta"
                                                        style={{ background: 'var(--secondary)' }}
                                                    >
                                                        Claim Task
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {isOnline && activeTab === 'my' && (
                    <div className="card editorial-card">
                        <div className="card-header" style={{ marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My Operations</h2>
                        </div>

                        <div className="table-responsive">
                            <table className="editorial-table">
                                <thead>
                                    <tr>
                                        <th>Reference</th>
                                        <th>User</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Verification</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myTxLoading ? (
                                        <TableSkeleton rows={3} cols={5} />
                                    ) : myTransactions.filter(tx => tx.status === 'processing').length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                                                You have no active operations. Claim a task from the pool!
                                            </td>
                                        </tr>
                                    ) : (
                                        myTransactions.filter(tx => tx.status === 'processing').map(tx => (
                                            <tr key={tx.id} className="table-row" onClick={() => { setSelectedTx(tx); setShowTxModal(true); }} style={{ cursor: 'pointer' }}>
                                                <td>
                                                    <div className="user-info">
                                                        <span className="name">#{tx.transaction_id}</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span className="acc" style={{ fontSize: '0.75rem' }}>{new Date(tx.createdAt).toLocaleDateString()}</span>
                                                            <span style={{
                                                                fontSize: '0.7rem',
                                                                color: 'var(--primary)',
                                                                background: 'rgba(183, 71, 42, 0.08)',
                                                                padding: '2px 8px',
                                                                borderRadius: '10px',
                                                                fontWeight: 700
                                                            }}>
                                                                {formatTimeAgo(tx.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 700 }}>{tx.user?.full_name}</div>
                                                </td>
                                                <td>
                                                    <div className="amount-col" style={{ color: 'var(--success)' }}>
                                                        {tx.type?.split('-')[0] || 'GHS'} {parseFloat(tx.amount_sent || 0).toLocaleString()}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                                        {tx.amount_received} {tx.type?.split('-')[1] || 'CAD'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${tx.status}`}>{tx.status}</span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                completeTransaction(tx.id);
                                                            }}
                                                            className="complete-cta"
                                                        >
                                                            Verify Payment
                                                        </button>
                                                        {tx.proof_url && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setPreviewImage(tx.proof_url);
                                                                    setShowPreviewModal(true);
                                                                }}
                                                                className="sign-out-btn"
                                                                style={{ padding: '8px', color: 'var(--primary)' }}
                                                                title="View Proof"
                                                            >
                                                                📄
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Transaction Details Modal */}
            {showTxModal && selectedTx && (
                <div className="modal-overlay" onClick={() => setShowTxModal(false)}>
                    <div className="modal-content glass" style={{ maxWidth: '650px', width: '95%', padding: '0', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        {/* Modal Header/Upper Section */}
                        <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h1 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary)' }}>Transaction Breakdown</h1>
                                <button onClick={() => setShowTxModal(false)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 800 }}>×</button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>User</label>
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>{selectedTx.user?.full_name || 'N/A'}</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{selectedTx.user?.email || 'N/A'}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Status</label>
                                    <span className={`status-badge ${selectedTx.status}`} style={{ margin: 0, padding: '8px 20px', borderRadius: '30px' }}>{selectedTx.status}</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Initiated At</label>
                                    <p style={{ fontWeight: 700, fontSize: '1rem' }}>{new Date(selectedTx.createdAt).toLocaleString()}</p>
                                </div>
                                {selectedTx.status === 'sent' && (
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Sent Date</label>
                                        <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--success)' }}>{new Date(selectedTx.updatedAt).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-body" style={{ padding: '24px 32px 32px' }}>
                            {/* Financial Summary Card */}
                            <div style={{
                                background: 'white',
                                border: '1px solid var(--border-color)',
                                borderRadius: '16px',
                                padding: '24px',
                                marginBottom: '24px'
                            }}>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '20px' }}>Financial Summary</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Currency Pair</label>
                                        <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>{selectedTx.type?.split('-')[0]} → {selectedTx.type?.split('-')[1]}</p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Exchange Rate</label>
                                        <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                                            1 {selectedTx.type?.split('-')[0]} = {selectedTx.exchange_rate} {selectedTx.type?.split('-')[1]}
                                        </p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Amount Sent</label>
                                        <p style={{ fontWeight: 800, fontSize: '1.4rem' }}>{selectedTx.amount_sent} {selectedTx.type?.split('-')[0]}</p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>To Recipient</label>
                                        <p style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>{selectedTx.amount_received} {selectedTx.type?.split('-')[1]}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recipient Details Card */}
                            <div style={{
                                background: 'var(--bg-main)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '16px',
                                padding: '24px',
                                marginBottom: '24px',
                                position: 'relative',
                                background: 'rgba(0,0,0,0.015)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recipient Details</h4>
                                    <span style={{
                                        background: 'var(--secondary)',
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        textTransform: 'uppercase'
                                    }}>
                                        {selectedTx.recipient_details?.type || 'Bank'}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Full Name:</span>
                                        <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.name || 'N/A'}</span>
                                    </div>

                                    {selectedTx.recipient_details?.type === 'momo' && (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Provider:</span>
                                                <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.momo_provider || 'N/A'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Wallet / Phone:</span>
                                                <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.account || selectedTx.recipient_details?.phone || 'N/A'}</span>
                                            </div>
                                        </>
                                    )}

                                    {selectedTx.recipient_details?.type === 'bank' && (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Bank Name:</span>
                                                <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.bank_name || 'N/A'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Account Number:</span>
                                                <span style={{ fontWeight: 700, letterSpacing: '1px' }}>{selectedTx.recipient_details?.account || 'N/A'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Transit Number:</span>
                                                <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.transit_number || 'N/A'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Institution:</span>
                                                <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.institution_number || 'N/A'}</span>
                                            </div>
                                        </>
                                    )}

                                    {selectedTx.recipient_details?.type === 'interac' && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Interac Email:</span>
                                            <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.interac_email || 'N/A'}</span>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Reference:</span>
                                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{selectedTx.recipient_details?.admin_reference || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* User Note Section */}
                            {selectedTx.recipient_details?.note && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>User Note</h4>
                                    <div style={{
                                        padding: '16px 20px',
                                        borderRadius: '12px',
                                        border: '1px dashed var(--border-color)',
                                        background: 'rgba(0,0,0,0.01)',
                                        fontStyle: 'italic',
                                        color: 'var(--secondary)'
                                    }}>
                                        "{selectedTx.recipient_details.note}"
                                    </div>
                                </div>
                            )}

                            {/* Payment Proof Section */}
                            {selectedTx.proof_url && (
                                <div style={{ marginBottom: '32px' }}>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Payment Verification Proof</h4>
                                    <div
                                        onClick={() => { setPreviewImage(selectedTx.proof_url); setShowPreviewModal(true); }}
                                        style={{
                                            cursor: 'pointer',
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            border: '1px solid var(--border-color)',
                                            height: '140px',
                                            position: 'relative',
                                            background: 'var(--bg-main)'
                                        }}
                                    >
                                        <img src={getImageUrl(selectedTx.proof_url.startsWith('http') ? selectedTx.proof_url : `/${selectedTx.proof_url}`)} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.4))', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '16px', color: 'white', fontWeight: 700 }}>
                                            <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '30px', fontSize: '0.8rem' }}>Click to View Full Receipt ↗</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <Button variant="outline" onClick={() => setShowTxModal(false)} style={{ flex: 1, height: '54px', fontWeight: 700 }}>Close View</Button>
                                {selectedTx.status === 'processing' && (
                                    <Button
                                        onClick={() => {
                                            setShowTxModal(false);
                                            completeTransaction(selectedTx.id);
                                        }}
                                        style={{ flex: 1.5, height: '54px', fontWeight: 800, background: 'var(--success)' }}
                                    >
                                        Verify & Mark as Sent
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Proof Preview Modal */}
            {showPreviewModal && (
                <div className="modal-overlay" onClick={() => setShowPreviewModal(false)} style={{ zIndex: 11000 }}>
                    <div className="modal-content glass" style={{ maxWidth: '90vw', maxHeight: '90vh', padding: '20px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                            <button onClick={() => setShowPreviewModal(false)} style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 800 }}>×</button>
                        </div>
                        <img
                            src={getImageUrl(previewImage.startsWith('http') ? previewImage : `/${previewImage}`)}
                            alt="Payment Proof Preview"
                            style={{ borderRadius: '12px', maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                        />
                    </div>
                </div>
            )}

            {/* PIN Verification Modal */}
            {showPinModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass" style={{ maxWidth: '400px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🛡️</div>
                            <h3 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>Security Verification</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                                {pendingAction?.type === 'accept'
                                    ? 'Confirm you want to claim this transaction.'
                                    : 'Authorize the completion of this transfer.'}
                            </p>
                        </div>

                        <form onSubmit={handlePinSubmit}>
                            <div style={{ position: 'relative', marginBottom: '32px' }}>
                                <input
                                    type="password"
                                    maxLength="4"
                                    value={pinToVerify}
                                    onChange={(e) => setPinToVerify(e.target.value.replace(/\D/g, ''))}
                                    style={{
                                        textAlign: 'center',
                                        fontSize: '2.5rem',
                                        letterSpacing: '16px',
                                        width: '100%',
                                        background: 'rgba(0,0,0,0.03)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '16px',
                                        padding: '20px 0'
                                    }}
                                    placeholder="••••"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Button variant="outline" onClick={() => { setShowPinModal(false); setPinToVerify(''); }} type="button" style={{ flex: 1 }}>
                                    Cancel
                                </Button>
                                <Button type="submit" loading={loading} style={{ flex: 1 }}>
                                    {loading ? 'Verifying...' : 'Authorize'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;
