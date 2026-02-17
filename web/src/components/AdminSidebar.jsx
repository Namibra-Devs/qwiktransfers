import React from 'react';
import NotificationPanel from './NotificationPanel';
import ThemeSwitcher from './ThemeSwitcher';

const AdminSidebar = ({ activeTab, setActiveTab, logout, isOpen, toggleSidebar }) => {
    const menuItems = [
        { id: 'transactions', label: 'Transactions', icon: '📊' },
        { id: 'kyc', label: 'KYC Review', icon: '🆔' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'vendors', label: 'Vendors', icon: '🏢' },
        { id: 'audit', label: 'Audit Logs', icon: '📜' },
        { id: 'payment-settings', label: 'Payment Settings', icon: '💳' },
        { id: 'profile', label: 'Profile', icon: '👤' },
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{ background: 'var(--card-bg)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px', margin: 0 }}>QWIK Admin</h1>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <NotificationPanel />
                    <ThemeSwitcher />
                </div>
            </div>

            <nav style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            background: activeTab === item.id ? 'var(--primary)' : 'transparent',
                            color: activeTab === item.id ? '#fff' : 'var(--text-muted)',
                            borderRadius: '30px',
                            border: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)' }}>
                <button
                    onClick={logout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: 'transparent',
                        color: 'var(--danger)',
                        borderRadius: '30px',
                        border: '2px solid var(--danger)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <span style={{ fontSize: '1.1rem' }}>🚪</span>
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
