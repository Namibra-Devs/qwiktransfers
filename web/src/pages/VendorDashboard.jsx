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
                        <Button onClick={toggleStatus} style={{ width: 'auto', padding: '0 40px' }}>
                            Establish Connection
                        </Button>
                    </div>
                )}

                {isOnline && activeTab === 'pool' && (
                    <div className="card editorial-card">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Dispatch Pool</h2>
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
                                    {pool.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                                                No pending transactions in the pool right now.
                                            </td>
                                        </tr>
                                    ) : (
                                        pool.map(tx => (
                                            <tr key={tx.id} className="table-row">
                                                <td>
                                                    <div className="user-info">
                                                        <span className="name">{tx.User?.full_name || 'Customer'}</span>
                                                        <span className="acc">{tx.User?.phone || tx.id}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="amount-col">
                                                        {tx.currency} {parseFloat(tx.amount).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td>{tx.payment_method}</td>
                                                <td>
                                                    <span className="status-badge pending">Available</span>
                                                </td>
                                                <td>
                                                    <button 
                                                        onClick={() => acceptTransaction(tx.id)}
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
                                        <th>Amount to Pay</th>
                                        <th>Receiver Details</th>
                                        <th>Status</th>
                                        <th>Verification</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myTransactions.filter(tx => tx.status === 'processing').length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                                                You have no active operations. Claim a task from the pool!
                                            </td>
                                        </tr>
                                    ) : (
                                        myTransactions.filter(tx => tx.status === 'processing').map(tx => (
                                            <tr key={tx.id} className="table-row">
                                                <td>
                                                    <div className="user-info">
                                                        <span className="name">#{tx.id.split('-')[0].toUpperCase()}</span>
                                                        <span className="acc">{new Date(tx.created_at).toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="amount-col" style={{ color: 'var(--success)' }}>
                                                        {tx.currency} {parseFloat(tx.amount).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="user-info">
                                                        <span className="name">{tx.recipient_name}</span>
                                                        <span className="acc">{tx.recipient_bank} - {tx.recipient_account}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="status-badge processing">Processing</span>
                                                </td>
                                                <td>
                                                    <button 
                                                        onClick={() => completeTransaction(tx.id)}
                                                        className="complete-cta"
                                                    >
                                                        Verify Payment
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
            </main>

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
