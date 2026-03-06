import React, { useState } from 'react';

const HelpCenter = () => {
    const [activeSection, setActiveSection] = useState('analytics');

    const sections = [
        {
            id: 'analytics',
            title: 'Advanced Analytics',
            icon: '📈',
            content: (
                <div className="help-content">
                    <h3>Understanding the Analytics Suite</h3>
                    <p>The Analytics tab provides a high-level view of platform health and growth trends over the last 30 days.</p>

                    <div className="help-box">
                        <h4>MoM Volume Growth</h4>
                        <p>This percentage shows the change in total transaction volume compared to the daily average of the previous month.
                            <br /><strong>Green (↑):</strong> You are outperforming last month's pace.
                            <br /><strong>Red (↓):</strong> Volume is currently lower than last month's daily average.</p>
                    </div>

                    <div className="help-box">
                        <h4>Transaction Volume Trend</h4>
                        <p>Displays daily successful transfers.
                            <br /><strong>CAD Volume:</strong> Total dollars sent from Canada.
                            <br /><strong>GHS Volume:</strong> Total Cedis sent from Ghana (displayed with a CAD-reference value for comparison).</p>
                    </div>

                    <div className="help-box">
                        <h4>Acquisition (New Users)</h4>
                        <p>Tracks how many new 'User' roles were created within the 30-day window. This helps measure the success of marketing efforts.</p>
                    </div>

                    <div className="help-box">
                        <h4>TX per User Ratio</h4>
                        <p>Calculated as <code>Total Transactions / New Users</code>. A higher number indicates strong engagement and repeat use by your newer customer base.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'transactions',
            title: 'Transaction Pool',
            icon: '📊',
            content: (
                <div className="help-content">
                    <h3>Managing Global Transactions</h3>
                    <p>The Transaction Pool is where you monitor and process all platform transfers.</p>

                    <div className="help-box">
                        <h4>Status Workflow</h4>
                        <ul>
                            <li><strong>Pending:</strong> User has initiated the transfer. Verification of payment is required.</li>
                            <li><strong>Processing:</strong> Admin or Vendor has acknowledged the transfer and is preparing the payout.</li>
                            <li><strong>Sent:</strong> The recipient has received the funds. The transaction is finalized.</li>
                            <li><strong>Cancelled:</strong> Order was stopped by the user or admin (only possible if not processed).</li>
                        </ul>
                    </div>

                    <div className="help-box">
                        <h4>Payment Proofs</h4>
                        <p>Users must upload a screenshot (Interac/Momo/Bank confirmation) within 15 minutes to lock their rate. Review these by clicking the image icon in the table.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'kyc',
            title: 'KYC & Verification',
            icon: '🆔',
            content: (
                <div className="help-content">
                    <h3>Identity Verification (KYC)</h3>
                    <p>To comply with financial regulations, users must be verified before they can access higher transaction limits.</p>

                    <div className="help-box">
                        <h4>Verification Tiers</h4>
                        <ul>
                            <li><strong>Unverified:</strong> Limited to small daily amounts ($50 CAD).</li>
                            <li><strong>Email Verified:</strong> Mid-tier limits ($500 CAD).</li>
                            <li><strong>KYC Verified:</strong> Full platform access ($5000 CAD daily).</li>
                        </ul>
                    </div>

                    <div className="help-box">
                        <h4>Approving Documents</h4>
                        <p>Ensure the ID name matches the account name and the photo is clear. Use the 'Verify' or 'Reject' buttons in the User Management modal.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'vendors',
            title: 'Vendor Management',
            icon: '🏢',
            content: (
                <div className="help-content">
                    <h3>Managing Platform Vendors</h3>
                    <p>Vendors are special accounts that help process transactions in specific regions.</p>

                    <div className="help-box">
                        <h4>Region Assignment</h4>
                        <p>You can assign a vendor to 'Canada', 'Ghana', or 'All'. Vendors only see and process transactions originating in their assigned region.</p>
                    </div>

                    <div className="help-box">
                        <h4>Performance Tracking</h4>
                        <p>The vendor modal shows individual success rates and total volume handled. Use this to identify your most reliable partners.</p>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="help-center-container fade-in">
            <div className="card" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '600px', padding: 0, overflow: 'hidden' }}>
                {/* Sidebar */}
                <div style={{ background: 'var(--bg-peach)', borderRight: '1px solid var(--border-color)', padding: '24px' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', color: 'var(--primary)' }}>Help Center</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    background: activeSection === section.id ? 'var(--primary)' : 'transparent',
                                    color: activeSection === section.id ? '#fff' : 'var(--text-deep-brown)',
                                    borderRadius: '12px',
                                    border: 'none',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <span>{section.icon}</span>
                                {section.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ padding: '40px', overflowY: 'auto' }}>
                    {sections.find(s => s.id === activeSection)?.content}
                </div>
            </div>

            <style>{`
                .help-content h3 {
                    font-size: 1.5rem;
                    margin-bottom: 16px;
                    color: var(--text-deep-brown);
                }
                .help-content p {
                    color: var(--text-muted);
                    line-height: 1.6;
                    margin-bottom: 32px;
                }
                .help-box {
                    background: #fff;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 20px;
                }
                .help-box h4 {
                    margin: 0 0 12px 0;
                    color: var(--primary);
                    font-size: 1rem;
                    font-weight: 800;
                    text-transform: uppercase;
                }
                .help-box p, .help-box li {
                    margin: 0;
                    font-size: 0.95rem;
                    color: var(--text-deep-brown);
                }
                .help-box ul {
                    padding-left: 20px;
                    margin-top: 12px;
                }
                .help-box li {
                    margin-bottom: 8px;
                }
            `}</style>
        </div>
    );
};

export default HelpCenter;
