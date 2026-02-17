import React from 'react';

const UserTable = ({ users, setSelectedUser, setShowUserModal }) => {
    return (
        <table style={{ marginTop: '0' }}>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Contact</th>
                    <th>ID Level</th>
                    <th>Balances</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map((u) => (
                    <tr key={u.id}>
                        <td style={{ fontWeight: 600 }}>
                            {u.full_name}<br />
                            <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800 }}>{u.account_number || 'No Account #'}</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td>
                            <div style={{ fontSize: '0.85rem' }}>{u.email}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.phone}</div>
                        </td>
                        <td><span className={`badge badge-${u.kyc_status}`}>{u.kyc_status}</span></td>
                        <td>
                            <div style={{ fontWeight: 700 }}>{parseFloat(u.balance_ghs).toFixed(2)} GHS</div>
                            <div style={{ fontWeight: 700 }}>{parseFloat(u.balance_cad).toFixed(2)} CAD</div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                            <button
                                onClick={() => { setSelectedUser(u); setShowUserModal(true); }}
                                style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'var(--text-deep-brown)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Manage
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default UserTable;
