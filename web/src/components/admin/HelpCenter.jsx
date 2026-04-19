import React, { useState } from 'react';

const HelpCenter = () => {
    const [activeSection, setActiveSection] = useState('staff');

    const sections = [
        {
            id: 'staff',
            title: 'Administrative Staffing',
            icon: 'badge',
            content: (
                <div className="help-content">
                    <h3>Managing Your Admin Team</h3>
                    <p>Qwiktransfers supports a multi-tier administrative structure to help you delegate tasks without compromising platform security.</p>

                    <div className="help-box">
                        <h4>Administrative Roles</h4>
                        <ul>
                            <li><strong>Super Admin:</strong> Full platform access. Only Supers can manage other administrative staff, modify bank/market rates, and access the Help Center and System Management pages.</li>
                            <li><strong>Support Admin:</strong> Focused on operations. Can manage Users, Vendors, and Transactions, but cannot add/remove other admins or change sensitive system configurations.</li>
                        </ul>
                    </div>

                    <div className="help-box">
                        <h4>Security & 2FA</h4>
                        <p>All admins can enable Two-Factor Authentication (2FA) in their profile for added security. This is highly recommended for any account with 'Super' privileges.</p>
                    </div>

                    <div className="help-box">
                        <h4>Security PIN</h4>
                        <p>A 4-digit Security PIN is required for high-risk actions such as assigning vendors to transactions or confirming a manual payout override. <strong>Admins must set this in their Profile settings before processing transactions.</strong></p>
                    </div>
                </div>
            )
        },
        {
            id: 'analytics',
            title: 'Advanced Analytics',
            icon: 'analytics',
            content: (
                <div className="help-content">
                    <h3>The Intelligence Hub</h3>
                    <p>The Analytics dashboard provides deep business intelligence into your platform's liquidity, growth, and profitability.</p>

                    <div className="help-box">
                        <h4>MTD Volume Growth</h4>
                        <p>This percentage tracks your performance relative to the previous month:
                             <br /><strong>Formula:</strong> <code>((Current Month Volume - Last Month Volume) / Last Month Volume) x 100</code>.
                             <br /><strong>Benchmark:</strong> It compares the total successful volume of the current calendar month against the total volume of the entire previous calendar month. It helps you see if your platform is scaling month-over-month.</p>
                    </div>

                    <div className="help-box">
                        <h4>New Acquisitions</h4>
                        <p>This metric tracks user growth velocity. It displays the total number of new accounts created with the <strong>'User'</strong> role within the last 30 days. It is a key indicator of your marketing and referral success.</p>
                    </div>

                    <div className="help-box">
                        <h4>Currency Liquidity (Sent vs Pending)</h4>
                        <p>Track exactly how much capital is flowing and locked in the system:
                             <br /><strong>SENT GHS/CAD:</strong> Total successful volume finalized today.
                             <br /><strong>PENDING GHS/CAD:</strong> Volume that is currently "Pending" or "Processing" in the dispatch pool.</p>
                    </div>

                    <div className="help-box">
                        <h4>Profitability Trend</h4>
                        <p>This area chart tracks your **Net Margin** over time. It subtracts the base market rate cost from your provided transaction rate to show your actual earnings in CAD.</p>
                    </div>

                    <div className="help-box">
                        <h4>Top Performers</h4>
                        <ul>
                            <li><strong>Vendors:</strong> Ranked by the total volume they have successfully processed. Helps you identify your most reliable payout partners.</li>
                            <li><strong>Customers:</strong> Ranked by their lifetime volume. Use this to identify and reward your "Whale" users.</li>
                        </ul>
                    </div>

                    <div className="help-box">
                        <h4>Payout Methods Distribution</h4>
                        <p>A visual breakdown of which platforms your users prefer (Momo, Bank, or Interac). Essential for ensuring your vendors are primed with the right liquidity types.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'broadcasts',
            title: 'Global Broadcasts',
            icon: 'campaign',
            content: (
                <div className="help-content">
                    <h3>Communication & Alerts</h3>
                    <p>The Broadcast module allows you to send persistent, high-visibility notices to specific segments of your users.</p>

                    <div className="help-box">
                        <h4>Targeting Segments</h4>
                        <ul>
                            <li><strong>All Users:</strong> Notice appears for everyone (Vendors, Users, Admins).</li>
                            <li><strong>Vendors Only:</strong> Essential for holiday announcements or liquidity warnings.</li>
                            <li><strong>Regular Users:</strong> Good for promotional offers or maintenance updates.</li>
                        </ul>
                    </div>

                    <div className="help-box">
                        <h4>Smart Persistence</h4>
                        <p>Broadcasts use a "Dismissal" system. Once a user reads and closes a notice, it will not reappear for them, even across different devices, while the notice remains active for others.</p>
                    </div>

                    <div className="help-box">
                        <h4>Expiry Dates</h4>
                        <p>You can set an optional expiry date for any broadcast. After this date, the system automatically stops displaying it, preventing stale information from cluttering the dashboard.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'transactions',
            title: 'Transaction Pool',
            icon: 'bar_chart',
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
                        <h4>Vendor Assignment</h4>
                        <p>Transactions in the pool can be manually assigned to a specific vendor by a Super Admin. Use this if a specific vendor has better liquidity for a certain type of payout.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'support-inquiries',
            title: 'Support Desk',
            icon: 'support_agent',
            content: (
                <div className="help-content">
                    <h3>Managing Customer Support</h3>
                    <p>The Support Inquiries desk allows you to review and manage direct contact submissions from the public site and user dashboard.</p>

                    <div className="help-box">
                        <h4>Ticket Statuses</h4>
                        <ul>
                            <li><strong>Pending:</strong> A new, untouched inquiry. It sits in your default view until action is taken.</li>
                            <li><strong>Replied:</strong> Use the "Mark Replied" button after you have sent an email response to the user. This flags to other admins that the issue is being handled, but keeps the conversation nominally open in case further follow-up is needed.</li>
                            <li><strong>Closed:</strong> Use the "Close" button when the issue is fully resolved or if the inquiry is spam. This archives the ticket because no further action is required.</li>
                        </ul>
                    </div>

                    <div className="help-box">
                        <h4>"Disappearing" Tickets</h4>
                        <p>By default, the inquiries table only displays <strong>Pending</strong> tickets to keep your workflow clean. When you click "Mark Replied" or "Close", the ticket updates its status and naturally filters out of the default view. To view them again, simply change the <strong>Status Filter</strong> at the top of the table to "All Statuses" or the specific status you are hunting for.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'reports',
            title: 'Reporting & Exports',
            icon: 'description',
            content: (
                <div className="help-content">
                    <h3>Exporting Platform Data</h3>
                    <p>You can export various datasets to Microsoft Excel (XLSX) for offline analysis or tax reporting.</p>

                    <div className="help-box">
                        <h4>Intelligence Report</h4>
                        <p>The <strong>"Export Detailed Intelligence"</strong> button in Analytics provides a row-by-row breakdown of profit per transaction, including market rates and vendor IDs.</p>
                    </div>

                    <div className="help-box">
                        <h4>Audit Log Export</h4>
                        <p>In the Audit Logs tab, click <strong>"Export XLSX"</strong>. This provides a complete history of all administrative actions, from system reboots to logo changes.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'kyc',
            title: 'KYC & Verification',
            icon: 'id_card',
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
            icon: 'corporate_fare',
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
            id: 'system-mgmt',
            title: 'System Management',
            icon: 'settings',
            content: (
                <div className="help-content">
                    <h3>Global Configuration & Safety</h3>
                    <p>The System Settings page controls the core identity and security of the Qwiktransfers platform.</p>

                    <div className="help-box">
                        <h4>Manual Backup</h4>
                        <p>Instantly trigger a full database dump to the server's secure storage. Keep these safe in case of server failure.</p>
                    </div>

                    <div className="help-box">
                        <h4>Maintenance Mode</h4>
                        <p>Toggles a fallback screen for users during critical updates or security patches. While active, users cannot initiate new transfers.</p>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="help-center-container fade-in">
            <div className="glass card" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '700px', padding: 0, overflow: 'hidden', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                {/* Sidebar */}
                <div style={{ background: 'var(--card-bg)', borderRight: '1px solid var(--border-color)', padding: '24px', opacity: 0.95 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--primary)' }}>
                        <span className="material-symbols-outlined">help_center</span>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Help Center</h2>
                    </div>
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
                                    color: activeSection === section.id ? '#fff' : 'var(--text-main)',
                                    borderRadius: '12px',
                                    border: 'none',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>{section.icon}</span>
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
                    color: var(--text-main);
                    font-weight: 900;
                }
                .help-content p {
                    color: var(--text-muted);
                    line-height: 1.6;
                    margin-bottom: 32px;
                    font-size: 1rem;
                }
                .help-box {
                    background: var(--input-bg);
                    backdrop-filter: blur(10px);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 24px;
                    opacity: 0.9;
                }
                .help-box h4 {
                    margin: 0 0 12px 0;
                    color: var(--primary);
                    font-size: 0.9rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .help-box p, .help-box li {
                    margin: 0;
                    font-size: 0.95rem;
                    color: var(--text-main);
                    line-height: 1.6;
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
