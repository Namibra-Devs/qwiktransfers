import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/api';
import ThemeSwitcher from './ThemeSwitcher';
import NotificationPanel from './NotificationPanel';

const DashboardHeader = ({ user, logout, config, type = 'user', extraActions }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (!isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        document.body.style.overflow = 'unset';
    };

    const navLinks = [
        { name: 'Dashboard', path: type === 'vendor' ? '/vendor' : '/dashboard', icon: '📊' },
        { name: 'Refer & Earn', path: '/referrals', icon: '🎁' },
        { name: 'Support', path: '/complaints', icon: '🎧' },
        { name: 'Profile', path: '/profile', icon: '👤' }
    ];

    return (
        <>
            <header className="dashboard-header premium-pill-header">
                <div className="dashboard-brand nav-segment nav-brand-pill">
                    <Link to="/" className="brand-link">
                        {config.system_logo ? (
                            <img
                                src={getImageUrl(config.system_logo)}
                                alt="Logo"
                                className="nav-logo"
                            />
                        ) : (
                            <>
                                <div className="nav-logo-placeholder">Q</div>
                                <span className="brand-name">{config.system_name}</span>
                            </>
                        )}
                        {type === 'vendor' && <span className="brand-badge vendor">VENDOR</span>}
                    </Link>
                </div>

                <div className="dashboard-actions">
                    {/* Desktop Segment: Links */}
                    <nav className="dashboard-nav-links nav-segment nav-links-pill desktop-only">
                        {navLinks.filter(link => link.name !== 'Profile').map(link => (
                            <Link key={link.path} to={link.path} className="nav-link">{link.name}</Link>
                        ))}
                        {user?.kyc_status && (
                             <Link to="/kyc" className="kyc-badge-link">
                             {user?.kyc_status === 'verified' ? (
                                 <span className="kyc-status verified">✓ Verified</span>
                             ) : (
                                 <span className="kyc-status unverified">Verify ID</span>
                             )}
                         </Link>
                        )}
                    </nav>

                    <div className="header-utilities">
                        {extraActions && <div className="extra-header-actions desktop-only">{extraActions}</div>}
                        
                        <div className="utility-pill nav-segment desktop-only">
                            <NotificationPanel />
                            <ThemeSwitcher />
                        </div>

                        <Link to="/profile" className="user-profile-pill nav-segment desktop-only">
                            <div className="profile-details">
                                <span className="user-name">{user?.full_name || user?.email?.split('@')[0]}</span>
                                <span className="user-acc">{user?.account_number || `ID: QT-${type.toUpperCase()}`}</span>
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

                        <button onClick={logout} className="nav-signout-pill desktop-only" title="Sign Out">
                            <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </button>

                        {/* Mobile Trigger */}
                        <button className={`nav-mobile-trigger dashboard-trigger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
                            {isMenuOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Premium Mobile Menu Overlay */}
            <div className={`premium-mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-header">
                    <div className="mobile-menu-logo">
                        {config.system_logo ? (
                            <img src={getImageUrl(config.system_logo)} alt="Logo" />
                        ) : (
                            <span className="signature-font">Q</span>
                        )}
                    </div>
                    <button className="mobile-close-btn" onClick={closeMenu}>✕</button>
                </div>

                <div className="mobile-menu-links">
                    {/* Role Status Action for Vendors */}
                    {extraActions && (
                        <div className="mobile-extra-actions">
                            {extraActions}
                        </div>
                    )}

                    {navLinks.map(link => (
                        <Link key={link.path} to={link.path} className="mobile-nav-item" onClick={closeMenu}>
                            <span className="mobile-nav-icon">{link.icon}</span>
                            <span className="mobile-nav-text">{link.name}</span>
                        </Link>
                    ))}

                    <div className="mobile-menu-divider"></div>

                    <div className="mobile-user-card" onClick={() => { closeMenu(); window.location.href='/profile'; }} style={{ cursor: 'pointer' }}>
                         <div className="user-avatar-large">
                            {user?.profile_picture ? (
                                <img src={getImageUrl(user.profile_picture)} alt="Avatar" />
                            ) : (
                                <span>{(user?.full_name || 'Q')[0].toUpperCase()}</span>
                            )}
                        </div>
                        <div className="user-card-info">
                            <div className="user-card-name">{user?.full_name}</div>
                            <div className="user-card-email">{user?.email}</div>
                        </div>
                    </div>

                    <Link to="#" className="mobile-nav-item" onClick={() => { closeMenu(); logout(); }}>
                        <span className="mobile-nav-icon">🚪</span>
                        <span className="mobile-nav-text">Sign Out</span>
                    </Link>
                </div>

                <div className="mobile-menu-footer">
                    <p>© {new Date().getFullYear()} {config.system_name} Dashboard</p>
                    <div className="mobile-utility-actions" style={{ display: 'flex', gap: '20px' }}>
                        <NotificationPanel />
                        <ThemeSwitcher />
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardHeader;
