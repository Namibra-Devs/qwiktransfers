import React from 'react';

const VendorTable = ({ vendors, toggleStatus, setSelectedUser, setShowUserModal, updateRegion }) => {
    return (
        <div className="fade-in">
            <table style={{ borderCollapse: 'separate', borderSpacing: '0 8px', width: '100%', marginTop: '0' }}>
                <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '12px 20px' }}>Vendor Business</th>
                        <th style={{ padding: '12px 20px' }}>Live Status</th>
                        <th style={{ padding: '12px 20px' }}>Region</th>
                        <th style={{ padding: '12px 20px' }}>Approval Status</th>
                        <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {vendors.map((v) => (
                        <tr key={v.id} className={`vendor-row ${!v.is_active ? 'pending-approval' : ''}`} style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            <td style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ 
                                        width: '40px', 
                                        height: '40px', 
                                        borderRadius: '12px', 
                                        background: 'var(--bg-peach)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        fontSize: '1.2rem',
                                        fontWeight: 800,
                                        color: 'var(--primary)'
                                    }}>
                                        {v.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, color: 'var(--text-deep-brown)', fontSize: '1rem' }}>{v.full_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.email}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, marginTop: '2px' }}>{v.account_number || 'No ID'}</div>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ 
                                        width: '10px', 
                                        height: '10px', 
                                        borderRadius: '50%', 
                                        background: v.is_online ? '#107c10' : '#ccc',
                                        boxShadow: v.is_online ? '0 0 8px rgba(16, 124, 16, 0.4)' : 'none'
                                    }}></div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: v.is_online ? '#107c10' : 'var(--text-muted)' }}>
                                        {v.is_online ? 'ACTIVE NOW' : 'OFFLINE'}
                                    </span>
                                </div>
                            </td>
                            <td style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    <span style={{ 
                                        fontSize: '0.7rem', 
                                        fontWeight: 800, 
                                        background: 'var(--card-bg)', 
                                        color: 'var(--text-deep-brown)', 
                                        padding: '4px 10px', 
                                        borderRadius: '6px', 
                                        border: '1px solid var(--border-color)',
                                        textTransform: 'uppercase' 
                                    }}>
                                        {v.country || 'All'}
                                    </span>
                                </div>
                            </td>
                            <td style={{ padding: '20px' }}>
                                <span className={`badge ${v.is_active ? 'badge-verified' : 'badge-pending'}`} style={{ 
                                    fontSize: '0.65rem', 
                                    fontWeight: 900, 
                                    padding: '6px 12px',
                                    borderRadius: '100px',
                                    letterSpacing: '0.05em'
                                }}>
                                    {v.is_active ? 'APPROVED' : 'PENDING REVIEW'}
                                </span>
                            </td>
                            <td style={{ padding: '20px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    {!v.is_active ? (
                                        <button
                                            onClick={() => toggleStatus(v.id)}
                                            style={{ 
                                                padding: '8px 16px', 
                                                background: 'var(--primary)', 
                                                color: '#fff', 
                                                border: 'none', 
                                                borderRadius: '8px', 
                                                fontWeight: 800, 
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.2)'
                                            }}
                                        >
                                            🚀 Approve Access
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => toggleStatus(v.id)}
                                            style={{ 
                                                padding: '8px 16px', 
                                                background: 'rgba(216, 59, 1, 0.1)', 
                                                color: 'var(--danger)', 
                                                border: '1.5px solid var(--danger)', 
                                                borderRadius: '8px', 
                                                fontWeight: 800, 
                                                fontSize: '0.75rem',
                                                cursor: 'pointer' 
                                            }}
                                        >
                                            Suspend
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { setSelectedUser(v); setShowUserModal(true); }}
                                        style={{ 
                                            padding: '8px 16px', 
                                            background: '#fff', 
                                            color: 'var(--text-deep-brown)', 
                                            border: '1.5px solid var(--border-color)', 
                                            borderRadius: '8px', 
                                            fontWeight: 800, 
                                            fontSize: '0.75rem',
                                            cursor: 'pointer' 
                                        }}
                                    >
                                        Stats
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {vendors.length === 0 && (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏪</div>
                                <div>No vendors found on the platform.</div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <style>{`
                .vendor-row {
                    transition: all 0.2s ease;
                }
                .vendor-row:hover {
                    box-shadow: 0 4px 15px rgba(0,0,0,0.06) !important;
                    transform: translateX(4px);
                }
                .pending-approval {
                    border-left: 4px solid var(--primary);
                }
                .badge-verified { background: rgba(16, 124, 16, 0.1); color: #107c10; }
                .badge-pending { background: rgba(224, 161, 46, 0.1); color: #e0a12e; }
            `}</style>
        </div>
    );
};

export default VendorTable;
