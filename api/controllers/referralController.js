const { Referral, User, Transaction } = require('../models');
const { Op } = require('sequelize');

const getReferralStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        const totalReferrals = await User.count({ where: { referred_by_id: userId } });
        
        const rewardSummary = await Referral.findAll({
            where: { referrer_id: userId },
            attributes: [
                'status',
                [Referral.sequelize.fn('SUM', Referral.sequelize.col('reward_amount')), 'total_amount'],
                'reward_currency'
            ],
            group: ['status', 'reward_currency']
        });

        res.json({
            referral_code: user.referral_code,
            total_referrals: totalReferrals,
            rewards: rewardSummary
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getReferredUsers = async (req, res) => {
    try {
        const userId = req.user.id;
        const referredUsers = await User.findAll({
            where: { referred_by_id: userId },
            attributes: ['id', 'first_name', 'last_name', 'createdAt'],
            include: [{
                model: Transaction,
                as: 'transactions',
                where: { status: 'sent' },
                required: false,
                limit: 1
            }]
        });

        const formattedUsers = referredUsers.map(user => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            joinedAt: user.createdAt,
            status: user.transactions.length > 0 ? 'Completed First TX' : 'Joined'
        }));

        res.json(formattedUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getReferralStats, getReferredUsers };
