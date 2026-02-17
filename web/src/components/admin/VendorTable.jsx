import React from 'react';

const VendorTable = ({ vendors, toggleStatus, setSelectedUser, setShowUserModal }) => {
    return (
        <table style={{ marginTop: '0' }}>
            <thead>
                <tr>
                    <th>Vendor</th>
                    <th>Status</th>
                    <th>Region</th>
                    <th>Account</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {vendors.map((v) => (
                    <tr key={v.id}>
                        <td style={{ fontWeight: 600 }}>
                            {v.full_name}<br />
                            <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800 }}>{v.account_number || 'No Account #'}</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.email}</span>
                        </td>
                        <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: v.is_online ? 'var(--success)' : '#ccc' }}></div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{v.is_online ? 'Online' : 'Offline'}</span>
                            </div>
                        </td>
                        <td>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, background: 'var(--accent-peach)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                                {v.country || 'All'}
                            </span>
                        </td>
                        <td>
                            <span className={`badge ${v.is_active ? 'badge-verified' : 'badge-rejected'}`} style={{ fontSize: '0.7rem' }}>
                                {v.is_active ? 'ACTIVE' : 'DISABLED'}
                            </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => toggleStatus(v.id)}
                                    style={{ fontSize: '0.75rem', padding: '6px 12px', background: v.is_active ? 'var(--danger)' : 'var(--success)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    {v.is_active ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                    onClick={() => { setSelectedUser(v); setShowUserModal(true); }}
                                    style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'var(--text-deep-brown)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    View
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                {vendors.length === 0 && (
                    <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No vendors found on the platform.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default VendorTable;
