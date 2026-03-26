import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ThemeSwitcher from '../components/ThemeSwitcher';
import NotificationPanel from '../components/NotificationPanel';
import Button from '../components/Button';
import Input from '../components/Input';

const Complaints = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [complaints, setComplaints] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

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
    }, []);

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

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions?limit=50');
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return '#10b981'; // green
            case 'closed': return '#6b7280'; // gray
            case 'open':
            default: return '#f59e0b'; // orange
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="dashboard-brand">
                    <Link to="/dashboard" className="brand-link">
                        {config.system_logo ? (
                            <img
                                src={getImageUrl(config.system_logo)}
                                alt="Logo"
                                className="nav-logo"
                            />
                        ) : (
                            <div className="nav-logo-placeholder">Q</div>
                        )}
                        <span className="brand-name">{config.system_name}</span>
                    </Link>
                </div>

                <div className="dashboard-actions">
                    <nav className="dashboard-nav-links">
                        <Link to="/referrals" className="nav-link" style={styles.navLink}>Refer & Earn</Link>
                        <Link to="/dashboard" className="nav-link" style={styles.navLink}>Dashboard</Link>
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
                                <img
                                    src={getImageUrl(user.profile_picture)}
                                    alt="Avatar"
                                    className="user-avatar"
                                />
                            ) : (
                                <div className="user-avatar-placeholder">
                                    {(user?.full_name || user?.email || 'Q')[0].toUpperCase()}
                                </div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h2 style={{ fontSize: '2.2rem', color: 'var(--text-deep-brown)', marginBottom: '8px', letterSpacing: '-0.5px' }}>Support & Complaints</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Track and manage your inquiries and issues seamlessly.</p>
                    </div>
                    <Button onClick={() => setShowModal(true)} style={{ width: 'auto', padding: '0 28px', borderRadius: '30px', boxShadow: '0 8px 16px rgba(216, 59, 1, 0.2)' }}>
                        + New Complaint
                    </Button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner"></div></div>
                ) : complaints.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '80px 20px', border: '2px dashed var(--border-color)', background: 'transparent', boxShadow: 'none' }}>
                        <div style={{ fontSize: '4rem', opacity: 0.2, marginBottom: '20px' }}>💬</div>
                        <h3 style={{ color: 'var(--text-deep-brown)', marginBottom: '12px', fontSize: '1.4rem' }}>No complaints found</h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>If you experience any issues with your transactions, feel free to submit a new complaint to our support team.</p>
                        <Button onClick={() => setShowModal(true)} variant="outline" style={{ marginTop: '24px', width: 'auto' }}>Open a Ticket</Button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {complaints.map(complaint => (
                            <div key={complaint.id} className="card fade-in" style={{ padding: '24px', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'default' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-deep-brown)', margin: 0 }}>{complaint.subject}</h4>
                                            {complaint.attachment_url && (
                                              <span style={{ background: 'var(--bg-main)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>📎 Attached</span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500, display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span>📅 {new Date(complaint.createdAt).toLocaleDateString()}</span>
                                            {complaint.transaction && (
                                                <>
                                                    <span style={{ opacity: 0.3 }}>|</span>
                                                    <span style={{ color: 'var(--primary)' }}>🔗 TX: {complaint.transaction.transaction_id}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div style={{
                                        padding: '6px 16px',
                                        borderRadius: '30px',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        backgroundColor: `${getStatusColor(complaint.status)}15`,
                                        color: getStatusColor(complaint.status),
                                        border: `1.5px solid ${getStatusColor(complaint.status)}30`,
                                        display: 'inline-block'
                                    }}>
                                        {complaint.status}
                                    </div>
                                </div>
                                
                                <div style={{ 
                                    background: 'var(--bg-light-peach)', 
                                    padding: '20px', 
                                    borderRadius: '12px',
                                    color: 'var(--text-deep-brown)',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6',
                                    border: '1px solid rgba(216, 59, 1, 0.05)'
                                }}>
                                    {complaint.description}
                                </div>
                                
                                {complaint.attachment_url && (
                                    <div style={{ marginTop: '16px', display: 'flex' }}>
                                        <button 
                                            onClick={() => setViewAttachmentUrl(complaint.attachment_url)} 
                                            className="btn-outline" 
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                                        >
                                            👁️ View Attached Document
                                        </button>
                                    </div>
                                )}
                                
                                {complaint.status === 'open' && !complaint.admin_response && (
                                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                                        <button 
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(complaint); }} 
                                            style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-deep-brown)', cursor: 'pointer' }}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCancelComplaint(complaint.id); }} 
                                            style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#ef4444', cursor: 'pointer' }}
                                        >
                                            Cancel Complaint
                                        </button>
                                    </div>
                                )}
                                
                                {complaint.admin_response && (
                                    <div style={{ 
                                        marginTop: '20px', 
                                        background: '#f8fafc',
                                        borderLeft: '4px solid var(--primary)', 
                                        padding: '16px 20px',
                                        borderRadius: '0 12px 12px 0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>A</div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Admin Response</span>
                                        </div>
                                        <p style={{ color: 'var(--text-deep-brown)', margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>
                                            {complaint.admin_response}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* New / Edit Complaint Modal */}
            {showModal && (
                <div className="modal-overlay" style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="card scale-in" style={{ maxWidth: '600px', width: '90%', padding: '0', overflow: 'hidden', border: 'none', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                            <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-deep-brown)' }}>{editId ? 'Edit Complaint' : 'Submit a Complaint'}</h3>
                            <button 
                                onClick={closeModal}
                                style={{ background: 'var(--bg-peach)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#ffebee'; e.currentTarget.style.color = 'var(--danger)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-peach)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={styles.label}>Related Transaction (Optional)</label>
                                <select 
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', color: 'var(--text-deep-brown)', background: 'var(--input-bg)' }}
                                >
                                    <option value="">Select a transaction</option>
                                    {transactions.map(tx => (
                                        <option key={tx.id} value={tx.id}>
                                            {tx.transaction_id} - {tx.amount_sent} GHS ({new Date(tx.createdAt).toLocaleDateString()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <label style={styles.label}>Subject</label>
                                <Input 
                                    placeholder="Brief summary of the issue"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                    style={{ padding: '12px 16px' }}
                                />
                            </div>
                            
                            <div style={{ marginBottom: '24px' }}>
                                <label style={styles.label}>Description</label>
                                <textarea 
                                    placeholder="Provide detailed information about your issue..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={5}
                                    required
                                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.95rem', color: 'var(--text-deep-brown)', background: 'var(--input-bg)', resize: 'vertical', fontFamily: 'inherit' }}
                                />
                            </div>
                            
                            <div style={{ marginBottom: '32px' }}>
                                <label style={styles.label}>Attachment (Screenshot / Detail)</label>
                                {!attachment ? (
                                    <div 
                                        style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '32px 20px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-peach)', transition: 'all 0.2s ease' }} 
                                        onClick={() => document.getElementById('file-upload').click()}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(216, 59, 1, 0.05)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-peach)'; }}
                                    >
                                        <div style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.8 }}>📁</div>
                                        <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px', fontSize: '1.05rem' }}>Click to upload file</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>JPG, PNG, PDF up to 5MB</div>
                                        <input 
                                            id="file-upload"
                                            type="file" 
                                            accept="image/jpeg,image/png,image/gif,application/pdf"
                                            style={{ display: 'none' }}
                                            onChange={handleAttachmentChange}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--input-bg)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #eee' }} />
                                            ) : (
                                                <div style={{ width: '56px', height: '56px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>📄</div>
                                            )}
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'var(--text-deep-brown)', fontSize: '0.95rem', marginBottom: '4px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachment.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{(attachment.size / 1024 / 1024).toFixed(2)} MB</div>
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => { setAttachment(null); setPreviewUrl(''); }} 
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '16px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px' }}>
                                    Cancel
                                </Button>
                                <Button type="submit" loading={submitting} style={{ flex: 1, padding: '14px' }}>
                                    {editId ? 'Save Changes' : 'Submit Ticket'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Document Viewer Modal */}
            {viewAttachmentUrl && (
                <div className="modal-overlay" style={{ zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', padding: '20px' }} onClick={() => setViewAttachmentUrl(null)}>
                    <div className="scale-in" style={{ position: 'relative', width: '100%', maxWidth: '800px', maxHeight: '90vh', background: '#fff', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Attached Document</h3>
                            <button onClick={() => setViewAttachmentUrl(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', background: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', minHeight: '50vh' }}>
                            {viewAttachmentUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/) ? (
                                <img src={getImageUrl(viewAttachmentUrl)} alt="Attachment" style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }} />
                            ) : (
                                <iframe src={getImageUrl(viewAttachmentUrl)} style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '8px', backgroundColor: '#fff' }} title="Attachment Viewer" />
                            )}
                        </div>
                        <div style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid #eee', textAlign: 'right' }}>
                            <a href={getImageUrl(viewAttachmentUrl)} download target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'inline-block', padding: '8px 24px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem' }}>
                                Download File
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Cancellation Confirmation Modal */}
            {showCancelConfirm && (
                <div className="modal-overlay" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                    <div className="card scale-in" style={{ maxWidth: '400px', width: '90%', padding: '32px', textAlign: 'center', border: 'none', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>⚠️</div>
                        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-deep-brown)', marginBottom: '12px' }}>Cancel Complaint?</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
                            Are you sure you want to cancel this complaint? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Button 
                                variant="outline" 
                                onClick={() => { setShowCancelConfirm(false); setComplaintToCancel(null); }} 
                                style={{ flex: 1 }}
                            >
                                Keep it
                            </Button>
                            <Button 
                                onClick={confirmCancel} 
                                style={{ flex: 1, backgroundColor: '#ef4444', color: '#fff' }}
                            >
                                Yes, Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    navLink: {
        color: 'var(--text-deep-brown)',
        fontWeight: 600,
        marginRight: '20px',
        textDecoration: 'none'
    },
    label: {
        display: 'block',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        fontWeight: 600,
        marginBottom: '8px'
    }
};

export default Complaints;
