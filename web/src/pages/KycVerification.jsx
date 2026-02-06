import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const KycVerification = () => {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [documentType, setDocumentType] = useState('');
    const [documentId, setDocumentId] = useState('');
    const [frontFile, setFrontFile] = useState(null);
    const [backFile, setBackFile] = useState(null);

    const documentsByCountry = {
        'Ghana': [
            { id: 'ghana_card', name: 'Ghana Card (E-ID)' },
            { id: 'passport', name: 'Passport' },
            { id: 'drivers_license', name: 'Driver\'s License' }
        ],
        'Canada': [
            { id: 'passport', name: 'Passport' },
            { id: 'pr_card', name: 'Permanent Resident Card' },
            { id: 'drivers_license', name: 'Driver\'s License' },
            { id: 'provincial_id', name: 'Provincial ID' }
        ]
    };

    const currentDocs = documentsByCountry[user?.country] || documentsByCountry['Ghana'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!documentType) return toast.error('Please select a document type');
        if (!documentId) return toast.error('Please enter the document ID number');
        if (!frontFile) return toast.error('Please upload the front of your document');

        const formData = new FormData();
        formData.append('documentType', documentType);
        formData.append('documentId', documentId);
        formData.append('front', frontFile);
        if (backFile) {
            formData.append('back', backFile);
        }

        setLoading(true);
        try {
            await api.post('/auth/kyc', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('KYC Documents submitted for review!');
            if (refreshProfile) await refreshProfile();
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    if (user?.kyc_status === 'verified') {
        return (
            <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="card" style={{ textAlign: 'center', maxWidth: '400px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h2>Fully Verified</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Your identity has been verified. You now have access to high-limit transfers.</p>
                    <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    if (user?.kyc_status === 'pending') {
        return (
            <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="card" style={{ textAlign: 'center', maxWidth: '400px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <h2>Review in Progress</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Our compliance team is currently reviewing your documents. This usually takes 24-48 hours.</p>
                    <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>QWIK<span style={{ fontWeight: 400, opacity: 0.6 }}>VERIFY</span></h1>
                </Link>
                <Link to="/" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-deep-brown)', textDecoration: 'none' }}>Dashboard</Link>
            </header>

            <main style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Identity Verification</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Complete your KYC to increase your daily limit to $5,000.</p>
                </div>

                <form onSubmit={handleSubmit} className="card">
                    <div className="form-group">
                        <label>Select Document Type</label>
                        <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} required>
                            <option value="">-- Select --</option>
                            {currentDocs.map(doc => (
                                <option key={doc.id} value={doc.id}>{doc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Document ID Number</label>
                        <input
                            type="text"
                            value={documentId}
                            onChange={(e) => setDocumentId(e.target.value)}
                            placeholder="GHA-1234567-8"
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Front View</label>
                            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '20px', textAlign: 'center', position: 'relative' }}>
                                {frontFile ? (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>File Selected: {frontFile.name}</div>
                                ) : (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click to upload front</div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFrontFile(e.target.files[0])}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Back View (Optional)</label>
                            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '20px', textAlign: 'center', position: 'relative' }}>
                                {backFile ? (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>File Selected: {backFile.name}</div>
                                ) : (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click to upload back</div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setBackFile(e.target.files[0])}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Verification'}
                    </button>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>
                        Your data is encrypted and handled securely in accordance with our privacy policy.
                    </p>
                </form>
            </main>
        </div>
    );
};

export default KycVerification;
