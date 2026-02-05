import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [users, setUsers] = useState([]);
    const [tab, setTab] = useState('transactions');

    useEffect(() => {
        fetchTransactions();
        fetchUsers();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions');
            setTransactions(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/transactions/${id}/status`, { status });
            fetchTransactions();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const updateKYC = async (userId, status) => {
        try {
            await api.patch('/auth/kyc/status', { userId, status });
            fetchUsers();
        } catch (error) {
            alert('Failed to update KYC');
        }
    };

    return (
        <div className="dashboard-container">
            <header>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#818cf8' }}>QWIK<span style={{ color: '#fff' }}>ADMIN</span></h1>
                    <nav style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => setTab('transactions')} style={{ background: tab === 'transactions' ? 'var(--primary)' : 'transparent', padding: '0.4rem 1rem' }}>Transactions</button>
                        <button onClick={() => setTab('kyc')} style={{ background: tab === 'kyc' ? 'var(--primary)' : 'transparent', padding: '0.4rem 1rem' }}>KYC Review</button>
                    </nav>
                </div>
                <button onClick={logout} className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.2rem' }}>Logout</button>
            </header>

            <main>
                {tab === 'transactions' && (
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Global Transaction Pool</h2>
                        <table style={{ minWidth: '100%' }}>
                            <thead>
                                <tr>
                                    <th>User / Recipient</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Proof</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{tx.user?.email}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>→ {tx.recipient_details?.name}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--success)' }}>{tx.amount_received} CAD</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.amount_sent} GHS</div>
                                        </td>
                                        <td><span className={`badge badge-${tx.status}`}>{tx.status}</span></td>
                                        <td>
                                            {tx.proof_url ? <a href={`http://localhost:5000${tx.proof_url}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#818cf8' }}>View</a> : 'No Proof'}
                                        </td>
                                        <td>
                                            {tx.status === 'pending' && <button onClick={() => updateStatus(tx.id, 'processing')} style={{ fontSize: '0.75rem', padding: '0.4rem', background: 'var(--warning)', color: '#000' }}>Process</button>}
                                            {tx.status === 'processing' && <button onClick={() => updateStatus(tx.id, 'sent')} style={{ fontSize: '0.75rem', padding: '0.4rem', background: 'var(--success)', color: '#fff' }}>Confirm</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'kyc' && (
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Pending KYC Verifications</h2>
                        <table style={{ minWidth: '100%' }}>
                            <thead>
                                <tr>
                                    <th>User Email</th>
                                    <th>Document</th>
                                    <th>Current Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.filter(u => u.role !== 'admin' && u.kyc_status !== 'verified').map((u) => (
                                    <tr key={u.id}>
                                        <td>{u.email}</td>
                                        <td>
                                            {u.kyc_document ? <a href={`http://localhost:5000${u.kyc_document}`} target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>View ID</a> : 'Not Uploaded'}
                                        </td>
                                        <td><span className={`badge badge-${u.kyc_status}`}>{u.kyc_status}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => updateKYC(u.id, 'verified')} style={{ fontSize: '0.7rem', padding: '0.4rem', background: 'var(--success)', color: '#fff' }}>Approve</button>
                                                <button onClick={() => updateKYC(u.id, 'rejected')} style={{ fontSize: '0.7rem', padding: '0.4rem', background: 'var(--danger)', color: '#fff' }}>Reject</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
