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

                    <div className="help-box">
                        <h4>Revenue & Profit Analysis</h4>
                        <p>Total Revenue is calculated based on the <strong>Market Rate Baseline</strong> System.</p>
                        <ul>
                            <li><strong>Market Rate:</strong> The real mid-market exchange rate at the time of the transaction.</li>
                            <li><strong>Actual Rate:</strong> The rate provided to the user (can be manually adjusted in settings).</li>
                            <li><strong>Profit calculation:</strong> The system automatically calculates the difference between the Market Rate and your Actual Rate to determine your exact margin in CAD.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'reports',
            title: 'Reporting & Exports',
            icon: '📄',
            content: (
                <div className="help-content">
                    <h3>Exporting Platform Data</h3>
                    <p>You can export various datasets to Microsoft Excel (XLSX) for offline analysis or tax reporting.</p>

                    <div className="help-box">
                        <h4>Analytics Report</h4>
                        <p>Go to the Analytics tab and click <strong>"Export Full Analytics"</strong>. This generates a detailed list of all successful transactions, including their market rate, actual rate, and specific profit margin for each.</p>
                    </div>

                    <div className="help-box">
                        <h4>Audit Log Export</h4>
                        <p>In the Audit Logs tab, click <strong>"Export XLSX"</strong>. This provides a complete history of all administrative actions, including logo updates, system backups, configuration changes, and user logins.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'system',
            title: 'Monitoring & Alerts',
            icon: '🚨',
            content: (
                <div className="help-content">
                    <h3>System Health & Monitoring</h3>
                    <p>The system automatically monitors platform health every hour to protect against business dips or security risks.</p>

                    <div className="help-box">
                        <h4>Autonomous Alerts</h4>
                        <ul>
                            <li><strong>Volume Drop:</strong> Triggered if transaction volume falls 70% below your 7-day average. You will receive a Push Notification.</li>
                            <li><strong>KYC Spikes:</strong> Triggered if 5 or more KYC rejections occur within a single hour (indicates potential bot activity).</li>
                        </ul>
                    </div>

                    <div className="help-box">
                        <h4>Audit Table Cleanup</h4>
                        <p>To prevent the database from slowing down, you should periodically prune the Audit Logs.</p>
                        <ul>
                            <li><strong>Manual Cleanup:</strong> Use the "Clean Old Logs" button in the Audit tab to delete logs older than 90 days.</li>
                            <li><strong>Automatic Option:</strong> Can be toggled in System Settings to run once a week automatically at 3 AM.</li>
                        </ul>
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
        },
        {
            id: 'inquiries',
            title: 'Support Inquiries',
            icon: '📩',
            content: (
                <div className="help-content">
                    <h3>Support & Ticket Management</h3>
                    <p>Users can send messages via the Contact Us page. These appear in the Inquiries tab for administrative review.</p>

                    <div className="help-box">
                        <h4>Status Filtering</h4>
                        <ul>
                            <li><strong>Pending:</strong> New messages requiring attention.</li>
                            <li><strong>Replied:</strong> Messages that have received an administrative response.</li>
                            <li><strong>Closed:</strong> Resolved issues hidden from the active list.</li>
                        </ul>
                    </div>

                    <div className="help-box">
                        <h4>Action Buttons</h4>
                        <p>You can mark an inquiry as <strong>Replied</strong> to track progress, or <strong>Close</strong> it once the user's issue is fully resolved.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'system-mgmt',
            title: 'System Management',
            icon: '⚙️',
            content: (
                <div className="help-content">
                    <h3>Global Configuration & Safety</h3>
                    <p>The System Settings page controls the core identity and security of the Qwiktransfers platform.</p>

                    <div className="help-box">
                        <h4>Branding & Identity</h4>
                        <ul>
                            <li><strong>System Name:</strong> Updates the name shown in emails, the dashboard, and the browser tab.</li>
                            <li><strong>Logo Management:</strong> Upload a high-resolution transparent PNG. The system automatically performs cleanup of older versions.</li>
                        </ul>
                    </div>

                    <div className="help-box">
                        <h4>Security & Backups</h4>
                        <ul>
                            <li><strong>Manual Backup:</strong> Instantly trigger a full database dump to the server's secure storage.</li>
                            <li><strong>Auto-Backup:</strong> If enabled, the system performs a rollover backup every 24 hours.</li>
                            <li><strong>Maintenance Mode:</strong> Toggles a fallback screen for users during critical updates or security patches.</li>
                        </ul>
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
