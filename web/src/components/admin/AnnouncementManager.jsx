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
            <div style={{ padding: '0 32px 32px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary"
                    style={{ padding: '10px 24px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', width: 'auto' }}
                >
                    <span className="material-symbols-outlined">campaign</span>
                    New Broadcast
                </button>
            </div>

            <table style={{ marginTop: '0' }}>
                <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 20px' }}>Announcement</th>
                        <th style={{ padding: '12px 20px' }}>Target Audience</th>
                        <th style={{ padding: '12px 20px' }}>Created By</th>
                        <th style={{ padding: '12px 20px' }}>Status</th>
                        <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {announcements.map((a) => (
                        <tr key={a.id} style={{ background: '#fff' }}>
                            <td style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                                    <div style={{ 
                                        width: '32px', 
                                        height: '32px', 
                                        borderRadius: '8px', 
                                        background: a.type === 'urgent' ? 'var(--danger)' : a.type === 'warning' ? 'var(--warning)' : 'var(--primary)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        color: '#fff'
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
                                            {a.type === 'urgent' ? 'priority_high' : a.type === 'warning' ? 'report_problem' : 'info'}
                                        </span>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, color: 'var(--text-deep-brown)' }}>{a.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {a.message}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '20px' }}>
                                <span className="badge" style={{ background: 'var(--bg-peach)', color: 'var(--primary)', fontWeight: 800, fontSize: '0.7rem' }}>
                                    {a.target.toUpperCase()}
                                </span>
                            </td>
                            <td style={{ padding: '20px', fontSize: '0.85rem' }}>
                                <div style={{ fontWeight: 700 }}>{a.creator?.first_name} {a.creator?.last_name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleDateString()}</div>
                            </td>
                            <td style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.is_active ? 'var(--success)' : '#ccc' }}></div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: a.is_active ? 'var(--success)' : 'var(--text-muted)' }}>
                                        {a.is_active ? 'LIVE' : 'INACTIVE'}
                                    </span>
                                </div>
                                {a.expires_at && (
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        Expires: {new Date(a.expires_at).toLocaleDateString()}
                                    </div>
                                )}
                            </td>
                            <td style={{ padding: '20px', textAlign: 'right' }}>
                                <button
                                    onClick={() => handleDelete(a.id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.6 }}
                                    title="Delete Announcement"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {announcements.length === 0 && (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                <div style={{ fontWeight: 700 }}>No announcements staged.</div>
                                <div style={{ fontSize: '0.85rem' }}>Launch your first broadcast to communicate with your users.</div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AnnouncementManager;
