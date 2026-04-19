const { Announcement, AnnouncementDismissal, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const createAnnouncement = async (req, res) => {
    try {
        const { title, message, type, target, expires_at } = req.body;
        
        const announcement = await Announcement.create({
            title,
            message,
            type: type || 'info',
            target: target || 'all',
            expires_at,
            created_by: req.user.id
        });

        res.status(201).json({ message: 'Announcement broadcasted successfully', announcement });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAdminAnnouncements = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { message: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: announcements } = await Announcement.findAndCountAll({
            where,
            include: [{ model: User, as: 'creator', attributes: ['first_name', 'last_name', 'email'] }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            announcements,
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserAnnouncements = async (req, res) => {
    try {
        const { role, id: userId, sub_role } = req.user;
        
        // Define target groups based on user role/sub_role
        const targets = ['all'];
        if (role === 'vendor') targets.push('vendors');
        if (role === 'user') targets.push('users');
        if (role === 'admin' && sub_role === 'support') targets.push('support');

        // Fetch dismissed announcements for this user
        const dismissed = await AnnouncementDismissal.findAll({
            where: { userId },
            attributes: ['announcementId']
        });
        const dismissedIds = dismissed.map(d => d.announcementId);

        // Fetch announcements that:
        // 1. Target this user's group
        // 2. Are active
        // 3. Haven't expired
        // 4. Haven't been dismissed by this user
        const whereClause = {
            target: { [Op.in]: targets },
            is_active: true,
            [Op.or]: [
                { expires_at: null },
                { expires_at: { [Op.gt]: new Date() } }
            ]
        };

        if (dismissedIds.length > 0) {
            whereClause.id = { [Op.notIn]: dismissedIds };
        }

        const announcements = await Announcement.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const dismissAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        await AnnouncementDismissal.findOrCreate({
            where: { announcementId: id, userId: req.user.id }
        });
        res.json({ message: 'Announcement dismissed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        await Announcement.destroy({ where: { id } });
        res.json({ message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createAnnouncement,
    getAdminAnnouncements,
    getUserAnnouncements,
    dismissAnnouncement,
    deleteAnnouncement
};
