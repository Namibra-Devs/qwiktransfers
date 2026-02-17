import React from 'react';

const KYCTable = ({ users, updateKYC, setPreviewImage, setPreviewDate, setShowPreviewModal }) => {
    return (
        <table style={{ marginTop: '0' }}>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Document Info</th>
                    <th>Verification Files</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map((u) => (
                    <tr key={u.id}>
                        <td style={{ fontWeight: 600 }}>
                            {u.full_name}<br />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{u.email}</span>
                        </td>
                        <td>
                            {u.kyc_document_type ? (
                                <div style={{ fontSize: '0.85rem' }}>
                                    <strong>{u.kyc_document_type.replace('_', ' ').toUpperCase()}</strong><br />
                                    ID: {u.kyc_document_id}
                                </div>
                            ) : (
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No Details</span>
                            )}
                        </td>
                        <td>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {u.kyc_front_url && (
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewImage(`http://localhost:5000${u.kyc_front_url}`);
                                            setPreviewDate(u.updatedAt);
                                            setShowPreviewModal(true);
                                        }}
                                        style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Front
                                    </span>
                                )}
                                {u.kyc_back_url && (
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewImage(`http://localhost:5000${u.kyc_back_url}`);
                                            setPreviewDate(u.updatedAt);
                                            setShowPreviewModal(true);
                                        }}
                                        style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Back
                                    </span>
                                )}
                                {!u.kyc_front_url && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None</span>}
                            </div>
                        </td>
                        <td><span className={`badge badge-${u.kyc_status}`}>{u.kyc_status}</span></td>
                        <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button onClick={() => updateKYC(u.id, 'verified')} style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}>Verify</button>
                                <button onClick={() => updateKYC(u.id, 'rejected')} style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                            </div>
                        </td>
                    </tr>
                ))}
                {users.length === 0 && (
                    <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No pending KYC requests.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default KYCTable;
