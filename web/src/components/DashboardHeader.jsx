import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/api';
import ThemeSwitcher from './ThemeSwitcher';
import NotificationPanel from './NotificationPanel';

const formatUserName = (userObj) => {
    if (!userObj) return null;
    if (userObj.first_name || userObj.last_name) {
        const parts = [userObj.first_name, userObj.middle_name, userObj.last_name].filter(Boolean);
        if (parts.length > 0) return parts.join(' ');
    }
    return userObj.full_name || null;
};

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
        { name: 'Dashboard', path: type === 'vendor' ? '/vendor' : '/dashboard', icon: 'bar_chart' },
        { name: 'Refer & Earn', path: '/referrals', icon: 'redeem' },
        { name: 'Support', path: '/complaints', icon: 'support_agent' },
        { name: 'Profile', path: '/profile', icon: 'account_circle' }
    ].filter(link => {
        if (type === 'vendor' && link.name === 'Refer & Earn') return false;
        return true;
    });

    return (
        <>
            <header className="dashboard-header premium-pill-header">
                <div className="dashboard-brand nav-segment nav-brand-pill">
                    <Link to={type === 'vendor' ? '/vendor' : '/dashboard'} className="brand-link">
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
                                    <span className="kyc-status verified">
                                        <span className="material-symbols-outlined" style={{ fontSize: '1rem', marginRight: '4px' }}>check_circle</span>
                                        Verified
                                    </span>
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
                                <span className="user-name">{formatUserName(user) || user?.email?.split('@')[0] || 'User'}</span>
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
                                    {(formatUserName(user) || user?.email || 'Q')[0].toUpperCase()}
                                </div>
                            )}
                        </Link>

                        <button onClick={logout} className="nav-signout-pill desktop-only" title="Sign Out">
                            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>logout</span>
                        </button>

                        {/* Mobile Trigger */}
                        <button className={`nav-mobile-trigger dashboard-trigger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.8rem' }}>
                                {isMenuOpen ? 'close' : 'menu'}
                            </span>
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
                    <button className="mobile-close-btn" onClick={closeMenu}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
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
                            <span className="material-symbols-outlined mobile-nav-icon">{link.icon}</span>
                            <span className="mobile-nav-text">{link.name}</span>
                        </Link>
                    ))}

                    <div className="mobile-menu-divider"></div>

                    <div className="mobile-user-card" onClick={() => { closeMenu(); window.location.href = '/profile'; }} style={{ cursor: 'pointer' }}>
                        <div className="user-avatar-large">
                            {user?.profile_picture ? (
                                <img src={getImageUrl(user.profile_picture)} alt="Avatar" />
                            ) : (
                                <span>{(formatUserName(user) || 'Q')[0].toUpperCase()}</span>
                            )}
                        </div>
                        <div className="user-card-info">
                            <div className="user-card-name">{formatUserName(user) || 'User'}</div>
                            <div className="user-card-email">{user?.email}</div>
                        </div>
                    </div>

                    <div className="mobile-nav-item" onClick={() => { closeMenu(); logout(); }} style={{ cursor: 'pointer' }}>
                        <span className="material-symbols-outlined mobile-nav-icon">logout</span>
                        <span className="mobile-nav-text">Sign Out</span>
                    </div>
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
