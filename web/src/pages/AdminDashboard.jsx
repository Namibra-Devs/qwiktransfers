import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../services/api';
import { toast } from 'react-hot-toast';
import AdminSidebar from '../components/AdminSidebar';
import PaymentSettings from '../components/PaymentSettings';
import AdminProfile from '../components/AdminProfile';
import ThemeSwitcher from '../components/ThemeSwitcher';
import NotificationPanel from '../components/NotificationPanel';
import TransactionTable from '../components/admin/TransactionTable';
import KYCTable from '../components/admin/KYCTable';
import UserTable from '../components/admin/UserTable';
import VendorTable from '../components/admin/VendorTable';
import AdminTable from '../components/admin/AdminTable';
import AnalyticsContainer from '../components/admin/AnalyticsContainer';
import HelpCenter from '../components/admin/HelpCenter';
import SystemSettings from '../components/admin/SystemSettings';
import InquiryTable from '../components/admin/InquiryTable';
import ComplaintTable from '../components/admin/ComplaintTable';
import AnnouncementManager from '../components/admin/AnnouncementManager';
import GlobalNotice from '../components/GlobalNotice';

const AdminDashboard = () => {
    const { logout, user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [users, setUsers] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditTotalPages, setAuditTotalPages] = useState(1);
    const [auditPage, setAuditPage] = useState(1);
    const [auditSearch, setAuditSearch] = useState('');
    const [auditAction, setAuditAction] = useState('');
    const [inquiries, setInquiries] = useState([]);
    const [inquiryPage, setInquiryPage] = useState(1);
    const [inquiryTotalPages, setInquiryTotalPages] = useState(1);
    const [inquiryStatusFilter, setInquiryStatusFilter] = useState('pending');
    const [inquirySearch, setInquirySearch] = useState('');

    // Complaints State
    const [complaints, setComplaints] = useState([]);
    const [complaintPage, setComplaintPage] = useState(1);
    const [complaintTotalPages, setComplaintTotalPages] = useState(1);
    const [complaintStatusFilter, setComplaintStatusFilter] = useState('open');
    const [complaintSearch, setComplaintSearch] = useState('');
    // Announcements State
    const [announcements, setAnnouncements] = useState([]);
    const [announcementPage, setAnnouncementPage] = useState(1);
    const [announcementTotalPages, setAnnouncementTotalPages] = useState(1);
    const [announcementSearch, setAnnouncementSearch] = useState('');
    const [announcementCount, setAnnouncementCount] = useState(0);
    const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'info', target: 'all', expires_at: '' });

    const [tab, setTab] = useState('transactions'); // 'transactions', 'kyc', 'users', 'vendors', 'analytics', 'help', 'inquiries', 'complaints'
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [adminStats, setAdminStats] = useState({ pendingTransactions: 0, pendingKYC: 0, successVolume: 0 });

    // Transactions Pagination & Filter
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [vendorSearch, setVendorSearch] = useState('');
    const [vendorPage, setVendorPage] = useState(1);
    const [vendorTotalPages, setVendorTotalPages] = useState(1);
    const [vendorCount, setVendorCount] = useState(0);

    // User/KYC Pagination & Search
    const [userPage, setUserPage] = useState(1);
    const [userTotalPages, setUserTotalPages] = useState(1);
    const [userSearch, setUserSearch] = useState('');

    // Admin Pagination & Search
    const [adminPage, setAdminPage] = useState(1);
    const [adminTotalPages, setAdminTotalPages] = useState(1);
    const [adminSearch, setAdminSearch] = useState('');
    const [adminCount, setAdminCount] = useState(0);


    // Selected items for Modals
    const [selectedTx, setSelectedTx] = useState(null);
    const [showTxModal, setShowTxModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showAddVendorModal, setShowAddVendorModal] = useState(false);
    const [newVendor, setNewVendor] = useState({ email: '', firstName: '', middleName: '', lastName: '', phone: '', password: '', country: 'All' });
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ email: '', firstName: '', middleName: '', lastName: '', phone: '', password: '', sub_role: 'support' });

    // Admin Confirmation Modal States
    const [updatingTxId, setUpdatingTxId] = useState(null);
    const [showAdminConfirmModal, setShowAdminConfirmModal] = useState(false);
    const [adminConfirmData, setAdminConfirmData] = useState({ transactionId: null, pin: '', proofImage: null });
    const [adminConfirmLoading, setAdminConfirmLoading] = useState(false);

    // Assign Vendor Modal States
    const [showAssignVendorModal, setShowAssignVendorModal] = useState(false);
    const [assignVendorData, setAssignVendorData] = useState({ transactionId: null, vendorId: null, pin: '' });
    const [assignVendorLoading, setAssignVendorLoading] = useState(false);

    // Preview Modal States
    const [previewImage, setPreviewImage] = useState('');
    const [previewDate, setPreviewDate] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        if (showPreviewModal) setImageLoading(true);
    }, [previewImage, showPreviewModal]);

    // Individual User/Vendor Transaction History & Stats
    const [userTransactions, setUserTransactions] = useState([]);
    const [userTransactionsLoading, setUserTransactionsLoading] = useState(false);
    
    // Universal Secure Action PIN states
    const [showSecureActionModal, setShowSecureActionModal] = useState(false);
    const [secureAction, setSecureAction] = useState(null); // 'TOGGLE_STATUS', 'UPDATE_ADMIN_ROLE', 'REVOKE_ADMIN'
    const [secureActionData, setSecureActionData] = useState(null);
    const [secureActionPin, setSecureActionPin] = useState('');
    const [secureActionLoading, setSecureActionLoading] = useState(false);

    const [vendorStats, setVendorStats] = useState({ totalCount: 0, totalVolumeCAD: 0, totalVolumeGHS: 0, successRate: 0 });

    useEffect(() => {
        const handleSwitchTab = (e) => {
            if (e.detail) setTab(e.detail);
        };
        window.addEventListener('switch-tab', handleSwitchTab);
        return () => window.removeEventListener('switch-tab', handleSwitchTab);
    }, []);

    useEffect(() => {
        fetchStats();
        if (tab === 'transactions') {
            fetchTransactions();
            fetchVendors(); // Fetch vendors for assignment dropdown
        } else if (tab === 'kyc') {
            fetchUsersServerSide('pending');
        } else if (tab === 'users') {
            fetchUsersServerSide(statusFilter === 'all' ? '' : statusFilter);
        } else if (tab === 'vendors') {
            fetchVendors();
        } else if (tab === 'admins') {
            fetchAdmins();
        } else if (tab === 'audit') {
            fetchAuditLogs();
        } else if (tab === 'inquiries') {
            fetchInquiries();
        } else if (tab === 'complaints') {
            fetchComplaints();
        } else if (tab === 'announcements') {
            fetchAnnouncements();
        }
    }, [page, search, statusFilter, userPage, userSearch, vendorPage, vendorSearch, adminPage, adminSearch, auditPage, auditSearch, auditAction, inquiryPage, inquiryStatusFilter, inquirySearch, complaintPage, complaintStatusFilter, complaintSearch, announcementPage, announcementSearch, tab]);

    useEffect(() => {
        if (selectedUser && showUserModal) {
            fetchUserTransactions(selectedUser.id, selectedUser.role);
        } else {
            setUserTransactions([]);
            setVendorStats({ totalCount: 0, totalVolumeCAD: 0, totalVolumeGHS: 0, successRate: 0 });
        }
    }, [selectedUser, showUserModal]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/transactions/stats');
            setAdminStats(res.data);
        } catch (error) {
            console.error('Stats error:', error);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await api.get(`/transactions?page=${page}&limit=10&search=${search}&status=${statusFilter}`);
            setTransactions(res.data.transactions);
            setTotalPages(res.data.pages);
            setTotalTransactions(res.data.total);
        } catch (error) {
            console.error(error);
        } finally {
        }
    };

    const fetchUsersServerSide = async (kycStatus = '') => {
        try {
            // Strictly fetch 'user' role for the Users tab
            const roleParam = tab === 'users' ? 'user' : '';
            const res = await api.get(`/auth/users?page=${userPage}&limit=10&search=${userSearch}&kycStatus=${kycStatus}&role=${roleParam}`);
            setUsers(res.data.users);
            setUserTotalPages(res.data.pages);
        } catch (error) {
            console.error(error);
        } finally {
        }
    };

    const updateStatus = async (id, status) => {
        setUpdatingTxId(id);
        try {
            await api.patch(`/transactions/${id}/status`, { status });
            fetchTransactions();
            toast.success('Status updated!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update status');
        } finally {
            setUpdatingTxId(null);
        }
    };

    const openAssignVendorModal = (transactionId, vendorId) => {
        setAssignVendorData({ transactionId, vendorId, pin: '' });
        setShowAssignVendorModal(true);
    };

    const handleAssignVendorSubmit = async (e) => {
        e.preventDefault();
        if (assignVendorData.pin.length !== 4) return toast.error('4-digit PIN is required');
        setAssignVendorLoading(true);
        try {
            await api.patch(`/transactions/${assignVendorData.transactionId}/assign`, {
                vendorId: assignVendorData.vendorId,
                pin: assignVendorData.pin
            });
            toast.success('Vendor assigned successfully');
            setShowAssignVendorModal(false);
            setAssignVendorData({ transactionId: null, vendorId: null, pin: '' });
            fetchTransactions();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to assign vendor');
        } finally {
            setAssignVendorLoading(false);
        }
    };

    const handleAdminForceConfirm = async (e) => {
        e.preventDefault();
        if (!adminConfirmData.proofImage) return toast.error('Proof image is required');
        if (adminConfirmData.pin.length !== 4) return toast.error('4-digit PIN is required');

        setAdminConfirmLoading(true);
        const formData = new FormData();
        formData.append('proof', adminConfirmData.proofImage);

        try {
            // First upload the proof
            const uploadRes = await api.post(`/transactions/${adminConfirmData.transactionId}/upload-proof`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Then confirm with PIN and proof_url
            await api.patch(`/transactions/${adminConfirmData.transactionId}/status`, {
                status: 'sent',
                pin: adminConfirmData.pin,
                proof_url: uploadRes.data.proof_url
            });

            toast.success('Transaction successfully confirmed (Admin Override)');
            setShowAdminConfirmModal(false);
            setAdminConfirmData({ transactionId: null, pin: '', proofImage: null });
            fetchTransactions();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to force confirm transaction');
        } finally {
            setAdminConfirmLoading(false);
        }
    };

    const updateKYC = async (userId, status) => {
        try {
            await api.patch('/auth/kyc/status', { userId, status });
            fetchUsersServerSide();
            toast.success('KYC status updated!');
        } catch (error) {
            toast.error('Failed to update KYC');
        }
    };

    const fetchAdmins = async () => {
        try {
            const res = await api.get('/auth/users', { 
                params: { 
                    role: 'admin',
                    page: adminPage,
                    limit: 10,
                    search: adminSearch
                } 
            });
            setAdmins(res.data.users || []);
            setAdminTotalPages(res.data.pages || 1);
            setAdminCount(res.data.total || (res.data.users ? res.data.users.length : 0));
        } catch (error) {
            console.error('Fetch admins error:', error);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/announcements/admin', {
                params: {
                    page: announcementPage,
                    limit: 10,
                    search: announcementSearch
                }
            });
            setAnnouncements(res.data.announcements || []);
            setAnnouncementTotalPages(res.data.pages || 1);
            setAnnouncementCount(res.data.total || 0);
        } catch (error) {
            console.error('Fetch announcements error:', error);
        }
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await api.post('/announcements/admin', newAnnouncement);
            toast.success('Broadcast sent successfully!');
            fetchAnnouncements();
            setShowAddAnnouncementModal(false);
            setNewAnnouncement({ title: '', message: '', type: 'info', target: 'all', expires_at: '' });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to send broadcast');
        }
    };

    const fetchVendors = async () => {
        try {
            const res = await api.get('/auth/users', { 
                params: { 
                    role: 'vendor',
                    search: vendorSearch,
                    page: vendorPage,
                    limit: 10
                } 
            });
            setVendors(res.data.users || []);
            setVendorTotalPages(res.data.pages || 1);
            setVendorCount(res.data.total || 0);
        } catch (error) {
            console.error('Fetch vendors error:', error);
        }
    };

    const fetchAuditLogs = async () => {
        try {
            const res = await api.get(`/system/admin/audit-logs?page=${auditPage}&limit=20&search=${auditSearch}&action=${auditAction}`);
            setAuditLogs(res.data.logs);
            setAuditTotalPages(res.data.pages);
        } catch (error) {
            console.error('Audit error:', error);
        } finally {
        }
    };

    const fetchInquiries = async () => {
        try {
            const res = await api.get(`/support/inquiries?page=${inquiryPage}&limit=10&status=${inquiryStatusFilter === 'all' ? '' : inquiryStatusFilter}&search=${inquirySearch}`);
            setInquiries(res.data.inquiries);
            setInquiryTotalPages(res.data.pages);
        } catch (error) {
            console.error('Fetch inquiries error:', error);
        }
    };

    const fetchComplaints = async () => {
        try {
            const res = await api.get(`/complaints/admin?page=${complaintPage}&limit=10&status=${complaintStatusFilter === 'all' ? '' : complaintStatusFilter}&search=${complaintSearch}`);
            setComplaints(res.data.complaints);
            setComplaintTotalPages(res.data.pages || 1);
        } catch (error) {
            console.error('Fetch complaints error:', error);
        }
    };

    const updateComplaintStatus = async (id, data) => {
        try {
            await api.patch(`/complaints/admin/${id}`, data);
            toast.success('Complaint updated successfully!');
            fetchComplaints();
        } catch (error) {
            toast.error('Failed to update complaint');
        }
    };

    const fetchAvailableUsers = async () => {
        // Obsolete as we separate flows
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/create-admin', {
                email: newAdmin.email,
                first_name: newAdmin.firstName,
                middle_name: newAdmin.middleName,
                last_name: newAdmin.lastName,
                phone: newAdmin.phone,
                password: newAdmin.password,
                sub_role: newAdmin.sub_role
            });
            toast.success('Administrative Staff created successfully');
            fetchAdmins();
            setShowAddAdminModal(false);
            setNewAdmin({ email: '', firstName: '', middleName: '', lastName: '', phone: '', password: '', sub_role: 'support' });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create admin');
        }
    };

    const handleCreateVendor = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/create-vendor', {
                email: newVendor.email,
                first_name: newVendor.firstName,
                middle_name: newVendor.middleName,
                last_name: newVendor.lastName,
                phone: newVendor.phone,
                password: newVendor.password,
                country: newVendor.country
            });
            toast.success('Vendor created successfully');
            fetchVendors();
            setShowAddVendorModal(false);
            setNewVendor({ email: '', firstName: '', middleName: '', lastName: '', phone: '', password: '', country: 'All' });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create vendor');
        }
    };

    const toggleStatus = async (userId) => {
        const userToToggle = users.find(u => u.id === userId) || selectedUser;
        
        // Enabling accounts is considered low-risk and doesn't require a PIN
        if (userToToggle && !userToToggle.is_active) {
            try {
                const res = await api.patch('/auth/toggle-status', { userId });
                toast.success(res.data.message);
                refreshCurrentTab();
                if (selectedUser && selectedUser.id === userId) {
                    setSelectedUser({ ...selectedUser, is_active: res.data.is_active });
                }
                return;
            } catch (error) {
                return toast.error('Failed to enable account');
            }
        }

        // Disabling requires PIN
        setSecureActionPin('');
        setSecureAction('TOGGLE_STATUS');
        setSecureActionData({ userId });
        setShowSecureActionModal(true);
    };

    const handleSecureActionSubmit = async (e) => {
        e.preventDefault();
        if (secureActionPin.length !== 4) return toast.error('4-digit PIN required');
        
        setSecureActionLoading(true);
        try {
            if (secureAction === 'TOGGLE_STATUS') {
                const res = await api.patch('/auth/toggle-status', { 
                    userId: secureActionData.userId, 
                    pin: secureActionPin 
                });
                toast.success(res.data.message);
                if (selectedUser && selectedUser.id === secureActionData.userId) {
                    setSelectedUser({ ...selectedUser, is_active: res.data.is_active });
                }
            } else if (secureAction === 'UPDATE_ADMIN_ROLE') {
                const { userId, subRole } = secureActionData;
                await api.patch('/auth/update-role', { userId, sub_role: subRole, pin: secureActionPin });
                toast.success(`Admin permissions updated to ${subRole.toUpperCase()}`);
                if (selectedUser && selectedUser.id === userId) {
                    setSelectedUser({ ...selectedUser, sub_role: subRole });
                }
            } else if (secureAction === 'REVOKE_ADMIN') {
                const { userId } = secureActionData;
                await api.patch('/auth/update-role', { userId, role: 'user', pin: secureActionPin });
                toast.success('Admin privileges revoked');
                setShowUserModal(false);
            } else if (secureAction === 'EXPORT_LOGS') {
                toast.loading('Exporting logs...', { id: 'audit-export' });
                const response = await api.post('/system/admin/audit-logs/export', 
                    { pin: secureActionPin }, 
                    { responseType: 'blob' }
                );
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.xlsx`);
                link.click();
                toast.success('Audit logs exported!', { id: 'audit-export' });
            } else if (secureAction === 'UPDATE_PAYMENT_METHOD') {
                await api.post('/system/payment-methods', { ...secureActionData, pin: secureActionPin });
                toast.success('Payment Method Updated');
            } else if (secureAction === 'UPDATE_SYSTEM_CONFIG') {
                if (secureActionData.multiConfig) {
                    await Promise.all(secureActionData.multiConfig.map(config => 
                        api.post('/system/config', { ...config, pin: secureActionPin })
                    ));
                } else {
                    await api.post('/system/config', { ...secureActionData, pin: secureActionPin });
                }
                toast.success('System Configuration Updated');
            } else if (secureAction === 'UPDATE_RATE_SETTINGS') {
                await api.patch('/rates/settings', { ...secureActionData, pin: secureActionPin });
                toast.success('Rate Settings Updated');
                if (secureActionData.compositeConfig) {
                    await api.post('/system/config', { ...secureActionData.compositeConfig, pin: secureActionPin });
                }
            }
            
            refreshCurrentTab();
            setShowSecureActionModal(false);
        } catch (error) {
            let errorMsg = 'Authorization failed';
            
            // Handle blob error responses (common in file exports)
            if (error.response?.data instanceof Blob && error.response.data.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const jsonData = JSON.parse(reader.result);
                        errorMsg = jsonData.error || errorMsg;
                        toast.error(errorMsg, { id: 'audit-export' });
                    } catch (e) {
                        toast.error(errorMsg, { id: 'audit-export' });
                    }
                };
                reader.readAsText(error.response.data);
                return; // Error toast will be handled in onload
            }

            errorMsg = error.response?.data?.error || errorMsg;
            
            if (secureAction === 'EXPORT_LOGS') {
                toast.error(errorMsg, { id: 'audit-export' });
            } else {
                toast.error(errorMsg);
            }
        } finally {
            setSecureActionLoading(false);
        }
    };

    const refreshCurrentTab = () => {
        if (tab === 'users') fetchUsersServerSide();
        if (tab === 'vendors') fetchVendors();
        if (tab === 'admins') fetchAdmins();
        if (tab === 'payment-settings') {
            window.dispatchEvent(new CustomEvent('payment-settings-updated'));
        }
    };

    const triggerSecureAction = (action, data) => {
        setSecureActionPin('');
        setSecureAction(action);
        setSecureActionData(data);
        setShowSecureActionModal(true);
    };



    const updateAdminRole = async (userId, subRole) => {
        setSecureActionPin('');
        setSecureAction('UPDATE_ADMIN_ROLE');
        setSecureActionData({ userId, subRole });
        setShowSecureActionModal(true);
    };

    const updateRegion = async (userId, country) => {
        try {
            await api.patch('/auth/update-region', { userId, country });
            toast.success(`Vendor region updated to ${country}`);
            if (tab === 'vendors') fetchVendors();
            if (selectedUser && selectedUser.id === userId) {
                setSelectedUser({ ...selectedUser, country });
            }
        } catch (error) {
            toast.error('Failed to update region');
        }
    };

    const fetchUserTransactions = async (userId, role) => {
        setUserTransactionsLoading(true);
        try {
            const params = role === 'vendor' ? { vendorId: userId, limit: 100 } : { userId: userId, limit: 100 };
            const res = await api.get('/transactions', { params });
            const txs = res.data.transactions;
            setUserTransactions(txs);
            if (role === 'vendor') {
                calculateVendorStats(txs);
            }
        } catch (error) {
            console.error('Fetch user transactions error:', error);
        } finally {
            setUserTransactionsLoading(false);
        }
    };

    const calculateVendorStats = (txs) => {
        const totalCount = txs.length;
        if (totalCount === 0) {
            setVendorStats({ totalCount: 0, totalVolumeCAD: 0, totalVolumeGHS: 0, successRate: 0 });
            return;
        }

        const successful = txs.filter(t => t.status === 'sent');
        const totalVolumeCAD = successful.reduce((sum, t) => t.type.startsWith('CAD') ? sum + parseFloat(t.amount_sent) : sum, 0);
        const totalVolumeGHS = successful.reduce((sum, t) => t.type.startsWith('GHS') ? sum + parseFloat(t.amount_sent) : sum, 0);
        const successRate = ((successful.length / totalCount) * 100).toFixed(1);

        setVendorStats({ totalCount, totalVolumeCAD, totalVolumeGHS, successRate });
    };

    const getPaginationRange = (currentPage, totalPages) => {
        const delta = 1;
        const range = [];
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }
        if (currentPage - delta > 2) range.unshift('...');
        if (currentPage + delta < totalPages - 1) range.push('...');
        range.unshift(1);
        if (totalPages > 1) range.push(totalPages);
        return range;
    };

    const renderPaginationButtons = (currentPage, totalPages, setPageFn) => {
        if (totalPages <= 1) return null;
        const range = getPaginationRange(currentPage, totalPages);
        
        return (
            <>
                <button
                    onClick={() => setPageFn(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--input-bg)',
                        color: 'var(--text-deep-brown)',
                        fontWeight: 700,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === 1 ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        justifyContent: 'center'
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>chevron_left</span>
                    <span style={{ fontSize: '0.85rem' }}>Previous</span>
                </button>

                {range.map((pageNumber, index) => (
                    <button
                        key={`${pageNumber}-${index}`}
                        onClick={() => pageNumber !== '...' && setPageFn(pageNumber)}
                        disabled={pageNumber === '...'}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: pageNumber === '...' ? 'none' : '1px solid var(--border-color)',
                            background: currentPage === pageNumber ? 'var(--primary)' : (pageNumber === '...' ? 'transparent' : 'var(--input-bg)'),
                            color: currentPage === pageNumber ? '#fff' : 'var(--text-deep-brown)',
                            fontWeight: 700,
                            cursor: pageNumber === '...' ? 'default' : 'pointer'
                        }}
                    >
                        {pageNumber}
                    </button>
                ))}

                <button
                    onClick={() => setPageFn(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--input-bg)',
                        color: 'var(--text-deep-brown)',
                        fontWeight: 700,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        opacity: currentPage === totalPages ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        justifyContent: 'center'
                    }}
                >
                    <span style={{ fontSize: '0.85rem' }}>Next</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>chevron_right</span>
                </button>
            </>
        );
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-peach)', transition: 'background-color 0.3s ease' }}>
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay mobile-only"
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 999,
                        animation: 'fadeIn 0.3s ease'
                    }}
                />
            )}

            {/* Premium Mobile Header (Floating Pill) */}
            <div className="mobile-header-fixed mobile-only">
                <div className="mobile-header-pill">
                    <button className="mobile-nav-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>
                            {sidebarOpen ? 'close' : 'menu'}
                        </span>
                    </button>

                    <Link to="/admin" style={{ textDecoration: 'none' }}>
                        <h1 className="mobile-brand-title">QWIK Admin</h1>
                    </Link>

                    <div className="mobile-header-actions">
                        <NotificationPanel />
                        <ThemeSwitcher />
                    </div>
                </div>
            </div>

            <AdminSidebar
                activeTab={tab}
                setActiveTab={(t) => { setTab(t); setSidebarOpen(false); }}
                logout={logout}
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />

            <div className="admin-main-container">
                <header className="admin-header desktop-only">
                    <div className="admin-header-content">
                        <div className="admin-top-nav-actions">
                            <div className="admin-utility-icons">
                                <NotificationPanel />
                                <ThemeSwitcher />
                            </div>
                            <div className="admin-profile-chip" onClick={() => setTab('profile')}>
                                {user?.profile_picture ? (
                                    <img
                                        src={getImageUrl(user.profile_picture)}
                                        alt="Admin Avatar"
                                        className="admin-profile-avatar"
                                    />
                                ) : (
                                    <div className="admin-profile-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-peach)', color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem' }}>
                                        {(user?.first_name || user?.email || 'A')[0].toUpperCase()}
                                    </div>
                                )}
                                <div className="admin-profile-info">
                                    <span className="admin-profile-name">{user?.full_name || 'Administrator'}</span>
                                    <span className="admin-profile-role">Master Admin</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="admin-main" style={{
                    padding: '40px',
                    // maxWidth: '1200px', 
                    margin: '0 auto'
                }}>
                    {tab === 'transactions' && (
                        <section className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                            <div className="card" style={{ padding: '24px', background: 'var(--text-deep-brown)', color: '#fff' }}>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Pending Transactions</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{adminStats.pendingTransactions}</div>
                            </div>
                            <div className="card" style={{ padding: '24px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Processing Transactions</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{adminStats.processingTransactions || 0}</div>
                            </div>
                            <div className="card" style={{ padding: '24px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Completed Transactions</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>{adminStats.sentTransactions || 0}</div>
                            </div>
                        </section>
                    )}

                    <div className="fade-in">
                        <GlobalNotice />
                        {['transactions', 'kyc', 'users', 'vendors', 'admins', 'announcements', 'audit', 'inquiries', 'complaints'].includes(tab) && (
                            <>
                                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                    {tab !== 'announcements' && (
                                        <div style={{ padding: '32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <h2 style={{ fontSize: '1.1rem', margin: 0 }}>
                                                    {tab === 'transactions' ? 'Global Transaction Pool' : tab === 'kyc' ? 'Identity Verification Requests' : tab === 'vendors' ? 'Platform Vendors' : tab === 'admins' ? 'Administrative Staff' : tab === 'audit' ? 'System Audit Logs' : tab === 'inquiries' ? 'Support & Inquiries' : tab === 'complaints' ? 'User Complaints' : 'User Management'}
                                                </h2>
                                                <button
                                                    onClick={() => setTab('help')}
                                                    style={{ background: 'var(--bg-peach)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)', fontWeight: 800 }}
                                                    title="How does this page work?"
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>help_outline</span>
                                                </button>
                                            </div>
                                            {tab !== 'transactions' && (
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    {tab === 'audit' && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setSecureActionPin('');
                                                                setSecureAction('EXPORT_LOGS');
                                                                setSecureActionData({});
                                                                setShowSecureActionModal(true);
                                                            }}
                                                            className="btn-primary"
                                                            style={{
                                                                padding: '10px 20px',
                                                                borderRadius: '50px',
                                                                fontSize: '0.8rem',
                                                                width: 'auto'
                                                            }}
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', marginRight: '6px' }}>file_export</span>
                                                            Export Logs
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm('Are you sure you want to delete audit logs older than 90 days?')) {
                                                                    const tid = toast.loading('Cleaning platform logs...');
                                                                    try {
                                                                        const res = await api.delete('/system/admin/audit-logs/cleanup');
                                                                        toast.success(res.data.message, { id: tid });
                                                                        fetchAuditLogs();
                                                                    } catch (err) { toast.error('Cleanup failed', { id: tid }); }
                                                                }
                                                            }}
                                                            style={{
                                                                padding: '10px 20px',
                                                                background: 'rgba(216, 59, 1, 0.1)',
                                                                color: '#d83b01',
                                                                border: '1.5px solid #d83b01',
                                                                borderRadius: '50px',
                                                                fontWeight: 700,
                                                                fontSize: '0.8rem',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(216, 59, 1, 0.15)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(216, 59, 1, 0.1)'}
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', marginRight: '6px' }}>cleaning_services</span>
                                                            Clean (90d)
                                                        </button>
                                                    </>
                                                )}
                                                {!['audit', 'transactions', 'inquiries', 'complaints', 'users', 'kyc', 'vendors', 'admins', 'announcements'].includes(tab) && (
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Search Users..."
                                                            value={userSearch}
                                                            onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                                                            style={{ padding: '6px 10px 6px 28px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                                        />
                                                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, fontSize: '1.1rem' }}>search</span>
                                                    </div>
                                                )}
                                                {tab === 'vendors' && (
                                                    <button
                                                        onClick={() => { fetchAvailableUsers(); setShowAddVendorModal(true); }}
                                                        style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>person_add</span> Add Vendor
                                                    </button>
                                                )}
                                                {tab === 'admins' && (
                                                    <button
                                                        onClick={() => setShowAddAdminModal(true)}
                                                        style={{ padding: '8px 16px', borderRadius: '8px', background: '#4A154B', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(74, 21, 75, 0.2)' }}
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>admin_panel_settings</span> Add Staff
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                    {tab === 'transactions' && (
                                        <div className="fade-in">
                                            <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', background: 'transparent', borderBottom: '1px solid var(--border-color)' }}>
                                                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                                                    <div style={{ position: 'relative', flex: 0.7 }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Search transactions..."
                                                            value={search}
                                                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                                            style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', background: 'var(--input-bg)', color: 'var(--text-deep-brown)', outline: 'none', transition: 'all 0.2s ease' }}
                                                        />
                                                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '1.2rem', pointerEvents: 'none' }}>search</span>
                                                    </div>
                                                    <select
                                                        value={statusFilter}
                                                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                                        style={{ flex: 0.3, padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 700, background: 'var(--input-bg)', color: 'var(--text-deep-brown)', cursor: 'pointer', outline: 'none' }}
                                                    >
                                                        <option value="all">All Statuses</option>
                                                        <option value="pending">Pending</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="sent">Sent</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(183, 71, 42, 0.05)', padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(183, 71, 42, 0.1)', whiteSpace: 'nowrap' }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>monitoring</span>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800 }}>{totalTransactions} Results</span>
                                                </div>
                                            </div>
                                            <TransactionTable
                                                subRole={user?.sub_role}
                                                transactions={transactions}
                                                updateStatus={updateStatus}
                                                updatingTxId={updatingTxId}
                                                vendors={vendors}
                                                openAssignVendorModal={openAssignVendorModal}
                                                setAdminConfirmData={setAdminConfirmData}
                                                setShowAdminConfirmModal={setShowAdminConfirmModal}
                                                setSelectedTx={setSelectedTx}
                                                setShowTxModal={setShowTxModal}
                                                setPreviewImage={setPreviewImage}
                                                setPreviewDate={setPreviewDate}
                                                setShowPreviewModal={setShowPreviewModal}
                                            />
                                        </div>
                                    )}

                                    {tab === 'kyc' && (
                                        <div className="fade-in">
                                            <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', background: 'transparent', borderBottom: '1px solid var(--border-color)' }}>
                                                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                                                    <div style={{ position: 'relative', flex: 0.7 }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Search pending KYC by name or email..."
                                                            value={userSearch}
                                                            onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                                                            style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', background: 'var(--input-bg)', color: 'var(--text-deep-brown)', outline: 'none' }}
                                                        />
                                                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '1.2rem', pointerEvents: 'none' }}>search</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <KYCTable
                                                users={users}
                                                updateKYC={updateKYC}
                                                setPreviewImage={setPreviewImage}
                                                setPreviewDate={setPreviewDate}
                                                setShowPreviewModal={setShowPreviewModal}
                                            />
                                        </div>
                                    )}

                                    {tab === 'users' && (
                                        <div className="fade-in">
                                            <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', background: 'transparent', borderBottom: '1px solid var(--border-color)' }}>
                                                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                                                    <div style={{ position: 'relative', flex: 0.7 }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Search users by name, email, or phone..."
                                                            value={userSearch}
                                                            onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                                                            style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', background: 'var(--input-bg)', color: 'var(--text-deep-brown)', outline: 'none' }}
                                                        />
                                                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '1.2rem', pointerEvents: 'none' }}>search</span>
                                                    </div>
                                                    <select
                                                        value={statusFilter} // Reusing statusFilter state for KYC status on this tab
                                                        onChange={(e) => { setStatusFilter(e.target.value); setUserPage(1); }}
                                                        style={{ flex: 0.3, padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 700, background: 'var(--input-bg)', color: 'var(--text-deep-brown)', cursor: 'pointer', outline: 'none' }}
                                                    >
                                                        <option value="">All Verification Tiers</option>
                                                        <option value="unverified">Unverified</option>
                                                        <option value="pending">Pending Review</option>
                                                        <option value="verified">KYC Verified</option>
                                                        <option value="rejected">Rejected</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <UserTable
                                                users={users}
                                                setSelectedUser={setSelectedUser}
                                                setShowUserModal={setShowUserModal}
                                            />
                                        </div>
                                    )}

                                    {tab === 'vendors' && (
                                        <div className="fade-in">
                                            <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', background: 'transparent', borderBottom: '1px solid var(--border-color)' }}>
                                                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                                                    <div style={{ position: 'relative', flex: 0.7 }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Search platform vendors..."
                                                            value={vendorSearch}
                                                            onChange={(e) => { setVendorSearch(e.target.value); setVendorPage(1); }}
                                                            style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', background: 'var(--input-bg)', color: 'var(--text-deep-brown)', outline: 'none' }}
                                                        />
                                                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '1.2rem', pointerEvents: 'none' }}>search</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(183, 71, 42, 0.05)', padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(183, 71, 42, 0.1)', whiteSpace: 'nowrap' }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>storefront</span>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800 }}>{vendorCount} Vendors</span>
                                                </div>
                                            </div>
                                            <VendorTable
                                                vendors={vendors}
                                                toggleStatus={toggleStatus}
                                                setSelectedUser={setSelectedUser}
                                                setShowUserModal={setShowUserModal}
                                                updateRegion={updateRegion}
                                            />
                                        </div>
                                    )}

                                    {tab === 'admins' && (
                                        <div className="fade-in">
                                            <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', background: 'transparent', borderBottom: '1px solid var(--border-color)' }}>
                                                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                                                    <div style={{ position: 'relative', flex: 0.7 }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Search staff members..."
                                                            value={adminSearch}
                                                            onChange={(e) => { setAdminSearch(e.target.value); setAdminPage(1); }}
                                                            style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', background: 'var(--input-bg)', color: 'var(--text-deep-brown)', outline: 'none', transition: 'all 0.2s ease' }}
                                                        />
                                                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '1.2rem', pointerEvents: 'none' }}>search</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(74, 21, 75, 0.05)', padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(74, 21, 75, 0.1)', whiteSpace: 'nowrap' }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: '#4A154B' }}>badge</span>
                                                    <span style={{ fontSize: '0.85rem', color: '#4A154B', fontWeight: 800 }}>{adminCount} Internal Staff</span>
                                                </div>
                                            </div>
                                            <AdminTable
                                                admins={admins}
                                                toggleStatus={toggleStatus}
                                                setSelectedUser={setSelectedUser}
                                                setShowAdminModal={setShowUserModal}
                                            />
                                        </div>
                                    )}

                                    {tab === 'inquiries' && (
                                        <div className="fade-in">
                                            <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', background: 'transparent', borderBottom: '1px solid var(--border-color)' }}>
                                                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                                                    <div style={{ position: 'relative', flex: 0.7 }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Search by sender or subject..."
                                                            value={inquirySearch}
                                                            onChange={(e) => { setInquirySearch(e.target.value); setInquiryPage(1); }}
                                                            style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', background: 'var(--input-bg)', color: 'var(--text-deep-brown)', outline: 'none', transition: 'all 0.2s ease' }}
                                                        />
                                                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '1.2rem', pointerEvents: 'none' }}>search</span>
                                                    </div>
                                                    <select
                                                        value={inquiryStatusFilter}
                                                        onChange={(e) => { setInquiryStatusFilter(e.target.value); setInquiryPage(1); }}
                                                        style={{ flex: 0.3, padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 700, background: 'var(--input-bg)', color: 'var(--text-deep-brown)', cursor: 'pointer', outline: 'none' }}
                                                    >
                                                        <option value="all">All Statuses</option>
                                                        <option value="pending">Pending</option>
                                                        <option value="replied">Replied</option>
                                                        <option value="closed">Closed</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <InquiryTable
                                                inquiries={inquiries}
                                                fetchInquiries={fetchInquiries}
                                            />
                                        </div>
                                    )}

                                    {tab === 'complaints' && (
                                        <div className="fade-in">
                                            <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', background: 'transparent', borderBottom: '1px solid var(--border-color)' }}>
                                                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                                                    <div style={{ position: 'relative', flex: 0.7 }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Search complaints by subject or user..."
                                                            value={complaintSearch}
                                                            onChange={(e) => { setComplaintSearch(e.target.value); setComplaintPage(1); }}
                                                            style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', background: 'var(--input-bg)', color: 'var(--text-deep-brown)', outline: 'none', transition: 'all 0.2s ease' }}
                                                        />
                                                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '1.2rem', pointerEvents: 'none' }}>search</span>
                                                    </div>
                                                    <select
                                                        value={complaintStatusFilter}
                                                        onChange={(e) => { setComplaintStatusFilter(e.target.value); setComplaintPage(1); }}
                                                        style={{ flex: 0.3, padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 700, background: 'var(--input-bg)', color: 'var(--text-deep-brown)', cursor: 'pointer', outline: 'none' }}
                                                    >
                                                        <option value="all">All Statuses</option>
                                                        <option value="open">Open</option>
                                                        <option value="resolved">Resolved</option>
                                                        <option value="closed">Closed</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <ComplaintTable
                                                complaints={complaints}
                                                updateComplaintStatus={updateComplaintStatus}
                                                setPreviewImage={setPreviewImage}
                                                setPreviewDate={setPreviewDate}
                                                setShowPreviewModal={setShowPreviewModal}
                                            />
                                        </div>
                                    )}

                                    {tab === 'announcements' && (
                                        <div className="fade-in">
                                            <div style={{ padding: '24px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                        <span className="material-symbols-outlined">campaign</span>
                                                    </div>
                                                    <div>
                                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-deep-brown)', fontWeight: 800 }}>System-wide Broadcasts</h3>
                                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Manage platform announcements and alerts</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setTab('help')}
                                                        style={{ background: 'var(--bg-peach)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)', fontWeight: 800, marginTop: '-12px' }}
                                                        title="How does this page work?"
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>help_outline</span>
                                                    </button>
                                                </div>
                                                <button 
                                                    onClick={() => setShowAddAnnouncementModal(true)}
                                                    className="btn-primary"
                                                    style={{ padding: '10px 24px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', width: 'auto', background: 'var(--primary)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 12px rgba(183, 71, 42, 0.2)' }}
                                                >
                                                    <span className="material-symbols-outlined">add</span>
                                                    New Broadcast
                                                </button>
                                            </div>
                                            <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', background: 'transparent', borderBottom: '1px solid var(--border-color)' }}>
                                                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                                                    <div style={{ position: 'relative', flex: 1 }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Search broadcasts by title or content..."
                                                            value={announcementSearch}
                                                            onChange={(e) => { setAnnouncementSearch(e.target.value); setAnnouncementPage(1); }}
                                                            style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', background: 'var(--input-bg)', color: 'var(--text-deep-brown)', outline: 'none', transition: 'all 0.2s ease' }}
                                                        />
                                                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '1.2rem', pointerEvents: 'none' }}>search</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <AnnouncementManager
                                                announcements={announcements}
                                                fetchAnnouncements={fetchAnnouncements}
                                                setShowAddModal={setShowAddAnnouncementModal}
                                            />
                                            {announcementTotalPages > 1 && (
                                                <div className="pagination-footer" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
                                                    <div className="pagination-info" style={{ color: 'var(--text-muted)' }}>
                                                        Showing page {announcementPage} of {announcementTotalPages} ({announcementCount} broadcasts)
                                                    </div>
                                                    <div className="pagination-controls">
                                                        <button 
                                                            onClick={() => setAnnouncementPage(p => Math.max(1, p - 1))} 
                                                            disabled={announcementPage === 1}
                                                            className="pagination-btn"
                                                        >
                                                            <span className="material-symbols-outlined">chevron_left</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => setAnnouncementPage(p => Math.min(announcementTotalPages, p + 1))} 
                                                            disabled={announcementPage === announcementTotalPages}
                                                            className="pagination-btn"
                                                        >
                                                            <span className="material-symbols-outlined">chevron_right</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {tab === 'audit' && (
                                        <div className="fade-in">
                                            <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', background: 'transparent', borderBottom: '1px solid var(--border-color)' }}>
                                                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                                                    <div style={{ position: 'relative', flex: 0.7 }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Search logs..."
                                                            value={auditSearch}
                                                            onChange={(e) => { setAuditSearch(e.target.value); setAuditPage(1); }}
                                                            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', background: 'var(--input-bg)', color: 'var(--text-deep-brown)', outline: 'none' }}
                                                        />
                                                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '1.2rem', color: 'var(--text-muted)', pointerEvents: 'none' }}>search</span>
                                                    </div>
                                                    <select
                                                        value={auditAction}
                                                        onChange={(e) => { setAuditAction(e.target.value); setAuditPage(1); }}
                                                        style={{ flex: 0.3, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 700, background: 'var(--input-bg)', color: 'var(--text-deep-brown)', cursor: 'pointer', outline: 'none' }}
                                                    >
                                                        <option value="">All Actions</option>
                                                        <option value="LOGIN">Login</option>
                                                        <option value="REGISTER">Register</option>
                                                        <option value="TRANSACTION_CREATE">TX Create</option>
                                                        <option value="TRANSACTION_STATUS_CHANGE">TX Status Change</option>
                                                        <option value="VENDOR_ACCEPT_TRANSACTION">Vendor Accept</option>
                                                        <option value="VENDOR_COMPLETE_TRANSACTION">Vendor Complete</option>
                                                        <option value="CREATE_VENDOR">Create Vendor</option>
                                                        <option value="UPDATE_SYSTEM_CONFIG">System Config Update</option>
                                                        <option value="UPDATE_SYSTEM_LOGO">Logo Upload</option>
                                                        <option value="SYSTEM_BACKUP_MANUAL">Manual Backup</option>
                                                        <option value="UPDATE_PAYMENT_METHOD">Payment Method Update</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <table style={{ marginTop: '0' }}>
                                                <thead>
                                                    <tr>
                                                        <th>Timestamp</th>
                                                        <th>User & Action</th>
                                                        <th>Details</th>
                                                        <th>IP Address</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {auditLogs.map(log => (
                                                        <tr key={log.id}>
                                                            <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                                                {new Date(log.createdAt).toLocaleString()}
                                                            </td>
                                                            <td>
                                                                <div style={{ fontWeight: 700 }}>{log.user?.full_name || 'System'}</div>
                                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{log.user?.email}</div>
                                                                <div className={`badge badge-${log.action.toLowerCase().replace(/_/g, '-')}`} style={{ marginTop: '4px', fontSize: '0.6rem' }}>{log.action}</div>
                                                            </td>
                                                            <td style={{ fontSize: '0.8rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {log.details}
                                                            </td>
                                                            <td style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                                                {log.ipAddress}
                                                                <button
                                                                    onClick={() => { navigator.clipboard.writeText(log.ipAddress); toast.success('IP Copied!'); }}
                                                                    style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3 }}
                                                                    title="Copy IP"
                                                                >
                                                                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>content_copy</span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {auditLogs.length === 0 && (
                                                        <tr>
                                                            <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No audit logs found matching your criteria.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* Pagination */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                                    {tab === 'transactions' && renderPaginationButtons(page, totalPages, setPage)}
                                    {tab === 'audit' && renderPaginationButtons(auditPage, auditTotalPages, setAuditPage)}
                                    {tab === 'inquiries' && renderPaginationButtons(inquiryPage, inquiryTotalPages, setInquiryPage)}
                                    {tab === 'vendors' && renderPaginationButtons(vendorPage, vendorTotalPages, setVendorPage)}
                                    {tab === 'admins' && renderPaginationButtons(adminPage, adminTotalPages, setAdminPage)}
                                    {(tab === 'users' || tab === 'kyc') && renderPaginationButtons(userPage, userTotalPages, setUserPage)}
                                    {tab === 'complaints' && renderPaginationButtons(complaintPage, complaintTotalPages, setComplaintPage)}
                                </div>
                            </>
                        )}

                        {tab === 'payment-settings' && <PaymentSettings triggerSecureAction={triggerSecureAction} />}
                        {tab === 'profile' && <AdminProfile />}
                        {tab === 'analytics' && <AnalyticsContainer stats={adminStats} />}
                        {tab === 'help' && <HelpCenter />}
                        {tab === 'system-settings' && <SystemSettings triggerSecureAction={triggerSecureAction} />}
                    </div>
                </main>
            </div>
            {/* Admin Transaction Details Modal */}
            {showTxModal && selectedTx && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="card scale-in" style={{ width: '100%', maxWidth: '500px', padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Transaction Details (ID: {selectedTx.transaction_id})</h3>
                            <button onClick={() => setShowTxModal(false)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>close</span>
                            </button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>User</label>
                                    <div style={{ fontWeight: 700 }}>{selectedTx.user?.full_name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedTx.user?.email}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Status</label>
                                    <div style={{ marginTop: '4px' }}><span className={`badge badge-${selectedTx.status}`}>{selectedTx.status.toUpperCase()}</span></div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Initiated At</label>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{new Date(selectedTx.createdAt).toLocaleString()}</div>
                                </div>
                                {selectedTx.sent_at && (
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--success)', textTransform: 'uppercase', fontWeight: 800 }}>Sent Date</label>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--success)' }}>{new Date(selectedTx.sent_at).toLocaleString()}</div>
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '8px' }}>Financial Summary</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Currency Pair</div>
                                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {selectedTx.type?.split('-')[0]}
                                            <span className="material-symbols-outlined" style={{ fontSize: '1rem', opacity: 0.5 }}>arrow_forward</span>
                                            {selectedTx.type?.split('-')[1]}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exchange Rate</div>
                                        <div style={{ fontWeight: 700 }}>1 {selectedTx.type?.split('-')[0]} = {(selectedTx.amount_received / selectedTx.amount_sent).toFixed(4)} {selectedTx.type?.split('-')[1]}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amount Sent</div>
                                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-deep-brown)' }}>{selectedTx.amount_sent} {selectedTx.type?.split('-')[0]}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>To Recipient</div>
                                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>{selectedTx.amount_received} {selectedTx.type?.split('-')[1]}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Recipient Details</label>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'var(--text-deep-brown)', color: '#fff', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                        {selectedTx.recipient_details?.type || 'Transfer'}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Full Name:</span>
                                        <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.name}</span>
                                    </div>

                                    {selectedTx.recipient_details?.type === 'momo' && (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Momo Provider:</span>
                                                <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{selectedTx.recipient_details?.momo_provider}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Momo Number:</span>
                                                <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.phone || selectedTx.recipient_details?.account}</span>
                                            </div>
                                        </>
                                    )}

                                    {selectedTx.recipient_details?.type === 'bank' && (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Bank Name:</span>
                                                <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.bank_name}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Account Number:</span>
                                                <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.account}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Transit Number:</span>
                                                <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.transit_number}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Institution:</span>
                                                <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.institution_number}</span>
                                            </div>
                                        </>
                                    )}

                                    {selectedTx.recipient_details?.type === 'interac' && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Interac Email:</span>
                                            <span style={{ fontWeight: 700 }}>{selectedTx.recipient_details?.interac_email}</span>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Reference:</span>
                                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{selectedTx.recipient_details?.admin_reference || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedTx.recipient_details?.note && (
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>User Note</label>
                                    <div style={{ fontSize: '0.9rem', fontStyle: 'italic', marginTop: '4px', background: '#fff', padding: '8px', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                                        "{selectedTx.recipient_details?.note}"
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setShowTxModal(false)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Close
                                </button>
                                {user?.sub_role === 'super' && selectedTx.status === 'pending' && (
                                    <button
                                        onClick={() => { updateStatus(selectedTx.id, 'processing'); setShowTxModal(false); }}
                                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--warning)', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Start Processing
                                    </button>
                                )}
                                {user?.sub_role === 'super' && selectedTx.status === 'processing' && (
                                    <button
                                        onClick={() => { updateStatus(selectedTx.id, 'sent'); setShowTxModal(false); }}
                                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--success)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Mark as Sent
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin User Management Modal */}
            {showUserModal && selectedUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="card scale-in" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>User Management</h3>
                            <button onClick={() => setShowUserModal(false)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>close</span>
                            </button>
                        </div>
                        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-peach)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-deep-brown)' }}>
                                    {selectedUser.full_name?.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-deep-brown)' }}>{selectedUser.full_name}</h4>
                                        {selectedUser.is_email_verified ? (
                                            <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '50px', background: 'rgba(40, 167, 69, 0.1)', color: '#28a745', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>verified</span> Verified
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '50px', background: 'rgba(216, 59, 1, 0.1)', color: 'var(--danger)', fontWeight: 800 }}>Unverified</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800, margin: '4px 0' }}>{selectedUser.account_number || 'N/A'}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{selectedUser.email}</div>
                                    <div style={{ marginTop: '4px' }}><span className={`badge badge-${selectedUser.kyc_status}`}>{selectedUser.kyc_status.toUpperCase()}</span></div>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(183,71,42,0.05)', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', border: '1px solid rgba(183,71,42,0.1)' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Lifetime Transfers (GHS)</label>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-deep-brown)' }}>{parseFloat(selectedUser.balance_ghs).toLocaleString()} GHS</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Lifetime Transfers (CAD)</label>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-deep-brown)' }}>{parseFloat(selectedUser.balance_cad).toLocaleString()} CAD</div>
                                </div>
                            </div>

                             <div style={{ padding: '20px', background: 'var(--input-bg)', borderRadius: '16px', marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Phone Number</label>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-deep-brown)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>phone</span>
                                        {selectedUser.phone || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Registered Country</label>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-deep-brown)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>public</span>
                                        {selectedUser.country || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Registration Date</label>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-deep-brown)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>calendar_today</span>
                                        {new Date(selectedUser.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Last Activity</label>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-deep-brown)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>history</span>
                                        {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '12px' }}>Account Access Control</label>
                                {selectedUser.id === user?.id ? (
                                    <div style={{ padding: '16px', background: 'rgba(183, 71, 42, 0.05)', borderRadius: '12px', border: '1px solid rgba(183,71,42,0.1)', textAlign: 'center' }}>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
                                            <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '6px', fontSize: '1.2rem' }}>info</span>
                                            Self-management Restricted
                                        </p>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            You cannot disable your own administrative account.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleStatus(selectedUser.id)}
                                                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: selectedUser.is_active ? 'var(--danger)' : 'var(--success)', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                            >
                                                <span className="material-symbols-outlined">{selectedUser.is_active ? 'block' : 'check_circle'}</span>
                                                {selectedUser.is_active ? 'Disable Account' : 'Enable Account'}
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                            {selectedUser.is_active
                                                ? 'Disabling this account will prevent the user from logging in or performing any transactions. Admin PIN required.'
                                                : 'Enabling this account will restore full access to the platform.'}
                                        </p>
                                    </>
                                )}
                            </div>

                            {selectedUser.role === 'vendor' && (
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '8px' }}>Assigned Region</label>
                                    <select
                                        value={selectedUser.country || 'All'}
                                        onChange={(e) => updateRegion(selectedUser.id, e.target.value)}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                    >
                                        <option value="Canada">Canada</option>
                                        <option value="Ghana">Ghana</option>
                                        <option value="All">All Countries</option>
                                    </select>
                                </div>
                            )}

                            {selectedUser.role === 'vendor' && (
                                <div style={{ marginBottom: '32px' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '16px' }}>Performance Overview</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                        <div style={{ padding: '12px', background: 'rgba(183, 71, 42, 0.08)', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(183, 71, 42, 0.1)' }}>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Handled</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-deep-brown)' }}>{vendorStats.totalCount}</div>
                                        </div>
                                        <div style={{ padding: '12px', background: 'rgba(183, 71, 42, 0.08)', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(183, 71, 42, 0.1)' }}>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>CAD Volume</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-deep-brown)' }}>${vendorStats.totalVolumeCAD.toLocaleString()}</div>
                                        </div>
                                        <div style={{ padding: '12px', background: 'rgba(183, 71, 42, 0.08)', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(183, 71, 42, 0.1)' }}>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>GHS Volume</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-deep-brown)' }}>{vendorStats.totalVolumeGHS.toLocaleString()}₵</div>
                                        </div>
                                        <div style={{ padding: '12px', background: 'var(--success)', color: '#fff', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>Success Rate</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{vendorStats.successRate}%</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedUser.role === 'admin' && user?.sub_role === 'super' && selectedUser.id !== user.id && (
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '12px' }}>Administrative Permissions</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <button
                                            onClick={() => updateAdminRole(selectedUser.id, 'super')}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: selectedUser.sub_role === 'super' ? '2px solid #4A154B' : '1px solid var(--border-color)',
                                                background: selectedUser.sub_role === 'super' ? 'rgba(74, 21, 75, 0.1)' : 'var(--card-bg)',
                                                color: selectedUser.sub_role === 'super' ? '#8a3ab9' : 'var(--text-deep-brown)',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>workspace_premium</span>
                                            Promote to Super
                                        </button>
                                        <button
                                            onClick={() => updateAdminRole(selectedUser.id, 'support')}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: selectedUser.sub_role === 'support' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                                background: selectedUser.sub_role === 'support' ? 'rgba(183, 71, 42, 0.1)' : 'var(--card-bg)',
                                                color: 'var(--primary)',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>support_agent</span>
                                            Demote to Support
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                        {selectedUser.sub_role === 'super'
                                            ? 'Super Admins have unrestricted access to settings, financials, and logs.'
                                            : 'Support Agents are restricted from sensitive platform configurations and overrides.'}
                                    </p>
                                </div>
                            )}

                            {selectedUser.role === 'admin' && user?.sub_role === 'super' && selectedUser.id !== user.id && (
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '8px' }}>Role Revocation</label>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Are you sure you want to REVOKE admin privileges? This user will become a regular user and lose dashboard access.')) {
                                                setSecureActionPin('');
                                                setSecureAction('REVOKE_ADMIN');
                                                setSecureActionData({ userId: selectedUser.id });
                                                setShowSecureActionModal(true);
                                            }
                                        }}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--danger)', background: 'rgba(216, 59, 1, 0.05)', color: 'var(--danger)', fontWeight: 800, cursor: 'pointer' }}
                                    >
                                        Revoke Admin Privileges
                                    </button>
                                </div>
                            )}

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '12px' }}>
                                    {selectedUser.role === 'vendor' ? 'Service History' : 'Transaction History'}
                                </label>
                                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                                    <table style={{ margin: 0, fontSize: '0.8rem' }}>
                                        <thead style={{ background: 'var(--input-bg)' }}>
                                            <tr>
                                                <th style={{ padding: '10px', color: 'var(--text-deep-brown)' }}>ID/Type</th>
                                                <th style={{ padding: '10px', color: 'var(--text-deep-brown)' }}>Amount</th>
                                                <th style={{ padding: '10px', color: 'var(--text-deep-brown)' }}>Status</th>
                                                <th style={{ padding: '10px', color: 'var(--text-deep-brown)' }}>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {userTransactionsLoading ? (
                                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Loading history...</td></tr>
                                            ) : userTransactions.length === 0 ? (
                                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No transactions found.</td></tr>
                                            ) : userTransactions.map(tx => (
                                                <tr key={tx.id}>
                                                    <td style={{ padding: '10px' }}>
                                                        <div style={{ fontWeight: 700 }}>#{tx.id}</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tx.type}</div>
                                                    </td>
                                                    <td style={{ padding: '10px', fontWeight: 700 }}>
                                                        {parseFloat(tx.amount_sent).toLocaleString()} {tx.type?.split('-')[0]}
                                                    </td>
                                                    <td style={{ padding: '10px' }}>
                                                        <span className={`badge badge-${tx.status}`} style={{ fontSize: '0.65rem' }}>{tx.status}</span>
                                                    </td>
                                                    <td style={{ padding: '10px', color: 'var(--text-muted)' }}>
                                                        {new Date(tx.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '24px' }}>
                                <button
                                    onClick={() => setShowUserModal(false)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-deep-brown)', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Universal Secure Action PIN Modal */}
            {showSecureActionModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(10px)' }}>
                    <div className="glass-card scale-in" style={{ width: '90%', maxWidth: '400px', p: 0, borderRadius: '28px', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(216, 59, 1, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-symbols-outlined" style={{ color: 'var(--danger)', fontSize: '1.5rem' }}>security</span>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-deep-brown)' }}>Authorization Required</h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confirm administrative action</p>
                                </div>
                            </div>
                            <button onClick={() => setShowSecureActionModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSecureActionSubmit} style={{ padding: '32px 24px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-deep-brown)', fontWeight: 700, marginBottom: '8px' }}>
                                    {secureAction === 'TOGGLE_STATUS' ? 'Authorize Account Suspension' : 
                                     secureAction === 'UPDATE_ADMIN_ROLE' ? 'Authorize Permission Change' : 
                                     secureAction === 'REVOKE_ADMIN' ? 'Authorize Privilege Revocation' : 'Authorize Action'}
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Please enter your 4-digit security PIN to proceed.</p>
                            </div>
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <input
                                    type="password"
                                    maxLength="4"
                                    pattern="\d{4}"
                                    autoFocus
                                    required
                                    placeholder="••••"
                                    value={secureActionPin}
                                    onChange={(e) => setSecureActionPin(e.target.value.replace(/\D/g, ''))}
                                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '12px', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={secureActionLoading}
                                style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(183, 71, 42, 0.2)' }}
                             >
                                {secureActionLoading ? <span className="material-symbols-outlined spin">sync</span> : <span className="material-symbols-outlined">verified</span>}
                                {secureActionLoading ? 'Authorizing...' : 'Verify & Execute'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Vendor Modal (Registration Form) */}
            {showAddVendorModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(8px)' }}>
                    <div className="glass-card scale-in" style={{ width: '100%', maxWidth: '500px', padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-deep-brown)' }}>Register New Workforce (Vendor)</h3>
                            <button onClick={() => setShowAddVendorModal(false)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateVendor}>
                            <div style={{ padding: '24px' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Fill in the details below to create a dedicated Vendor account. Vendors are managed separately from platform customers.</p>

                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>First Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={newVendor.firstName}
                                                onChange={(e) => setNewVendor({ ...newVendor, firstName: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                                placeholder="John"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Last Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={newVendor.lastName}
                                                onChange={(e) => setNewVendor({ ...newVendor, lastName: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Middle Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={newVendor.middleName}
                                            onChange={(e) => setNewVendor({ ...newVendor, middleName: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                            placeholder="Moro"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={newVendor.email}
                                            onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                            placeholder="vendor@qwiktransfers.com"
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Phone Number</label>
                                            <input
                                                type="text"
                                                required
                                                value={newVendor.phone}
                                                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                                placeholder="+233..."
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={newVendor.password}
                                                onChange={(e) => setNewVendor({ ...newVendor, password: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Assigned Region (Country)</label>
                                        <select
                                            required
                                            value={newVendor.country}
                                            onChange={(e) => setNewVendor({ ...newVendor, country: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                        >
                                            <option value="Canada">Canada (CAD Transactions)</option>
                                            <option value="Ghana">Ghana (GHS Transactions)</option>
                                            <option value="All">All Countries (Global)</option>
                                        </select>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            Vendors assigned to a country can only claim transactions originating from that country.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', background: 'var(--card-bg)', display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddVendorModal(false)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(183, 71, 42, 0.2)' }}
                                >
                                    Create Vendor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Administrative Staff Modal */}
            {showAddAdminModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(8px)' }}>
                    <div className="glass-card scale-in" style={{ width: '100%', maxWidth: '500px', padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-deep-brown)' }}>Register Administrative Staff</h3>
                            <button onClick={() => setShowAddAdminModal(false)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateAdmin}>
                            <div style={{ padding: '24px' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Create an internal account for platform management. Staff members are granted access to the Admin Dashboard.</p>

                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>First Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={newAdmin.firstName}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                                placeholder="Employee First Name"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Last Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={newAdmin.lastName}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                                placeholder="Last Name"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={newAdmin.email}
                                            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                            placeholder="staff@qwiktransfers.com"
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Phone Number</label>
                                            <input
                                                type="text"
                                                required
                                                value={newAdmin.phone}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={newAdmin.password}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Sub-Role (Permissions)</label>
                                        <select
                                            required
                                            value={newAdmin.sub_role}
                                            onChange={(e) => setNewAdmin({ ...newAdmin, sub_role: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                        >
                                            <option value="support">Support Agent (Restricted Financials)</option>
                                            <option value="super">Super Admin (Full Platform Access)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', background: 'var(--card-bg)', display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddAdminModal(false)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(183, 71, 42, 0.2)' }}
                                >
                                    Create Admin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAdminConfirmModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '400px', p: 0, borderRadius: '24px', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="material-symbols-outlined" style={{ color: 'var(--success)' }}>verified</span>
                                Admin Override Confirm
                            </h2>
                            <button onClick={() => setShowAdminConfirmModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleAdminForceConfirm} style={{ padding: '24px' }}>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Payment Proof</label>
                                {!adminConfirmData.proofImage ? (
                                    <div style={{ padding: '24px', border: '2px dashed var(--border-color)', borderRadius: '12px', textAlign: 'center', background: 'var(--input-bg)', cursor: 'pointer', position: 'relative' }}>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            required
                                            onChange={(e) => setAdminConfirmData(prev => ({ ...prev, proofImage: e.target.files[0] }))}
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                        />
                                        <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--text-muted)', marginBottom: '8px' }}>cloud_upload</span>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click or drag file to upload</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Images or PDF only</div>
                                    </div>
                                ) : (
                                    <div style={{ position: 'relative', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', height: '120px', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {adminConfirmData.proofImage.type === 'application/pdf' ? (
                                            <div style={{ textAlign: 'center' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--danger)' }}>picture_as_pdf</span>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '4px' }}>{adminConfirmData.proofImage.name}</div>
                                            </div>
                                        ) : (
                                            <img src={URL.createObjectURL(adminConfirmData.proofImage)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setAdminConfirmData(prev => ({ ...prev, proofImage: null }))}
                                            style={{ position: 'absolute', top: '8px', right: '8px', background: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                                            title="Remove Image"
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--danger)' }}>delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="form-group" style={{ marginBottom: '32px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>4-Digit Security PIN</label>
                                <input
                                    type="password"
                                    maxLength="4"
                                    pattern="\d{4}"
                                    required
                                    placeholder="••••"
                                    value={adminConfirmData.pin}
                                    onChange={(e) => setAdminConfirmData(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '8px' }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={adminConfirmLoading}
                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'var(--success)', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                {adminConfirmLoading ? <span className="material-symbols-outlined spin">sync</span> : <span className="material-symbols-outlined">done_all</span>}
                                {adminConfirmLoading ? 'Confirming...' : 'Force Confirm'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showAssignVendorModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '400px', p: 0, borderRadius: '24px', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>assignment_ind</span>
                                Confirm Assignment
                            </h2>
                            <button onClick={() => setShowAssignVendorModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleAssignVendorSubmit} style={{ padding: '24px' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                                You are about to assign this transaction. Please enter your Admin PIN to confirm and notify the vendor.
                            </p>
                            <div className="form-group" style={{ marginBottom: '32px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>4-Digit Security PIN</label>
                                <input
                                    type="password"
                                    maxLength="4"
                                    pattern="\d{4}"
                                    required
                                    placeholder="••••"
                                    value={assignVendorData.pin}
                                    onChange={(e) => setAssignVendorData(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '8px' }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={assignVendorLoading}
                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                {assignVendorLoading ? <span className="material-symbols-outlined spin">sync</span> : <span className="material-symbols-outlined">how_to_reg</span>}
                                {assignVendorLoading ? 'Assigning...' : 'Assign Vendor'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showAddAnnouncementModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(8px)' }}>
                    <div className="glass-card scale-in" style={{ width: '100%', maxWidth: '600px', padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-deep-brown)' }}>
                                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>campaign</span>
                                New System-wide Broadcast
                            </h3>
                            <button onClick={() => setShowAddAnnouncementModal(false)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateAnnouncement}>
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gap: '20px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Announcement Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={newAnnouncement.title}
                                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                            placeholder="e.g., Weekend Maintenance, New Vendor Policy"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Broadcast Message</label>
                                        <textarea
                                            required
                                            value={newAnnouncement.message}
                                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)', minHeight: '120px', resize: 'vertical' }}
                                            placeholder="Write your detailed message here..."
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Broadcast Type</label>
                                            <select
                                                value={newAnnouncement.type}
                                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                            >
                                                <option value="info">Information (Blue)</option>
                                                <option value="warning">Warning (Orange)</option>
                                                <option value="success">Success (Green)</option>
                                                <option value="urgent">Urgent/Critical (Red)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Audience Targeting</label>
                                            <select
                                                value={newAnnouncement.target}
                                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                            >
                                                <option value="all">Everyone (Platform-wide)</option>
                                                <option value="vendors">Vendors Only</option>
                                                <option value="users">Regular Users Only</option>
                                                <option value="support">Support Staff Only</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Expiry Date (Optional)</label>
                                        <input
                                            type="date"
                                            value={newAnnouncement.expires_at}
                                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, expires_at: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)' }}
                                        />
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Notice will automatically vanish from user dashboards after this date.</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', background: 'var(--card-bg)', display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddAnnouncementModal(false)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-deep-brown)', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(183, 71, 42, 0.2)' }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>rocket_launch</span>
                                    Broadcast Now
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPreviewModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001, backdropFilter: 'blur(10px)' }}>
                    <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="fade-in">
                        <button
                            onClick={() => { setShowPreviewModal(false); setImageLoading(true); }}
                            style={{ position: 'absolute', top: '-40px', right: '-40px', background: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
                        >
                            <span className="material-symbols-outlined" style={{ color: 'var(--text-deep-brown)' }}>close</span>
                        </button>
                        
                        {previewImage.endsWith('.pdf') ? (
                            <iframe src={previewImage} onLoad={() => setImageLoading(false)} style={{ width: '80vw', height: '80vh', border: 'none', borderRadius: '12px', opacity: imageLoading ? 0 : 1, transition: 'opacity 0.3s' }} title="Proof PDF"></iframe>
                        ) : (
                            <img
                                src={previewImage}
                                alt="Preview"
                                onLoad={() => setImageLoading(false)}
                                style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', opacity: imageLoading ? 0 : 1, transition: 'opacity 0.3s' }}
                            />
                        )}

                        {imageLoading && (
                            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                <div className="spinner" style={{ width: '48px', height: '48px', border: '4px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                <div style={{ color: '#fff', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.8rem' }}>Loading Proof...</div>
                            </div>
                        )}

                        {previewDate && !imageLoading && (
                            <div style={{ position: 'absolute', bottom: '-40px', left: 0, width: '100%', textAlign: 'center', color: 'white', fontWeight: 600 }}>
                                Uploaded on: {new Date(previewDate).toLocaleString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    hour12: true
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
