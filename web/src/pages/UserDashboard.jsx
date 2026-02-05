import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const UserDashboard = () => {
    const { user, logout, refreshProfile } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [amount, setAmount] = useState('');
    const [recipientType, setRecipientType] = useState('momo');
    const [recipientName, setRecipientName] = useState('');
    const [recipientAccount, setRecipientAccount] = useState('');
    const [rate, setRate] = useState(0.09);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTransactions();
        fetchRate();
    }, []);

    const fetchRate = async () => {
        try {
            const res = await api.get('/rates');
            setRate(res.data.rate);
        } catch (error) {
            console.error('Failed to fetch rate', error);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions');
            setTransactions(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/transactions', {
                amount_sent: amount,
                type: 'GHS-CAD',
                recipient_details: {
                    type: recipientType,
                    name: recipientName,
                    account: recipientAccount
                }
            });
            setAmount('');
            setRecipientName('');
            setRecipientAccount('');
            fetchTransactions();
            alert('Transfer Initiated!');
        } catch (error) {
            alert('Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadProof = async (txId, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('proof', file);
        setLoading(true);
        try {
            await api.post(`/transactions/${txId}/upload-proof`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchTransactions();
            alert('Proof uploaded!');
        } catch (error) {
            alert('Failed to upload proof');
        } finally {
            setLoading(false);
        }
    };

    const handleKYCUpload = async (file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('document', file);
        setLoading(true);
        try {
            await api.post('/auth/kyc', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('KYC Document uploaded!');
            if (refreshProfile) refreshProfile();
        } catch (error) {
            alert('KYC Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <header>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>QWIK</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.email}</div>
                        <div style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: user?.kyc_status === 'verified' ? 'var(--success)' : 'var(--warning)',
                            textTransform: 'uppercase'
                        }}>
                            {user?.kyc_status || 'Unverified'}
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: 'var(--text-deep-brown)'
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            <main style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 440px) 1fr', gap: '48px', alignItems: 'start' }}>
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <section className="card">
                        <h2 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>Send Money</h2>
                        <form onSubmit={handleSend}>
                            <div className="form-group">
                                <label>You send</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        style={{ paddingRight: '60px', fontSize: '1.25rem', fontWeight: 600 }}
                                        required
                                    />
                                    <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>GHS</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Recipient gets</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        value={amount ? (amount * rate).toFixed(2) : '0.00'}
                                        readOnly
                                        style={{ paddingRight: '60px', background: '#f9f9f9', fontSize: '1.25rem', fontWeight: 600 }}
                                    />
                                    <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>CAD</span>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 500 }}>
                                    Exchange Rate: 1 GHS = {rate} CAD
                                </p>
                            </div>

                            <div className="form-group">
                                <label>Recipient Method</label>
                                <select value={recipientType} onChange={(e) => setRecipientType(e.target.value)}>
                                    <option value="momo">Mobile Money (Momo)</option>
                                    <option value="bank">Bank Transfer</option>
                                    <option value="paypal">PayPal</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Recipient Full Name</label>
                                <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Full Name" required />
                            </div>

                            <div className="form-group" style={{ marginBottom: '32px' }}>
                                <label>Account / Wallet ID</label>
                                <input type="text" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} placeholder="Account Info" required />
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Processing...' : 'Send Now'}
                            </button>
                        </form>
                    </section>

                    {user?.kyc_status !== 'verified' && (
                        <div className="card" style={{ border: '2px solid var(--warning)', padding: '24px' }}>
                            <h3 style={{ fontSize: '0.95rem', marginBottom: '8px' }}>Identity Verification</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Verify your identity to increase limits and speed up transfers.</p>
                            <div style={{ position: 'relative' }}>
                                <input type="file" onChange={(e) => handleKYCUpload(e.target.files[0])} style={{ position: 'absolute', opacity: 0, width: '100%', cursor: 'pointer', height: '100%' }} />
                                <button className="btn-primary" style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '10px' }}>Upload ID Document</button>
                            </div>
                        </div>
                    )}
                </aside>

                <section className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '32px' }}>
                        <h2 style={{ fontSize: '1.1rem' }}>Transaction History</h2>
                    </div>
                    {transactions.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '48px' }}>No transactions found.</p>
                    ) : (
                        <table style={{ marginTop: '0' }}>
                            <thead>
                                <tr>
                                    <th>Recipient</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{tx.recipient_details?.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.recipient_details?.account}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 700 }}>{tx.amount_received} CAD</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.amount_sent} GHS</div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${tx.status}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {tx.status === 'pending' && !tx.proof_url && (
                                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handleUploadProof(tx.id, e.target.files[0])}
                                                        style={{ position: 'absolute', opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                                                    />
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>Upload Proof</span>
                                                </div>
                                            )}
                                            {tx.proof_url && (
                                                <a href={`http://localhost:5000${tx.proof_url}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                                                    View Proof
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            </main>
        </div>
    );
};

export default UserDashboard;
