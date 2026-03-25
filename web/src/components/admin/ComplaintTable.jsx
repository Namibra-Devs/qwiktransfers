import React, { useState } from 'react';
import Button from '../Button';
import Input from '../Input';
import { toast } from 'react-hot-toast';

const ComplaintTable = ({ complaints, updateComplaintStatus, replyToComplaint }) => {
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [statusOption, setStatusOption] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return 'var(--success)';
            case 'closed': return 'var(--text-muted)';
            case 'open':
            default: return '#f59e0b'; // orange
        }
    };

    const handleOpenModal = (complaint) => {
        setSelectedComplaint(complaint);
        setReplyText(complaint.admin_response || '');
        setStatusOption(complaint.status);
        setShowModal(true);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await updateComplaintStatus(selectedComplaint.id, {
                status: statusOption,
                admin_response: replyText
            });
            setShowModal(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>User Interface</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {complaints.map(complaint => (
                        <tr key={complaint.id}>
                            <td style={{ fontSize: '0.85rem' }}>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                            <td>
                                <div style={{ fontWeight: 700 }}>{complaint.user?.full_name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{complaint.user?.email}</div>
                            </td>
                            <td>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{complaint.subject}</div>
                                {complaint.transaction && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>TX: {complaint.transaction.transaction_id}</div>
                                )}
                            </td>
                            <td>
                                <span style={{
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    backgroundColor: `${getStatusColor(complaint.status)}20`,
                                    color: getStatusColor(complaint.status),
                                    border: `1px solid ${getStatusColor(complaint.status)}40`
                                }}>
                                    {complaint.status}
                                </span>
                            </td>
                            <td>
                                <button
                                    onClick={() => handleOpenModal(complaint)}
                                    className="btn-outline"
                                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                >
                                    Respond / View
                                </button>
                            </td>
                        </tr>
                    ))}
                    {complaints.length === 0 && (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No complaints found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {showModal && selectedComplaint && (
                <div className="modal-overlay" style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content scale-in" style={{ width: '100%', maxWidth: '500px', padding: 0 }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Review Complaint</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '16px', background: 'var(--bg-light-peach)', padding: '16px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                                    {selectedComplaint.user?.full_name} ({selectedComplaint.user?.email})
                                </div>
                                <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-deep-brown)' }}>{selectedComplaint.subject}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-deep-brown)', whiteSpace: 'pre-wrap' }}>{selectedComplaint.description}</div>
                                
                                {selectedComplaint.attachment_url && (
                                    <div style={{ marginTop: '12px' }}>
                                        <a href={selectedComplaint.attachment_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>
                                            📎 View Attached File
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Update Status</label>
                                <select 
                                    value={statusOption}
                                    onChange={(e) => setStatusOption(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                                >
                                    <option value="open">Open</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Admin Response (Sent to User)</label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your response here..."
                                    rows={4}
                                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Button variant="outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</Button>
                                <Button onClick={handleSubmit} loading={submitting} style={{ flex: 1 }}>Submit Update</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComplaintTable;
