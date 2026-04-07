import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../services/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DashboardHeader from '../components/DashboardHeader';
import NotificationPanel from '../components/NotificationPanel';
import Button from '../components/Button';
import Input from '../components/Input';

const formatUserName = (userObj) => {
    if (!userObj) return 'N/A';
    if (userObj.first_name || userObj.last_name) {
        const parts = [userObj.first_name, userObj.middle_name, userObj.last_name].filter(Boolean);
        if (parts.length > 0) return parts.join(' ');
    }
    return userObj.full_name || 'N/A';
};

const VendorDashboard = () => {
    const { user, logout, refreshProfile } = useAuth();
    const [isOnline, setIsOnline] = useState(user?.is_online || false);
    const [pool, setPool] = useState([]);
    const [myTransactions, setMyTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isGlobalLoading, setIsGlobalLoading] = useState(false);
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
        first_name: user?.first_name || '',
        middle_name: user?.middle_name || '',
        last_name: user?.last_name || '',
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

    // Fulfillment Proof States (Vendor Proof)
    const [showFulfillmentModal, setShowFulfillmentModal] = useState(false);
    const [fulfillmentFile, setFulfillmentFile] = useState(null);
    const [fulfillmentPreview, setFulfillmentPreview] = useState(null);
    const [targetTxForFulfillment, setTargetTxForFulfillment] = useState(null);

    // PIN Verification States
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinToVerify, setPinToVerify] = useState('');
    const [pendingAction, setPendingAction] = useState(null); // { type: 'accept' | 'complete' | 'reject', id: string }

    // Rejection Modal States
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [targetTxForRejection, setTargetTxForRejection] = useState(null);

    useEffect(() => {
        if (showTxModal || showPreviewModal || showPinModal || showRejectModal || showFulfillmentModal) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    }, [showTxModal, showPreviewModal, showPinModal, showRejectModal, showFulfillmentModal]);

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

        const cData = country === 'Canada' ? { icon: 'map', label: 'Canada' } : 
                      country === 'Ghana' ? { icon: 'map', label: 'Ghana' } : 
                      { icon: 'public', label: country };

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
                gap: '6px'
            }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{cData.icon}</span>
                {cData.label} Region
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


    const executeAcceptedTransaction = async (transactionId) => {
        try {
            await api.post('/vendor/accept', { transactionId });
            toast.success("Transaction claimed!");
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to claim transaction");
        }
    };

    const executeSentTransaction = async (transactionId, proofUrl) => {
        try {
            await api.post('/vendor/complete', { transactionId, proof_url: proofUrl });
            toast.success("Transaction marked as sent and proof uploaded");
            setShowFulfillmentModal(false);
            setFulfillmentFile(null);
            setTargetTxForFulfillment(null);
            setPendingAction(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to complete transaction");
        } finally {
            setIsGlobalLoading(false);
        }
    };

    const handleFulfillmentSubmit = async (e) => {
        e.preventDefault();
        if (!fulfillmentFile) {
            return toast.error("Please upload the payment proof to continue");
        }

        // Instead of uploading right away, we now trigger the PIN modal
        setShowFulfillmentModal(false);
        setPendingAction({ type: 'complete', id: targetTxForFulfillment });
        setShowPinModal(true);
    };

    const finalizeFulfillment = async () => {
        const formData = new FormData();
        formData.append('proof', fulfillmentFile);

        try {
            // Step 1: Upload the file
            const uploadRes = await api.post('/vendor/upload-proof', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const proofUrl = uploadRes.data.proof_url;

            // Step 2: Complete the transaction with the proof URL
            await executeSentTransaction(targetTxForFulfillment, proofUrl);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to finalize fulfillment");
            setIsGlobalLoading(false);
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
                setIsGlobalLoading(true); // Trigger processing overlay
                await finalizeFulfillment();
            } else if (pendingAction.type === 'reject') {
                setShowRejectModal(true);
                setTargetTxForRejection(pendingAction.id);
            }
            if (pendingAction.type !== 'reject' && pendingAction.type !== 'complete') {
                setPendingAction(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Invalid PIN");
        } finally {
            setLoading(false);
            // Note: isGlobalLoading is turned off in executeSentTransaction or finalizeFulfillment error
        }
    };

    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        if (!rejectionReason.trim()) {
            return toast.error("Please provide a reason for rejection");
        }

        setLoading(true);
        try {
            await api.post('/vendor/reject', {
                transactionId: targetTxForRejection,
                reason: rejectionReason
            });
            toast.success("Transaction rejected and returned to pool");
            setShowRejectModal(false);
            setRejectionReason('');
            setTargetTxForRejection(null);
            setPendingAction(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to reject transaction");
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
            {isGlobalLoading && (
                <div className="modal-overlay" style={{ zIndex: 20000 }}>
                    <div className="modal-content glass" style={{ padding: '40px', textAlign: 'center', maxWidth: '350px' }}>
                        <div className="spinner" style={{ margin: '0 auto 20px', width: '50px', height: '50px', border: '4px solid var(--accent-peach)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <p style={{ fontWeight: 800, color: 'var(--text-deep-brown)', fontSize: '1.1rem' }}>Securing your session...</p>
                    </div>
                </div>
            )}

            <DashboardHeader
                user={user}
                logout={logout}
                config={config}
                type="vendor"
                extraActions={
                    <div className="vendor-status-pill">
                        <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
                        <span className="status-text">{isOnline ? 'Online' : 'Offline'}</span>
                        <button onClick={toggleStatus} className={`status-toggle ${isOnline ? 'on' : 'off'}`}>
                            {isOnline ? 'Go Offline' : 'Go Online'}
                        </button>
                    </div>
                }
            />

            <main className="dashboard-main">
                <div className="bento-grid">
                    <div className="glass-card premium-stat-card">
                        <div className="accent-glow green"></div>
                        <span className="label">Successful Payouts</span>
                        <span className="value">{myTransactions.filter(tx => tx.status === 'sent').length}</span>
                    </div>
                    <div className="glass-card premium-stat-card">
                        <div className="accent-glow yellow"></div>
                        <span className="label">Processing Now</span>
                        <span className="value">{myTransactions.filter(tx => tx.status === 'processing').length}</span>
                    </div>
                    <div className="glass-card premium-stat-card">
                        <div className="accent-glow blue"></div>
                        <span className="label">Verified Status</span>
                        <span className="value">LEVEL 2</span>
                    </div>
                </div>

                <div className="pill-tab-switcher">
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
                        Active Operations ({myTransactions.filter(tx => tx.status === 'processing').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    >
                        History ({myTransactions.filter(tx => tx.status === 'sent').length})
                    </button>
                </div>

                {!isOnline && (
                    <div className="glass-card" style={{
                        margin: '40px 0',
                        textAlign: 'center',
                        padding: '60px 40px',
                        border: '2px dashed var(--border-color)',
                        background: 'rgba(183, 71, 42, 0.03)'
                    }}>
                        <div style={{ background: 'var(--accent-peach)', color: 'var(--primary)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '4rem' }}>power_settings_new</span>
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-deep-brown)', marginBottom: '16px' }}>Offline Mode Active</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.6 }}>
                            You are currently set to offline. While offline, you won't receive new transactions from the pool. Switch online to start claiming tasks.
                        </p>
                        <button
                            className="complete-cta"
                            onClick={toggleStatus}
                            style={{ padding: '16px 40px', fontSize: '1rem', width: 'auto', borderRadius: '16px' }}
                        >
                            Establish Connection
                        </button>
                    </div>
                )}

                {isOnline && activeTab === 'pool' && (
                    <div className="glass-card premium-table-card">
                        <div className="card-header" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', width: '100%' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Dispatch Pool</h2>
                                        {getCountryBadge(user?.country)}
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                                        First come, first served. Claim transactions quickly!
                                    </p>
                                </div>
                                <button 
                                    onClick={fetchPool} 
                                    className="refresh-btn" 
                                    style={{ 
                                        display: 'inline-flex', 
                                        padding: '12px 24px', 
                                        borderRadius: '14px', 
                                        fontSize: '0.85rem', 
                                        fontWeight: 800, 
                                        gap: '8px', 
                                        alignItems: 'center',
                                        backgroundColor: 'rgba(183, 71, 42, 0.05)',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--primary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        height: 'fit-content'
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>refresh</span>
                                    Refresh Pool
                                </button>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="premium-table">
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
                                                        <span className="name" style={{ fontWeight: 800 }}>{tx.user ? formatUserName(tx.user) : 'Customer'}</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span className="acc" style={{ fontSize: '0.75rem', opacity: 0.7 }}>{tx.user?.phone || `#${String(tx.transaction_id).toUpperCase()}`}</span>
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
                                                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>
                                                        {tx.amount_sent} {tx.type?.split('-')[0] || 'GHS'}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 600 }}>
                                                        {tx.type} | Rate: {tx.exchange_rate}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>
                                                        {tx.recipient_details?.type === 'momo' ? (tx.recipient_details?.momo_provider || 'Momo') :
                                                            tx.recipient_details?.type === 'bank' ? (tx.recipient_details?.bank_name || 'Bank') :
                                                                tx.recipient_details?.type === 'interac' ? 'Interac' : 'Recipient'}
                                                    </div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                                        {tx.recipient_details?.account || tx.recipient_details?.interac_email || tx.recipient_details?.phone}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {tx.rejection_reason && (
                                                            <span className="status-badge pending" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                                                                Returned
                                                            </span>
                                                        )}
                                                        {tx.proof_url ? (
                                                            <span className="status-badge sent" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}>Proof Attached</span>
                                                        ) : (
                                                            <span className="status-badge pending">Awaiting Proof</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            acceptTransaction(tx.id);
                                                        }}
                                                        className="complete-cta"
                                                        style={{
                                                            background: 'var(--secondary)',
                                                            padding: '10px 20px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.85rem',
                                                            width: 'auto'
                                                        }}
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
                    <div className="glass-card premium-table-card">
                        <div className="card-header">
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Active Operations</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tasks you are currently processing.</p>
                        </div>

                        <div className="table-responsive">
                            <table className="premium-table">
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
                                                        <span className="name" style={{ fontWeight: 800 }}>#{tx.transaction_id}</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span className="acc" style={{ fontSize: '0.75rem', opacity: 0.7 }}>{new Date(tx.createdAt).toLocaleDateString()}</span>
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
                                                    <div style={{ fontWeight: 800 }}>{formatUserName(tx.user)}</div>
                                                </td>
                                                <td>
                                                    <div className="amount-col" style={{ color: 'var(--success)', fontWeight: 800, fontSize: '1.1rem' }}>
                                                        {tx.type?.split('-')[0] || 'GHS'} {parseFloat(tx.amount_sent || 0).toLocaleString()}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 600 }}>
                                                        {tx.amount_received} {tx.type?.split('-')[1] || 'CAD'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${tx.status}`}>
                                                        {tx.status === 'sent' ? 'Sent' : tx.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!user?.transaction_pin) {
                                                                    toast.error("Please set a security PIN in Profile Settings before rejecting transfers.");
                                                                    return;
                                                                }
                                                                setPendingAction({ type: 'reject', id: tx.id });
                                                                setShowPinModal(true);
                                                            }}
                                                            className="sign-out-btn"
                                                            style={{
                                                                padding: '8px 16px',
                                                                color: 'var(--primary)',
                                                                fontWeight: 700,
                                                                fontSize: '0.8rem',
                                                                border: '1px solid var(--border-color)',
                                                                borderRadius: '10px'
                                                            }}
                                                            title="Reject Claim"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setTargetTxForFulfillment(tx.id);
                                                                setShowFulfillmentModal(true);
                                                            }}
                                                            style={{ padding: '8px 16px', borderRadius: '10px' }}
                                                        >
                                                            Verify Payment
                                                        </button>
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

                {isOnline && activeTab === 'history' && (
                    <div className="glass-card premium-table-card">
                        <div className="card-header">
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Fulfillment History</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your successfully sent transactions.</p>
                        </div>

                        <div className="table-responsive">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Reference</th>
                                        <th>User</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Receipt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myTxLoading ? (
                                        <TableSkeleton rows={3} cols={5} />
                                    ) : myTransactions.filter(tx => tx.status === 'sent').length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                                                Your fulfillment history is empty. Complete a task to see it here!
                                            </td>
                                        </tr>
                                    ) : (
                                        myTransactions.filter(tx => tx.status === 'sent').map(tx => (
                                            <tr key={tx.id} className="table-row" onClick={() => { setSelectedTx(tx); setShowTxModal(true); }} style={{ cursor: 'pointer' }}>
                                                <td>
                                                    <div className="user-info">
                                                        <span className="name" style={{ fontWeight: 800 }}>#{tx.transaction_id}</span>
                                                        <span className="acc" style={{ fontSize: '0.75rem', opacity: 0.7 }}>{new Date(tx.updatedAt).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 800 }}>{formatUserName(tx.user)}</div>
                                                </td>
                                                <td>
                                                    <div className="amount-col" style={{ color: 'var(--success)', fontWeight: 800, fontSize: '1.1rem' }}>
                                                        {tx.type?.split('-')[0] || 'GHS'} {parseFloat(tx.amount_sent || 0).toLocaleString()}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 600 }}>
                                                        {tx.amount_received} {tx.type?.split('-')[1] || 'CAD'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${tx.status}`} style={{ background: '#22c55e', color: 'white', fontWeight: 700 }}>
                                                        {tx.status === 'sent' ? 'Sent' : tx.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {(tx.proof_url || tx.vendor_proof_url) && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPreviewImage(tx.vendor_proof_url || tx.proof_url);
                                                                setPreviewDate(tx.vendor_proof_url ? tx.updatedAt : tx.createdAt);
                                                                setShowPreviewModal(true);
                                                            }}
                                                            className="btn btn-sm btn-outline"
                                                            style={{
                                                                padding: '8px 16px',
                                                                fontSize: '0.75rem',
                                                                borderRadius: '10px',
                                                                fontWeight: 700
                                                            }}
                                                        >
                                                            View Proof
                                                        </button>
                                                    )}
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
                    <div className="modal-content glass fade-in" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h1 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary)', opacity: 0.8 }}>Transaction Analysis</h1>
                                <button onClick={() => setShowTxModal(false)} className="close-btn" style={{ background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>close</span>
                                </button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Recipient Entity</label>
                                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-deep-brown)' }}>{formatUserName(selectedTx.user)}</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>{selectedTx.user?.email || 'N/A'}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Operational Status</label>
                                    <span className={`status-badge ${selectedTx.status}`} style={{ margin: 0, padding: '8px 24px', borderRadius: '30px', fontWeight: 800 }}>{selectedTx.status}</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Initiated At</label>
                                    <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{new Date(selectedTx.createdAt).toLocaleString()}</p>
                                </div>
                                {selectedTx.status === 'sent' && (
                                    <div style={{ textAlign: 'right' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Sent Date</label>
                                        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--success)' }}>{new Date(selectedTx.updatedAt).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-body" style={{ padding: '24px 32px 32px', maxHeight: '70vh', overflowY: 'auto' }}>
                            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', background: 'rgba(183, 71, 42, 0.03)', border: '1px solid rgba(183, 71, 42, 0.1)' }}>
                                <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '20px' }}>Financial Summary</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Exchange Vector</label>
                                        <p style={{ fontWeight: 900, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {selectedTx.type?.split('-')[0]} 
                                            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>bolt</span>
                                            {selectedTx.type?.split('-')[1]}
                                        </p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Exchange Rate</label>
                                        <p style={{ fontWeight: 900, fontSize: '1.1rem' }}>1 {selectedTx.type?.split('-')[0]} = {selectedTx.exchange_rate} {selectedTx.type?.split('-')[1]}</p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Amount Sent</label>
                                        <p style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-deep-brown)' }}>{selectedTx.amount_sent} {selectedTx.type?.split('-')[0]}</p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 700 }}>Settlement Amount</label>
                                        <p style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--success)' }}>{selectedTx.amount_received} {selectedTx.type?.split('-')[1]}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', background: 'rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recipient Details</h4>
                                    <span style={{ background: 'var(--secondary)', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900 }}>{selectedTx.recipient_details?.type?.toUpperCase() || 'BANK'}</span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Full Name:</span>
                                        <span style={{ fontWeight: 800 }}>{selectedTx.recipient_details?.name || 'N/A'}</span>
                                    </div>

                                    {selectedTx.recipient_details?.type === 'momo' && (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Network Provider</span>
                                                <span style={{ fontWeight: 800 }}>{selectedTx.recipient_details?.momo_provider || 'N/A'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Wallet / Phone:</span>
                                                <span style={{ fontWeight: 800, letterSpacing: '1px' }}>{selectedTx.recipient_details?.account || selectedTx.recipient_details?.phone || 'N/A'}</span>
                                            </div>
                                        </>
                                    )}

                                    {selectedTx.recipient_details?.type === 'bank' && (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Bank Name</span>
                                                <span style={{ fontWeight: 800 }}>{selectedTx.recipient_details?.bank_name || 'N/A'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Account Number</span>
                                                <span style={{ fontWeight: 800, letterSpacing: '1px' }}>{selectedTx.recipient_details?.account || 'N/A'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Transit Number</span>
                                                <span style={{ fontWeight: 800 }}>{selectedTx.recipient_details?.transit_number || 'N/A'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Institution Number</span>
                                                <span style={{ fontWeight: 800 }}>{selectedTx.recipient_details?.institution_number || 'N/A'}</span>
                                            </div>
                                        </>
                                    )}

                                    {selectedTx.recipient_details?.type === 'interac' && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Interac Email</span>
                                            <span style={{ fontWeight: 800 }}>{selectedTx.recipient_details?.interac_email || 'N/A'}</span>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Admin Payment Reference:</span>
                                        <span style={{ fontWeight: 900, color: 'var(--primary)' }}>{selectedTx.recipient_details?.admin_reference || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* User Note Section */}
                            {selectedTx.recipient_details?.note && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>User Note</h4>
                                    <div style={{
                                        padding: '20px 24px',
                                        borderRadius: '16px',
                                        border: '1px dashed var(--border-color)',
                                        background: 'rgba(183, 71, 42, 0.02)',
                                        fontStyle: 'italic',
                                        color: 'var(--text-deep-brown)',
                                        fontWeight: 600,
                                        fontSize: '0.95rem'
                                    }}>
                                        "{selectedTx.recipient_details.note}"
                                    </div>
                                </div>
                            )}

                            {/* Payment Proof Section */}
                            {selectedTx.proof_url && (
                                <div style={{ marginBottom: '32px' }}>
                                    <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Payment Verification Proof</h4>
                                    <div
                                        onClick={() => {
                                            setPreviewImage(selectedTx.proof_url);
                                            setPreviewDate(selectedTx.proof_uploaded_at);
                                            setShowPreviewModal(true);
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                            borderRadius: '20px',
                                            overflow: 'hidden',
                                            border: '1px solid var(--border-color)',
                                            height: '160px',
                                            position: 'relative',
                                            background: 'rgba(0,0,0,0.05)',
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        <img src={getImageUrl(selectedTx.proof_url.startsWith('http') ? selectedTx.proof_url : `${selectedTx.proof_url}`)} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.6))', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '20px', color: 'white', fontWeight: 900 }}>
                                            <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', padding: '10px 20px', borderRadius: '30px', fontSize: '0.8rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                Examine Evidence
                                                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>search</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                                <button className="refresh-btn" onClick={() => setShowTxModal(false)} style={{ flex: 1, height: '54px', borderRadius: '16px', fontWeight: 800, border: '1px solid var(--border-color)', background: 'transparent' }}>Dismiss View</button>
                                {selectedTx.status === 'processing' && (
                                    <button
                                        onClick={() => {
                                            setShowTxModal(false);
                                            setTargetTxForFulfillment(selectedTx.id);
                                            setShowFulfillmentModal(true);
                                        }}
                                        className="complete-cta"
                                        style={{ flex: 1.5, height: '54px', borderRadius: '16px', fontWeight: 900, width: 'auto' }}
                                    >
                                        Initiate Settlement
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Proof Preview Modal */}
            {showPreviewModal && (
                <div className="modal-overlay" onClick={() => setShowPreviewModal(false)} style={{ zIndex: 11000 }}>
                    <div className="modal-content glass" style={{ maxWidth: '90vw', maxHeight: '90vh', padding: '24px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                            <button onClick={() => setShowPreviewModal(false)} style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>close</span>
                            </button>
                        </div>
                        <img
                            src={getImageUrl(previewImage.startsWith('http') ? previewImage : `${previewImage}`)}
                            alt="Payment Proof Preview"
                            style={{ borderRadius: '12px', maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                        />
                        {previewDate && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '16px', fontWeight: 600, fontSize: '0.9rem' }}>
                                Uploaded on: {new Date(previewDate).toLocaleString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    hour12: true
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* PIN Verification Modal */}
            {showPinModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass fade-in" style={{ maxWidth: '400px', padding: '40px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ background: 'var(--accent-peach)', color: 'var(--primary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '3.5rem' }}>shield_person</span>
                            </div>
                            <h3 style={{ marginBottom: '12px', fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-deep-brown)' }}>Session Authorization</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontWeight: 600 }}>
                                {pendingAction?.type === 'accept'
                                    ? 'Confirm secure claim of this operational task.'
                                    : 'Authorize final capital settlement.'}
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
                                        letterSpacing: '20px',
                                        width: '100%',
                                        background: 'rgba(183, 71, 42, 0.03)',
                                        border: '2px solid var(--border-color)',
                                        color: 'var(--primary)',
                                        borderRadius: '20px',
                                        padding: '24px 0',
                                        fontWeight: 900,
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                                    }}
                                    placeholder="••••"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => { setShowPinModal(false); setPinToVerify(''); }} className="refresh-btn" style={{ flex: 1, height: '54px', borderRadius: '16px', fontWeight: 700 }}>Abort</button>
                                <button type="submit" disabled={loading} className="complete-cta" style={{ flex: 1.5, height: '54px', borderRadius: '16px', fontWeight: 800, width: 'auto' }}>
                                    {loading ? 'Authenticating...' : 'Authorize'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Rejection Reason Modal */}
            {showRejectModal && (
                <div className="modal-overlay" style={{ zIndex: 13000 }}>
                    <div className="modal-content glass fade-in" style={{ maxWidth: '450px', padding: '40px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{ background: '#fee2e2', color: '#dc2626', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '3.5rem' }}>block</span>
                            </div>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-deep-brown)' }}>Rejection Protocol</h2>
                            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                                Provide a technical justification for returning this task to the pool. This detail will be logged.
                            </p>
                        </div>

                        <form onSubmit={handleRejectSubmit}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                    Justification Reason
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="e.g., Verification discrepancy, Unclear documentation..."
                                    style={{
                                        width: '100%',
                                        minHeight: '140px',
                                        padding: '20px',
                                        borderRadius: '16px',
                                        border: '1px solid var(--border-color)',
                                        background: 'rgba(0,0,0,0.02)',
                                        color: 'var(--text-deep-brown)',
                                        fontFamily: 'inherit',
                                        fontSize: '1rem',
                                        resize: 'none',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                    autoFocus
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setPendingAction(null);
                                    }}
                                    className="refresh-btn"
                                    style={{ width: '100%', height: '54px', borderRadius: '16px', fontWeight: 700 }}
                                >
                                    Dismiss
                                </button>
                                <button type="submit" disabled={loading} className="complete-cta" style={{ width: '100%', height: '54px', borderRadius: '16px', fontWeight: 900 }}>
                                    {loading ? 'Processing...' : 'Confirm Return'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Vendor Fulfillment Proof Modal */}
            {showFulfillmentModal && (
                <div className="modal-overlay" style={{ zIndex: 13000 }}>
                    <div className="modal-content glass fade-in" style={{ maxWidth: '450px', padding: '40px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{ background: 'var(--accent-peach)', color: 'var(--primary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '3.5rem' }}>receipt_long</span>
                            </div>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-deep-brown)' }}>Payout Authentication</h2>
                            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                                Upload official settlement documentation to finalize this capital movement.
                            </p>
                        </div>

                        <form onSubmit={handleFulfillmentSubmit}>
                            <div style={{
                                marginBottom: '24px',
                                padding: '24px',
                                border: '2px dashed var(--border-color)',
                                borderRadius: '20px',
                                textAlign: 'center',
                                background: 'rgba(183, 71, 42, 0.02)',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                                minHeight: '220px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {fulfillmentFile ? (
                                    <div className="fade-in" style={{ width: '100%' }}>
                                        {fulfillmentPreview ? (
                                            <div style={{ position: 'relative', margin: '0 auto', width: 'fit-content' }}>
                                                <img src={fulfillmentPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '160px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} />
                                            </div>
                                        ) : (
                                            <div style={{ color: 'var(--primary)', marginBottom: '16px' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '4rem' }}>description</span>
                                            </div>
                                        )}
                                        <div style={{ fontWeight: 800, color: 'var(--primary)', margin: '16px 0 4px', fontSize: '0.9rem', wordBreak: 'break-all' }}>{fulfillmentFile.name}</div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFulfillmentFile(null);
                                                setFulfillmentPreview(null);
                                            }}
                                            style={{ color: '#dc2626', background: 'none', border: 'none', fontWeight: 900, cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                                        >
                                            Replace Documentation
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                setFulfillmentFile(file);
                                                if (file && file.type.startsWith('image/')) {
                                                    setFulfillmentPreview(URL.createObjectURL(file));
                                                } else {
                                                    setFulfillmentPreview(null);
                                                }
                                            }}
                                            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer', zIndex: 10 }}
                                        />
                                        <div>
                                            <div style={{ color: 'var(--primary)', marginBottom: '16px', opacity: 0.8 }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '3.5rem' }}>add_a_photo</span>
                                            </div>
                                            <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text-deep-brown)' }}>Ingress Receipt Data</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 600 }}>JPG, PNG or PDF (Max 10MB)</div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowFulfillmentModal(false);
                                        setFulfillmentFile(null);
                                        setFulfillmentPreview(null);
                                        setTargetTxForFulfillment(null);
                                    }}
                                    className="refresh-btn"
                                    style={{ width: '100%', height: '54px', borderRadius: '16px', fontWeight: 700 }}
                                >
                                    Dismiss
                                </button>
                                <button type="submit" disabled={!fulfillmentFile} className="complete-cta" style={{ width: '100%', height: '54px', borderRadius: '16px', fontWeight: 900 }}>
                                    Authenticate Payout
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;
