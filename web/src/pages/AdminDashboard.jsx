import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions'); // Admin should see all, controller logic handles filtering
            setTransactions(res.data);
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

    return (
        <div style={{ padding: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Admin Portal</h1>
                <button onClick={logout} className="btn-primary">Logout</button>
            </header>

            <main style={{ marginTop: '2rem' }}>
                <div className="card">
                    <h3>All Transactions</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left' }}>
                                <th>ID</th>
                                <th>User</th>
                                <th>Sent (GHS)</th>
                                <th>Received (CAD)</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem 0' }}>{tx.id}</td>
                                    <td>{tx.user?.email}</td>
                                    <td>{tx.amount_sent}</td>
                                    <td>{tx.amount_received}</td>
                                    <td>{tx.status}</td>
                                    <td>
                                        {tx.status === 'pending' && (
                                            <button
                                                onClick={() => updateStatus(tx.id, 'processing')}
                                                style={{ marginRight: '0.5rem', backgroundColor: '#ffc107', color: 'black' }}
                                            >
                                                Mark as Processing
                                            </button>
                                        )}
                                        {tx.status === 'processing' && (
                                            <button
                                                onClick={() => updateStatus(tx.id, 'sent')}
                                                className="btn-primary"
                                                style={{ backgroundColor: '#28a745' }}
                                            >
                                                Mark as Sent
                                            </button>
                                        )}
                                        {tx.status === 'sent' && <span>Completed</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
