import React from 'react';

const AdminTable = ({ admins, toggleStatus, setSelectedUser, setShowAdminModal }) => {
    return (
        <div className="fade-in">
            <table style={{ borderCollapse: 'separate', borderSpacing: '0 8px', width: '100%', marginTop: '0' }}>
                <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '12px 20px' }}>Staff Member</th>
                        <th style={{ padding: '12px 20px' }}>Access Level</th>
                        <th style={{ padding: '12px 20px' }}>Security (2FA)</th>
                        <th style={{ padding: '12px 20px' }}>Status</th>
                        <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {admins.map((admin) => (
                        <tr key={admin.id} className="admin-row" style={{ background: 'var(--card-bg)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ 
                                        width: '40px', 
                                        height: '40px', 
                                        borderRadius: '12px', 
                                        background: admin.sub_role === 'super' ? '#4A154B' : 'var(--bg-peach)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        fontSize: '1.2rem',
                                        fontWeight: 800,
                                        color: admin.sub_role === 'super' ? '#fff' : 'var(--primary)'
                                    }}>
                                        {admin.full_name?.charAt(0) || 'A'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, color: 'var(--text-deep-brown)', fontSize: '1rem' }}>{admin.full_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{admin.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '20px' }}>
                                <span className={`badge ${admin.sub_role === 'super' ? 'badge-super' : 'badge-support'}`} style={{ 
                                    fontSize: '0.65rem', 
                                    fontWeight: 900, 
                                    padding: '6px 12px',
                                    borderRadius: '100px',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase'
                                }}>
                                    {admin.sub_role === 'super' ? 'SUPER ADMIN' : 'SUPPORT AGENT'}
                                </span>
                            </td>
                            <td style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: admin.two_factor_enabled ? 'var(--success)' : 'var(--danger)' }}>
                                        {admin.two_factor_enabled ? 'lock' : 'lock_open'}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: admin.two_factor_enabled ? 'var(--success)' : 'var(--danger)' }}>
                                        {admin.two_factor_enabled ? 'Secured' : 'Vulnerable'}
                                    </span>
                                </div>
                            </td>
                            <td style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: admin.is_online ? 'var(--success)' : 'var(--border-color)' }}></div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: admin.is_online ? 'var(--success)' : 'var(--text-muted)' }}>
                                            {admin.is_online ? 'ONLINE' : 'OFFLINE'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: admin.is_active ? 'var(--text-muted)' : 'var(--danger)', fontWeight: 600 }}>
                                        {admin.is_active ? 'Account Active' : 'Account Suspended'}
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '20px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => { setSelectedUser(admin); setShowAdminModal(true); }}
                                        style={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 16px', 
                                            background: 'var(--card-bg)', 
                                            color: 'var(--text-deep-brown)', 
                                            border: '1.5px solid var(--border-color)', 
                                            borderRadius: '50px', 
                                            fontWeight: 800, 
                                            fontSize: '0.75rem',
                                            cursor: 'pointer' 
                                        }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>manage_accounts</span>
                                        Manage
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {admins.length === 0 && (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                <div style={{ fontWeight: 700 }}>No administrative staff found.</div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <style>{`
                .admin-row { transition: all 0.2s ease; border: 1px solid var(--border-color); }
                .admin-row:hover { transform: translateX(4px); box-shadow: var(--shadow-md) !important; border-color: var(--primary); }
                .badge-super { background: rgba(74, 21, 75, 0.1); color: #4A154B; border: 1px solid rgba(74, 21, 75, 0.2); }
                .badge-support { background: rgba(183, 71, 42, 0.1); color: var(--primary); border: 1px solid rgba(183, 71, 42, 0.2); }
            `}</style>
        </div>
    );
};

export default AdminTable;
