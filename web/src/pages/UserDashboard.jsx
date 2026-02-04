import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

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
                type: 'GHS-CAD', // Hardcoded for simplified flow
                recipient_details: { name: 'Recipient Name', account: '123456' } // Mock details
            });
            setAmount('');
            fetchTransactions();
            alert('Transaction Initiated!');
        } catch (error) {
            alert('Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>QwikTransfers</h1>
                <div>
                    <span>Welcome, {user?.email}</span>
                    <button onClick={logout} style={{ marginLeft: '1rem' }} className="btn-primary">Logout</button>
                </div>
            </header>

            <main style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <section className="card">
                    <h3>Send Money (GHS to CAD)</h3>
                    <form onSubmit={handleSend}>
                        <div className="form-group">
                            <label>Amount (GHS)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                            Exchange Rate: 1 GHS = 0.10 CAD (Approx)
                        </p>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Processing...' : 'Send Request'}
                        </button>
                    </form>
                </section>

                <section>
                    <h3>Recent Transactions</h3>
                    <div className="card" style={{ padding: '1rem' }}>
                        {transactions.length === 0 ? (
                            <p>No transactions found.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left' }}>
                                        <th>ID</th>
                                        <th>Sent (GHS)</th>
                                        <th>Received (CAD)</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '0.5rem 0' }}>{tx.id}</td>
                                            <td>{tx.amount_sent}</td>
                                            <td>{tx.amount_received}</td>
                                            <td>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    backgroundColor: tx.status === 'sent' ? '#d4edda' : '#fff3cd',
                                                    color: tx.status === 'sent' ? '#155724' : '#856404'
                                                }}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default UserDashboard;
