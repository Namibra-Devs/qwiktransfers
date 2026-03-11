const { Inquiry } = require('../models');
const { logAction } = require('../services/auditService');

const submitInquiry = async (req, res) => {
    try {
        const { full_name, email, subject, message } = req.body;

        if (!full_name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const inquiry = await Inquiry.create({
            full_name,
            email,
            subject,
            message,
            status: 'pending'
        });

        // Audit log (anonymous or user)
        await logAction({
            userId: req.user ? req.user.id : null,
            action: 'SUBMIT_INQUIRY',
            details: `Contact form submission from ${email}. Subject: ${subject}`,
            ipAddress: req.ip
        });

        res.status(201).json({ 
            message: 'Your inquiry has been submitted successfully. We will get back to you soon!', 
            inquiry 
        });
    } catch (error) {
        console.error('Inquiry submission error:', error);
        res.status(500).json({ error: 'Failed to submit inquiry. Please try again later.' });
    }
};

const getInquiries = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (status) where.status = status;

        const { count, rows: inquiries } = await Inquiry.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            inquiries,
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Fetch inquiries error:', error);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
};

const updateInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const inquiry = await Inquiry.findByPk(id);
        if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });

        inquiry.status = status;
        await inquiry.save();

        res.json({ message: 'Inquiry status updated', inquiry });
    } catch (error) {
        console.error('Update inquiry error:', error);
        res.status(500).json({ error: 'Failed to update inquiry' });
    }
};

module.exports = {
    submitInquiry,
    getInquiries,
    updateInquiryStatus
};
