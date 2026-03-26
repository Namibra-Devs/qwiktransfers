import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../services/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ThemeSwitcher from '../components/ThemeSwitcher';
import NotificationPanel from '../components/NotificationPanel';
import Button from '../components/Button';

const Referrals = () => {
    const { user, logout, getReferralStats, getReferredUsers } = useAuth();
    const [stats, setStats] = useState(null);
    const [referredUsers, setReferredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState({ system_name: 'QWIK', system_logo: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, usersData, configRes] = await Promise.all([
                    getReferralStats(),
                    getReferredUsers(),
                    api.get('/system/config/public')
                ]);
                setStats(statsData);
                setReferredUsers(usersData);
                setConfig({
                    system_name: configRes.data.system_name || 'QWIK',
                    system_logo: configRes.data.system_logo || ''
                });
            } catch (error) {
                console.error('Failed to fetch referral data', error);
                toast.error('Failed to load referral details');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Referral code copied!');
    };

    const getStatusStyle = (status) => {
        if (status === 'Completed First TX') {
            return { background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', border: '1px solid rgba(34, 197, 94, 0.2)' };
        }
        return { background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.2)' };
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="dashboard-brand">
                    <Link to="/dashboard" className="brand-link">
                        {config.system_logo ? (
                            <img src={getImageUrl(config.system_logo)} alt="Logo" className="nav-logo" />
                        ) : (
                            <div className="nav-logo-placeholder">Q</div>
                        )}
                        <span className="brand-name">{config.system_name}</span>
                    </Link>
                </div>

                <div className="dashboard-actions">
                    <nav className="dashboard-nav-links">
                        <Link to="/dashboard" className="nav-link" style={styles.navLink}>Dashboard</Link>
                        <Link to="/complaints" className="nav-link" style={styles.navLink}>Support</Link>
                        <Link to="/kyc" className="kyc-badge-link">
                            {user?.kyc_status === 'verified' ? (
                                <span className="kyc-status verified">✓ Verified</span>
                            ) : (
                                <span className="kyc-status unverified">Verify ID</span>
                            )}
                        </Link>
                    </nav>

                    <div className="header-utilities">
                        <NotificationPanel />
                        <ThemeSwitcher />
                        <Link to="/profile" className="user-profile-pill">
                            <div className="profile-details">
                                <span className="user-name">{user?.full_name || user?.email?.split('@')[0]}</span>
                                <span className="user-acc">{user?.account_number || 'ID: QT-USER'}</span>
                            </div>
                            {user?.profile_picture ? (
                                <img src={getImageUrl(user.profile_picture)} alt="Avatar" className="user-avatar" />
                            ) : (
                                <div className="user-avatar-placeholder">{(user?.full_name || 'Q')[0].toUpperCase()}</div>
                            )}
                        </Link>
                        <button onClick={logout} className="sign-out-btn">
                            <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            <span className="text">Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main fade-in" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '2.2rem', color: 'var(--text-deep-brown)', marginBottom: '8px', letterSpacing: '-0.5px' }}>Refer & Earn</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Invite your friends and earn rewards when they make their first transfer.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner"></div></div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {/* Referral Code Card */}
                        <div className="card" style={{ padding: '40px', textAlign: 'center', background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--accent-peach) 100%)', border: 'none' }}>
                            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', fontWeight: 700 }}>Your Referral Code</h3>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '4px', background: 'rgba(255,255,255,0.5)', padding: '12px 32px', borderRadius: '16px', border: '2px dashed var(--primary)' }}>
                                    {stats?.referral_code || 'QWIK-XXXX'}
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(stats?.referral_code)}
                                    style={{ background: 'var(--primary)', border: 'none', color: '#fff', padding: '16px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 8px 16px rgba(216, 59, 1, 0.2)' }}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                </button>
                            </div>
                            <p style={{ color: 'var(--text-deep-brown)', fontWeight: 600 }}>Share this code with your friends to start earning!</p>
                        </div>

                        {/* Stats Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Referrals</span>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-deep-brown)', marginTop: '8px' }}>{stats?.total_referrals || 0}</div>
                            </div>
                            <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Pending Rewards</span>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b', marginTop: '8px' }}>
                                    {stats?.rewards?.find(r => r.status === 'pending')?.total_amount || 0} {stats?.rewards?.[0]?.reward_currency || 'GHS'}
                                </div>
                            </div>
                            <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Earned</span>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981', marginTop: '8px' }}>
                                    {stats?.rewards?.find(r => r.status === 'paid')?.total_amount || 0} {stats?.rewards?.[0]?.reward_currency || 'GHS'}
                                </div>
                            </div>
                        </div>

                        {/* Referred Friends Table */}
                        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-main)' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Referred Friends</h3>
                            </div>
                            {referredUsers.length === 0 ? (
                                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }}>🤝</div>
                                    <p>You haven't referred anyone yet. Share your code to get started!</p>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                                                <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Friend</th>
                                                <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Joined Date</th>
                                                <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {referredUsers.map(u => (
                                                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--text-deep-brown)' }}>{u.name}</td>
                                                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(u.joinedAt).toLocaleDateString()}</td>
                                                    <td style={{ padding: '16px 24px' }}>
                                                        <span style={{ 
                                                            padding: '6px 12px', 
                                                            borderRadius: '20px', 
                                                            fontSize: '0.75rem', 
                                                            fontWeight: 800,
                                                            ...getStatusStyle(u.status)
                                                        }}>
                                                            {u.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const styles = {
    navLink: {
        color: 'var(--text-deep-brown)',
        fontWeight: 600,
        marginRight: '20px',
        textDecoration: 'none',
        fontSize: '0.9rem'
    }
};

export default Referrals;
