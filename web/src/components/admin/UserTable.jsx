import React from 'react';

const UserTable = ({ users, setSelectedUser, setShowUserModal }) => {
    return (
        <table style={{ marginTop: '0' }}>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Contact</th>
                    <th>ID Level</th>
                    <th>Lifetime Transfers</th>
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
                        <td style={{ fontSize: '0.85rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-deep-brown)' }}>{parseFloat(u.balance_ghs).toLocaleString()} GHS</div>
                            <div style={{ fontWeight: 700, color: 'var(--text-deep-brown)' }}>{parseFloat(u.balance_cad).toLocaleString()} CAD</div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                            <button
                                onClick={() => { setSelectedUser(u); setShowUserModal(true); }}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '6px 12px', background: 'var(--text-deep-brown)', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 700, cursor: 'pointer' }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>settings</span>
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
