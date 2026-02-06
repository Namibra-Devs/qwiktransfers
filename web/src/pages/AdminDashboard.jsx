import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';

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
            toast.success('Status updated!');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const updateKYC = async (userId, status) => {
        try {
            await api.patch('/auth/kyc/status', { userId, status });
            fetchUsers();
            toast.success('KYC status updated!');
        } catch (error) {
            toast.error('Failed to update KYC');
        }
    };

    return (
        <div className="dashboard-container">
            <header>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>QWIK<span style={{ fontWeight: 400, opacity: 0.6 }}>ADMIN</span></h1>
                    <nav style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setTab('transactions')}
                            className={tab === 'transactions' ? 'active' : ''}
                        >
                            Transactions
                        </button>
                        <button
                            onClick={() => setTab('kyc')}
                            className={tab === 'kyc' ? 'active' : ''}
                        >
                            KYC Review
                        </button>
                    </nav>
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
            </header>

            <main>
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '32px', borderBottom: '1px solid var(--border-color)' }}>
                        <h2 style={{ fontSize: '1.1rem' }}>
                            {tab === 'transactions' ? 'Global Transaction Pool' : 'Identity Verification Requests'}
                        </h2>
                    </div>

                    {tab === 'transactions' && (
                        <table style={{ marginTop: '0' }}>
                            <thead>
                                <tr>
                                    <th>User / Recipient</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Proof</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
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
                                            <div style={{ fontWeight: 700 }}>{tx.amount_received} CAD</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tx.amount_sent} GHS</div>
                                        </td>
                                        <td><span className={`badge badge-${tx.status}`}>{tx.status}</span></td>
                                        <td>
                                            {tx.proof_url ? (
                                                <a href={`http://localhost:5000${tx.proof_url}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>View</a>
                                            ) : (
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                {tx.status === 'pending' && <button onClick={() => updateStatus(tx.id, 'processing')} style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'var(--warning)', border: 'none', borderRadius: '4px', fontWeight: 700 }}>Process</button>}
                                                {tx.status === 'processing' && <button onClick={() => updateStatus(tx.id, 'sent')} style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700 }}>Confirm</button>}
                                                {tx.status === 'sent' && <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)' }}>Complete</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {tab === 'kyc' && (
                        <table style={{ marginTop: '0' }}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Document Info</th>
                                    <th>Verification Files</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.filter(u => u.role !== 'admin').map((u) => (
                                    <tr key={u.id}>
                                        <td style={{ fontWeight: 600 }}>
                                            {u.full_name}<br />
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{u.email}</span>
                                        </td>
                                        <td>
                                            {u.kyc_document_type ? (
                                                <div style={{ fontSize: '0.85rem' }}>
                                                    <strong>{u.kyc_document_type.replace('_', ' ').toUpperCase()}</strong><br />
                                                    ID: {u.kyc_document_id}
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No Details</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                {u.kyc_front_url && (
                                                    <a href={`http://localhost:5000${u.kyc_front_url}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>Front</a>
                                                )}
                                                {u.kyc_back_url && (
                                                    <a href={`http://localhost:5000${u.kyc_back_url}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>Back</a>
                                                )}
                                                {u.kyc_document && !u.kyc_front_url && (
                                                    <a href={`http://localhost:5000${u.kyc_document}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>Old Format ID</a>
                                                )}
                                                {!u.kyc_front_url && !u.kyc_document && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None</span>}
                                            </div>
                                        </td>
                                        <td><span className={`badge badge-pending`}>{u.kyc_status}</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => updateKYC(u.id, 'verified')} style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700 }}>Verify</button>
                                                <button onClick={() => updateKYC(u.id, 'rejected')} style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700 }}>Reject</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
