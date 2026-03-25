const { Complaint, User, Transaction } = require('../models');

// User: Create a new complaint
exports.createComplaint = async (req, res) => {
    try {
        const { subject, description, transaction_id } = req.body;
        const user_id = req.user.id;

        if (!subject || !description) {
            return res.status(400).json({ error: 'Subject and description are required' });
        }

        let attachment_url = null;
        if (req.file) {
            attachment_url = `/uploads/${req.file.filename}`;
        }

        const complaint = await Complaint.create({
            user_id,
            transaction_id: transaction_id || null,
            subject,
            description,
            attachment_url,
            status: 'open'
        });

        // Broadcast Notifications
        try {
            const { Notification } = require('../models');
            
            // Find all administrators
            const admins = await User.findAll({ where: { role: 'admin' } });
            
            let vendorIdToNotify = null;
            if (transaction_id) {
                const tx = await Transaction.findByPk(transaction_id);
                if (tx && tx.vendorId) {
                    vendorIdToNotify = tx.vendorId;
                }
            }

            // Notify designated vendor if applicable
            if (vendorIdToNotify) {
                await Notification.create({
                    userId: vendorIdToNotify,
                    type: 'complaint',
                    message: `A client filed a complaint mapped to a transaction you handled. Subject: ${subject}`
                });
            }

            // Notify all admins
            const adminNotifs = admins.map(admin => ({
                userId: admin.id,
                type: 'complaint',
                message: `New complaint filed by user ${req.user.full_name || user_id}. Subject: ${subject}`
            }));
            if (adminNotifs.length > 0) {
                await Notification.bulkCreate(adminNotifs);
            }
        } catch (notifErr) {
            console.error('Failed to send complaint notifications:', notifErr);
        }

        res.status(201).json({ message: 'Complaint submitted successfully', complaint });
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({ error: 'Failed to create complaint' });
    }
};

// User: Get their own complaints
exports.getUserComplaints = async (req, res) => {
    try {
        const user_id = req.user.id;
        const complaints = await Complaint.findAll({
            where: { user_id },
            order: [['createdAt', 'DESC']],
            include: [
                { model: Transaction, as: 'transaction', attributes: ['transaction_id', 'amount_sent', 'status'] }
            ]
        });

        res.json({ complaints });
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
};

// User: Update complaint
exports.updateUserComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { subject, description, transaction_id } = req.body;
        const user_id = req.user.id;

        const complaint = await Complaint.findOne({ where: { id, user_id } });
        if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
        if (complaint.status !== 'open') return res.status(400).json({ error: 'Only open complaints can be edited.' });

        if (subject) complaint.subject = subject;
        if (description) complaint.description = description;
        if (transaction_id) complaint.transaction_id = transaction_id;
        
        if (req.file) {
            complaint.attachment_url = `/uploads/${req.file.filename}`;
        }

        await complaint.save();
        res.json({ message: 'Complaint updated successfully', complaint });
    } catch (error) {
        console.error('Error updating user complaint:', error);
        res.status(500).json({ error: 'Failed to update complaint' });
    }
};

// User: Cancel complaint
exports.cancelComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const complaint = await Complaint.findOne({ where: { id, user_id } });
        if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
        if (complaint.status !== 'open') return res.status(400).json({ error: 'Only open complaints can be cancelled.' });

        complaint.status = 'closed';
        complaint.admin_response = 'Issue cancelled by user.';
        await complaint.save();

        res.json({ message: 'Complaint cancelled successfully', complaint });
    } catch (error) {
        console.error('Error cancelling complaint:', error);
        res.status(500).json({ error: 'Failed to cancel complaint' });
    }
};

// Admin: Get all complaints
exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.findAll({
            order: [['createdAt', 'DESC']],
            include: [
                { model: User, as: 'user', attributes: ['id', 'first_name', 'middle_name', 'last_name', 'email'] },
                { model: Transaction, as: 'transaction', attributes: ['transaction_id', 'amount_sent', 'status'] }
            ]
        });

        res.json({ complaints });
    } catch (error) {
        console.error('Error fetching all complaints:', error);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
};

// Admin: Update complaint status & response
exports.updateComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_response } = req.body;

        const complaint = await Complaint.findByPk(id);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        if (status) complaint.status = status;
        if (admin_response) complaint.admin_response = admin_response;

        await complaint.save();

        res.json({ message: 'Complaint updated successfully', complaint });
    } catch (error) {
        console.error('Error updating complaint:', error);
        res.status(500).json({ error: 'Failed to update complaint' });
    }
};
