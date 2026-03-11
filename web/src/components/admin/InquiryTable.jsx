import React from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const InquiryTable = ({ inquiries, fetchInquiries }) => {
    
    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/support/inquiries/${id}`, { status });
            toast.success(`Inquiry marked as ${status}`);
            fetchInquiries();
        } catch (error) {
            toast.error('Failed to update inquiry status');
        }
    };

    return (
        <div className="fade-in">
            <table style={{ borderCollapse: 'separate', borderSpacing: '0 8px', width: '100%', marginTop: '0' }}>
                <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '12px 20px' }}>Sender</th>
                        <th style={{ padding: '12px 20px' }}>Subject & Message</th>
                        <th style={{ padding: '12px 20px' }}>Date</th>
                        <th style={{ padding: '12px 20px' }}>Status</th>
                        <th style={{ padding: '12px 20px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {inquiries.map(inquiry => (
                        <tr key={inquiry.id} className="row-hover" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            <td style={{ padding: '20px' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-deep-brown)' }}>{inquiry.full_name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inquiry.email}</div>
                            </td>
                            <td style={{ padding: '20px', maxWidth: '400px' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '4px', color: 'var(--primary)' }}>{inquiry.subject}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-deep-brown)', lineHeight: '1.4', opacity: 0.8 }}>
                                    {inquiry.message}
                                </div>
                            </td>
                            <td style={{ padding: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {new Date(inquiry.createdAt).toLocaleDateString()}
                                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{new Date(inquiry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td style={{ padding: '20px' }}>
                                <span className={`badge badge-${inquiry.status}`} style={{ 
                                    textTransform: 'uppercase', 
                                    fontSize: '0.65rem', 
                                    fontWeight: 800, 
                                    padding: '4px 10px',
                                    borderRadius: '100px'
                                }}>
                                    {inquiry.status}
                                </span>
                            </td>
                            <td style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {inquiry.status === 'pending' && (
                                        <button 
                                            onClick={() => updateStatus(inquiry.id, 'replied')}
                                            style={{ 
                                                padding: '6px 12px', 
                                                borderRadius: '8px', 
                                                border: 'none', 
                                                background: 'var(--secondary)', 
                                                color: 'white', 
                                                fontSize: '0.75rem', 
                                                fontWeight: 700,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Mark Replied
                                        </button>
                                    )}
                                    {inquiry.status !== 'closed' && (
                                        <button 
                                            onClick={() => updateStatus(inquiry.id, 'closed')}
                                            style={{ 
                                                padding: '6px 12px', 
                                                borderRadius: '8px', 
                                                border: '1.5px solid var(--border-color)', 
                                                background: '#fff', 
                                                color: 'var(--text-deep-brown)', 
                                                fontSize: '0.75rem', 
                                                fontWeight: 700,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Close
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {inquiries.length === 0 && (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📨</div>
                                <div>No support inquiries found. You're all caught up!</div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            
            <style>{`
                .row-hover {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .row-hover:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
                }
                .badge-pending { background: rgba(224, 161, 46, 0.1); color: #e0a12e; }
                .badge-replied { background: rgba(16, 124, 16, 0.1); color: #107c10; }
                .badge-closed { background: rgba(0, 0, 0, 0.05); color: #666; }
            `}</style>
        </div>
    );
};

export default InquiryTable;
