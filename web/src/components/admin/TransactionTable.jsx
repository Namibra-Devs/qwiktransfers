import React from 'react';
import { getImageUrl } from '../../services/api';

const TransactionTable = ({ transactions, updateStatus, updatingTxId, vendors, openAssignVendorModal, setAdminConfirmData, setShowAdminConfirmModal, setSelectedTx, setShowTxModal, setPreviewImage, setPreviewDate, setShowPreviewModal }) => {
    return (
        <table style={{ marginTop: '0' }}>
            <thead>
                <tr>
                    <th>Transaction ID</th>
                    <th>User / Recipient</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Handled By</th>
                    <th>Proof</th>
                    <th style={{ textAlign: 'right' }}>Admin Override</th>
                </tr>
            </thead>
            <tbody>
                {transactions.map((tx) => (
                    <tr key={tx.id} onClick={() => { setSelectedTx(tx); setShowTxModal(true); }} style={{ cursor: 'pointer' }}>
                        <td>
                            <div style={{ fontWeight: 600 }}>{tx.transaction_id}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(tx.createdAt).toLocaleString()}</div>
                        </td>
                        <td>
                            <div style={{ fontWeight: 600 }}>{tx.user?.email}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1rem', opacity: 0.5 }}>arrow_forward</span>
                                {tx.recipient_details?.name} | <span style={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.7rem' }}>
                                    {tx.recipient_details?.type === 'momo' ? (tx.recipient_details?.momo_provider || 'Momo') :
                                        tx.recipient_details?.type === 'bank' ? (tx.recipient_details?.bank_name || 'Bank') :
                                            tx.recipient_details?.type === 'interac' ? 'Interac' : 'Recipient'}
                                </span>
                            </div>
                        </td>
                        <td>
                            <div style={{ fontWeight: 700 }}>{tx.amount_received} {tx.type?.split('-')[1] || 'CAD'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tx.amount_sent} {tx.type?.split('-')[0] || 'GHS'}</div>
                        </td>
                        <td><span className={`badge badge-${tx.status}`}>{tx.status}</span></td>
                        <td onClick={(e) => e.stopPropagation()}>
                            {tx.vendor ? (
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-deep-brown)' }}>
                                    {tx.vendor.first_name} {tx.vendor.last_name?.charAt(0)}.
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tx.vendor.email}</div>
                                </div>
                            ) : (
                                <select 
                                    onChange={(e) => openAssignVendorModal(tx.id, e.target.value)}
                                    value=""
                                    disabled={updatingTxId === tx.id}
                                    style={{ padding: '6px', borderRadius: '6px', border: '1px dashed var(--primary)', fontSize: '0.8rem', background: 'transparent', cursor: updatingTxId === tx.id ? 'not-allowed' : 'pointer', maxWidth: '120px', opacity: updatingTxId === tx.id ? 0.5 : 1 }}
                                >
                                    <option value="" disabled>Assign Vendor...</option>
                                    {vendors?.filter(v => v.is_online).map(v => (
                                        <option key={v.id} value={v.id}>{v.first_name} ({v.country === 'All' ? 'Global' : v.country})</option>
                                    ))}
                                </select>
                            )}
                        </td>
                        <td>
                            {tx.proof_url ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewImage(getImageUrl(tx.proof_url));
                                            setPreviewDate(tx.proof_uploaded_at || tx.updatedAt);
                                            setShowPreviewModal(true);
                                        }}
                                        style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>visibility</span>
                                        View
                                    </span>
                                </div>
                            ) : (
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None</span>
                            )}
                        </td>
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                {tx.status === 'pending' && (
                                    <button 
                                        disabled={updatingTxId === tx.id}
                                        onClick={() => updateStatus(tx.id, 'processing')} 
                                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '6px 12px', background: 'rgba(183, 71, 42, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '50px', fontWeight: 700, cursor: updatingTxId === tx.id ? 'not-allowed' : 'pointer', opacity: updatingTxId === tx.id ? 0.5 : 1 }} 
                                        title="Force transaction to Processing state"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>manufacturing</span>
                                        Force Process
                                    </button>
                                )}
                                {tx.status === 'processing' && (
                                    <button 
                                        disabled={updatingTxId === tx.id}
                                        onClick={() => {
                                            setAdminConfirmData({ transactionId: tx.id, pin: '', proofImage: null });
                                            setShowAdminConfirmModal(true);
                                        }} 
                                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '6px 12px', background: '#4A154B', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 700, cursor: updatingTxId === tx.id ? 'not-allowed' : 'pointer', boxShadow: '0 4px 10px rgba(74, 21, 75, 0.2)', opacity: updatingTxId === tx.id ? 0.5 : 1 }} 
                                        title="Require PIN and Proof to confirm transaction"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>gavel</span>
                                        Admin Confirm
                                    </button>
                                )}
                                {tx.status === 'sent' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>verified</span>
                                        Done
                                    </div>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
                {transactions.length === 0 && (
                    <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No transactions found.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default TransactionTable;
