import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DashboardHeader from '../components/DashboardHeader';
import Button from '../components/Button';
import Input from '../components/Input';

const Complaints = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('my'); // 'my' or 'reports'
    const [complaints, setComplaints] = useState([]);
    const [userReports, setUserReports] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportsLoading, setReportsLoading] = useState(false);

    const [config, setConfig] = useState({
        system_name: 'QWIK',
        system_logo: ''
    });

    const [showModal, setShowModal] = useState(false);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // New States
    const [editId, setEditId] = useState(null);
    const [viewAttachmentUrl, setViewAttachmentUrl] = useState(null);

    // Cancellation Modal State
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [complaintToCancel, setComplaintToCancel] = useState(null);

    useEffect(() => {
        if (showModal || viewAttachmentUrl || showCancelConfirm) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    }, [showModal, viewAttachmentUrl, showCancelConfirm]);

    const handleAttachmentChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                toast.error('Only images (JPG/PNG/GIF) and PDFs are allowed');
                e.target.value = '';
                return;
            }
            setAttachment(file);
            if (file.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                setPreviewUrl('');
            }
        }
    };

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const configRes = await api.get('/system/config/public');
                setConfig({
                    system_name: configRes.data.system_name || 'QWIK',
                    system_logo: configRes.data.system_logo || ''
                });
            } catch (error) {
                console.error('Config fetch error:', error);
            }
        };
        fetchConfig();
        fetchComplaints();
        fetchTransactions();
        if (user?.role === 'vendor') {
            fetchUserReports();
        }
    }, [user?.role]);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/complaints');
            setComplaints(res.data.complaints);
        } catch (error) {
            toast.error('Failed to load complaints');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserReports = async () => {
        setReportsLoading(true);
        try {
            const res = await api.get('/complaints/vendor');
            setUserReports(res.data.complaints);
        } catch (error) {
            console.error('Failed to load user reports', error);
        } finally {
            setReportsLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            // Vendors fetch their own transactions, users fetch theirs
            const endpoint = user?.role === 'vendor' ? '/vendor/history' : '/transactions?limit=50';
            const res = await api.get(endpoint);
            setTransactions(res.data.transactions || []);
        } catch (error) {
            console.error('Failed to load transactions for dropdown', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject || !description) {
            return toast.error('Subject and description are required');
        }

        setSubmitting(true);
        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('description', description);
        if (transactionId) formData.append('transaction_id', transactionId);
        if (attachment) formData.append('attachment', attachment);

        try {
            if (editId) {
                await api.patch(`/complaints/${editId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Complaint updated successfully');
            } else {
                await api.post('/complaints', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Complaint submitted successfully');
            }
            closeModal();
            fetchComplaints();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to submit complaint');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (complaint) => {
        setEditId(complaint.id);
        setSubject(complaint.subject);
        setDescription(complaint.description);
        setTransactionId(complaint.transaction_id || '');
        setAttachment(null);
        setPreviewUrl('');
        setShowModal(true);
    };

    const handleCancelComplaint = (id) => {
        setComplaintToCancel(id);
        setShowCancelConfirm(true);
    };

    const confirmCancel = async () => {
        if (!complaintToCancel) return;
        try {
            await api.delete(`/complaints/${complaintToCancel}`);
            toast.success('Complaint cancelled successfully');
            fetchComplaints();
        } catch (error) {
            toast.error('Failed to cancel complaint');
        } finally {
            setShowCancelConfirm(false);
            setComplaintToCancel(null);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditId(null);
        setSubject('');
        setDescription('');
        setTransactionId('');
        setAttachment(null);
        setPreviewUrl('');
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'resolved': return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
            case 'closed': return { background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', border: '1px solid rgba(107, 114, 128, 0.2)' };
            case 'open':
            default: return { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' };
        }
    };

    const renderComplaintCard = (complaint, isReport = false) => (
        <div key={complaint.id} className="glass-card fade-in" style={{ padding: '24px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-deep-brown)', margin: 0 }}>{complaint.subject}</h4>
                        {complaint.attachment_url && (
                            <span style={{ background: 'var(--bg-main)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>📎 ATTACHED</span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                        <span>📅 {new Date(complaint.createdAt).toLocaleDateString()}</span>
                        {complaint.transaction && (
                            <>
                                <span style={{ opacity: 0.3 }}>|</span>
                                <span style={{ color: 'var(--primary)', fontWeight: 800 }}>🔗 TX: {complaint.transaction.transaction_id}</span>
                            </>
                        )}
                        {isReport && complaint.user && (
                            <>
                                <span style={{ opacity: 0.3 }}>|</span>
                                <span style={{ color: 'var(--secondary)', fontWeight: 800 }}>👤 FROM: {complaint.user.first_name} {complaint.user.last_name}</span>
                            </>
                        )}
                    </div>
                </div>
                <div style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    ...getStatusStyle(complaint.status)
                }}>
                    {complaint.status}
                </div>
            </div>

            <div style={{
                background: 'rgba(183, 71, 42, 0.03)',
                padding: '20px',
                borderRadius: '16px',
                color: 'var(--text-deep-brown)',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                border: '1px solid rgba(183, 71, 42, 0.05)',
                fontWeight: 500
            }}>
                {complaint.description}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {complaint.attachment_url && (
                        <button
                            onClick={() => setViewAttachmentUrl(complaint.attachment_url)}
                            className="refresh-btn"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', padding: '10px 20px', borderRadius: '12px', fontWeight: 700 }}
                        >
                            👁️ View Attachment Document
                        </button>
                    )}
                </div>

                {!isReport && complaint.status === 'open' && !complaint.admin_response && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={(e) => { e.preventDefault(); handleEdit(complaint); }}
                            className="refresh-btn"
                            style={{ padding: '8px 20px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800 }}
                        >
                            Modify
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); handleCancelComplaint(complaint.id); }}
                            style={{ padding: '8px 20px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {complaint.admin_response && (
                <div style={{
                    marginTop: '24px',
                    background: 'var(--bg-main)',
                    borderLeft: '4px solid var(--primary)',
                    padding: '20px',
                    borderRadius: '0 16px 16px 0',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>A</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '1px' }}>Official Resolution</span>
                    </div>
                    <p style={{ color: 'var(--text-deep-brown)', margin: 0, fontSize: '0.95rem', lineHeight: '1.6', fontWeight: 600 }}>
                        {complaint.admin_response}
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <div className="dashboard-container">
            <DashboardHeader
                user={user}
                logout={logout}
                config={config}
                type={user?.role || 'user'}
            />

            <main className="dashboard-main fade-in" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-deep-brown)', marginBottom: '8px', letterSpacing: '-1px' }}>Support Center</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>{user?.role === 'vendor' ? 'Manage your internal complaints and reviews.' : 'Track and manage your inquiries and issues seamlessly..'}</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="complete-cta"
                        style={{ width: 'auto', padding: '16px 32px', borderRadius: '16px', fontWeight: 900, fontSize: '1rem' }}
                    >
                        Establish Ticket
                    </button>
                </div>

                {user?.role === 'vendor' && (
                    <div className="pill-tab-switcher" style={{ marginBottom: '40px' }}>
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
                        >
                            Support Tickets
                        </button>
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
                        >
                            User Reports ({userReports.length})
                        </button>
                    </div>
                )}

                {loading || (activeTab === 'reports' && reportsLoading) ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}><div className="spinner"></div></div>
                ) : (
                    <>
                        {activeTab === 'my' ? (
                            complaints.length === 0 ? (
                                <div className="glass-card" style={{ textAlign: 'center', padding: '100px 40px', border: '2px dashed var(--border-color)', background: 'transparent' }}>
                                    <div style={{ fontSize: '5rem', marginBottom: '24px', opacity: 0.3 }}>📬</div>
                                    <h3 style={{ color: 'var(--text-deep-brown)', marginBottom: '16px', fontSize: '1.6rem', fontWeight: 800 }}>Clear for takeoff</h3>
                                    <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6', fontWeight: 500 }}>You have no active support tickets. If you need assistance, our team is ready to help.</p>
                                    <button onClick={() => setShowModal(true)} className="refresh-btn" style={{ marginTop: '32px', padding: '12px 32px', borderRadius: '12px', fontWeight: 700 }}>Initiate Inquiry</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {complaints.map(c => renderComplaintCard(c, false))}
                                </div>
                            )
                        ) : (
                            userReports.length === 0 ? (
                                <div className="glass-card" style={{ textAlign: 'center', padding: '100px 40px', border: '2px dashed var(--border-color)', background: 'transparent' }}>
                                    <div style={{ fontSize: '5rem', marginBottom: '24px', opacity: 0.3 }}>💎</div>
                                    <h3 style={{ color: 'var(--text-deep-brown)', marginBottom: '16px', fontSize: '1.6rem', fontWeight: 800 }}>Impeccable Record</h3>
                                    <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6', fontWeight: 500 }}>No users have filed complaints against your transactions. Keep up the great work!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {userReports.map(c => renderComplaintCard(c, true))}
                                </div>
                            )
                        )}
                    </>
                )}
            </main>

            {/* Modal - Redesigned with Glassmorphism */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass fade-in" style={{ maxWidth: '600px' }}>
                        <div style={{ padding: '32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)' }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-deep-brown)' }}>{editId ? 'Modify Ticket' : 'Submit a Complaint'}</h3>
                            <button onClick={closeModal} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 800 }}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={styles.label}>ASSOCIATED OPERATION</label>
                                <select
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        border: '1px solid var(--border-color)',
                                        fontSize: '1rem',
                                        color: 'var(--text-deep-brown)',
                                        background: 'rgba(0,0,0,0.02)',
                                        fontWeight: 600,
                                        outline: 'none'
                                    }}
                                >
                                    <option value="">Select relevant transaction</option>
                                    {transactions.map(tx => (
                                        <option key={tx.id} value={tx.id}>
                                            #{tx.transaction_id} | {tx.amount_sent} {tx.type?.split('-')[0] || 'GHS'} - {new Date(tx.createdAt).toLocaleDateString()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={styles.label}>TICKET SUBJECT</label>
                                <Input
                                    placeholder="Brief nature of escalation"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                    style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.02)' }}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={styles.label}>OPERATIONAL DETAIL</label>
                                <textarea
                                    placeholder="Provide comprehensive details for review..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={5}
                                    required
                                    style={{ width: '100%', padding: '20px', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '1rem', color: 'var(--text-deep-brown)', background: 'rgba(0,0,0,0.02)', resize: 'none', fontFamily: 'inherit', fontWeight: 500, outline: 'none' }}
                                />
                            </div>

                            <div style={{ marginBottom: '40px' }}>
                                <label style={styles.label}>DOCUMENTATION / PROOF</label>
                                {!attachment ? (
                                    <div
                                        style={{ border: '2px dashed var(--border-color)', borderRadius: '20px', padding: '40px 20px', textAlign: 'center', cursor: 'pointer', background: 'rgba(183, 71, 42, 0.02)', transition: 'all 0.3s ease' }}
                                        onClick={() => document.getElementById('file-upload').click()}
                                    >
                                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📸</div>
                                        <div style={{ fontWeight: 900, color: 'var(--primary)', marginBottom: '4px', fontSize: '1rem' }}>Click to upload file</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>JPG, PNG or PDF (Max 5MB)</div>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif,application/pdf"
                                            style={{ display: 'none' }}
                                            onChange={handleAttachmentChange}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }}>📄</div>
                                            )}
                                            <div>
                                                <div style={{ fontWeight: 900, color: 'var(--text-deep-brown)', fontSize: '0.95rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{attachment.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>{(attachment.size / 1024 / 1024).toFixed(2)} MB</div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setAttachment(null); setPreviewUrl(''); }}
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 900, padding: '8px 16px', borderRadius: '10px', cursor: 'pointer' }}
                                        >
                                            REMOVE
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button type="button" onClick={closeModal} className="refresh-btn" style={{ flex: 1, padding: '16px', borderRadius: '16px', fontWeight: 800 }}>Discard</button>
                                <button type="submit" disabled={submitting} className="complete-cta" style={{ flex: 2, padding: '16px', borderRadius: '16px', fontWeight: 900 }}>
                                    {submitting ? 'Transmitting...' : (editId ? 'Commit Update' : 'Submit Ticket')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Document Viewer Modal */}
            {viewAttachmentUrl && (
                <div className="modal-overlay" style={{ zIndex: 14000 }} onClick={() => setViewAttachmentUrl(null)}>
                    <div className="modal-content glass scale-in" style={{ maxWidth: '900px', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-deep-brown)' }}>Attached Document</h3>
                            <button onClick={() => setViewAttachmentUrl(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 800 }}>✕</button>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', background: 'rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px', minHeight: '60vh' }}>
                            {viewAttachmentUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/) ? (
                                <img src={getImageUrl(viewAttachmentUrl)} alt="Attachment" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} />
                            ) : (
                                <iframe src={getImageUrl(viewAttachmentUrl)} style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '12px', background: 'white' }} title="Attachment Viewer" />
                            )}
                        </div>
                        <div style={{ padding: '24px 32px', textAlign: 'right', background: 'var(--bg-main)' }}>
                            <a href={getImageUrl(viewAttachmentUrl)} download target="_blank" rel="noreferrer" className="complete-cta" style={{ display: 'inline-block', padding: '12px 32px', borderRadius: '12px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 900, width: 'auto' }}>
                                Download File
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancellation Confirmation Modal */}
            {showCancelConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content glass scale-in" style={{ maxWidth: '400px', padding: '40px', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>⚠️</div>
                        <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-deep-brown)', marginBottom: '16px' }}>Retract Ticket?</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '40px', lineHeight: '1.6', fontWeight: 500 }}>
                            Are you sure you want to retract this ticket? This action will archive the investigation.
                        </p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button onClick={() => { setShowCancelConfirm(false); setComplaintToCancel(null); }} className="refresh-btn" style={{ flex: 1, padding: '16px', borderRadius: '16px', fontWeight: 800 }}>Keep Open</button>
                            <button onClick={confirmCancel} style={{ flex: 1, padding: '16px', borderRadius: '16px', fontWeight: 900, backgroundColor: '#ef4444', color: '#fff', border: 'none' }}>Retract</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    label: {
        display: 'block',
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        fontWeight: 900,
        marginBottom: '10px',
        letterSpacing: '1px'
    }
};

export default Complaints;
