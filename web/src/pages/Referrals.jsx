import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../services/api';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DashboardHeader from '../components/DashboardHeader';
import Button from '../components/Button';

const Referrals = () => {
    const { user, logout, getReferralStats, getReferredUsers } = useAuth();
    const [stats, setStats] = useState(null);
    const [referredUsers, setReferredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState({ system_name: 'QWIK', system_logo: '' });

    if (user?.role === 'vendor') {
        return <Navigate to="/vendor" />;
    }

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
            <DashboardHeader 
                user={user} 
                logout={logout} 
                config={config} 
                type={user?.role || 'user'} 
            />

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
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>content_copy</span>
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
                                    <div style={{ background: 'var(--accent-peach)', color: 'var(--primary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '3rem' }}>group_add</span>
                                    </div>
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
