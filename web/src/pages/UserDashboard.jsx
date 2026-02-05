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
            alert('Transaction Initiated! Please wait for admin verification.');
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
            alert('Proof uploaded successfully!');
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
            alert('KYC Document uploaded! Admin will verify soon.');
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
                <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#818cf8' }}>QWIK<span style={{ color: '#fff' }}>TRANSFERS</span></h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.email}</div>
                        <div style={{ fontSize: '0.75rem', color: user?.kyc_status === 'verified' ? 'var(--success)' : 'var(--warning)' }}>
                            Status: {user?.kyc_status?.toUpperCase() || 'NOT VERIFIED'}
                        </div>
                    </div>
                    <button onClick={logout} className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.2rem' }}>Logout</button>
                </div>
            </header>

            <main style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Send Money</h2>
                        <form onSubmit={handleSend}>
                            <div className="form-group">
                                <label>Amount (GHS)</label>
                                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
                            </div>
                            <div className="form-group">
                                <label>Method</label>
                                <select value={recipientType} onChange={(e) => setRecipientType(e.target.value)}>
                                    <option value="momo">Momo</option>
                                    <option value="bank">Bank</option>
                                    <option value="paypal">PayPal</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Account</label>
                                <input type="text" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} required />
                            </div>
                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.8rem', color: '#818cf8' }}>Rate: 1 GHS = {rate} CAD</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>Total: {(amount * rate).toFixed(2)} CAD</div>
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading}>Send</button>
                        </form>
                    </section>

                    {user?.kyc_status !== 'verified' && (
                        <section className="card" style={{ border: '1px solid var(--warning)' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Complete KYC</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Upload GH Card or Passport to unlock higher limits.</p>
                            <div style={{ position: 'relative' }}>
                                <input type="file" onChange={(e) => handleKYCUpload(e.target.files[0])} style={{ position: 'absolute', opacity: 0, width: '100%', cursor: 'pointer' }} />
                                <button className="btn-primary" style={{ backgroundColor: 'var(--warning)', color: '#000' }}>Upload ID</button>
                            </div>
                        </section>
                    )}
                </aside>

                <section className="card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>History</h2>
                    <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Recipient</th>
                                <th>Status</th>
                                <th>Amount</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{tx.recipient_details?.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tx.recipient_details?.account}</div>
                                    </td>
                                    <td><span className={`badge badge-${tx.status}`}>{tx.status}</span></td>
                                    <td><b>{tx.amount_received} CAD</b></td>
                                    <td>
                                        {!tx.proof_url && tx.status === 'pending' && (
                                            <div style={{ position: 'relative' }}>
                                                <input type="file" onChange={(e) => handleUploadProof(tx.id, e.target.files[0])} style={{ position: 'absolute', opacity: 0, width: '100%', cursor: 'pointer' }} />
                                                <button style={{ fontSize: '0.7rem', padding: '0.4rem', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', borderRadius: '4px' }}>Upload Proof</button>
                                            </div>
                                        )}
                                        {tx.proof_url && <a href={`http://localhost:5000${tx.proof_url}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', color: '#818cf8' }}>View Proof</a>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    );
};

export default UserDashboard;
