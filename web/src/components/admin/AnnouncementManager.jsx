import React from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const AnnouncementManager = ({ announcements, fetchAnnouncements, setShowAddModal }) => {
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await api.delete(`/announcements/admin/${id}`);
            toast.success('Announcement deleted');
            fetchAnnouncements();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="fade-in">
            <table style={{ marginTop: '0', background: 'transparent' }}>
                <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '12px 20px' }}>Announcement</th>
                        <th style={{ padding: '12px 20px' }}>Target</th>
                        <th style={{ padding: '12px 20px' }}>Created By</th>
                        <th style={{ padding: '12px 20px' }}>Status</th>
                        <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {announcements.map((a) => (
                        <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s ease' }} className="table-row-hover">
                            <td style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                                    <div style={{ 
                                        width: '36px', 
                                        height: '36px', 
                                        borderRadius: '10px', 
                                        background: a.type === 'urgent' ? 'var(--danger)' : a.type === 'warning' ? 'var(--warning)' : 'var(--primary)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        color: '#fff',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
                                            {a.type === 'urgent' ? 'priority_high' : a.type === 'warning' ? 'report_problem' : 'info'}
                                        </span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, color: 'var(--text-deep-brown)', marginBottom: '4px' }}>{a.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '350px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {a.message}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '20px' }}>
                                <span className="badge" style={{ background: 'rgba(183, 71, 42, 0.1)', color: 'var(--primary)', fontWeight: 800, fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px' }}>
                                    {a.target.toUpperCase()}
                                </span>
                            </td>
                            <td style={{ padding: '20px', fontSize: '0.85rem' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-deep-brown)' }}>{a.creator?.first_name} {a.creator?.last_name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{new Date(a.createdAt).toLocaleDateString()}</div>
                            </td>
                            <td style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.is_active ? 'var(--success)' : 'var(--text-muted)', boxShadow: `0 0 8px ${a.is_active ? 'var(--success)' : 'transparent'}` }}></div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: a.is_active ? 'var(--success)' : 'var(--text-muted)' }}>
                                        {a.is_active ? 'LIVE' : 'ENDED'}
                                    </span>
                                </div>
                                {a.expires_at && (
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        {new Date(a.expires_at) < new Date() ? 'Expired: ' : 'Expires: '}{new Date(a.expires_at).toLocaleDateString()}
                                    </div>
                                )}
                            </td>
                            <td style={{ padding: '20px', textAlign: 'right' }}>
                                <button
                                    onClick={() => handleDelete(a.id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.7, padding: '8px', borderRadius: '50%', transition: 'all 0.2s' }}
                                    title="Delete Announcement"
                                    className="icon-btn-hover"
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>delete</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {announcements.length === 0 && (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>campaign</span>
                                </div>
                                <div style={{ fontWeight: 800, color: 'var(--text-deep-brown)', fontSize: '1.1rem' }}>No broadcasts staged</div>
                                <div style={{ fontSize: '0.85rem', maxWidth: '300px', margin: '8px auto' }}>Launch your first system-wide message to communicate with your targeted audience.</div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AnnouncementManager;
