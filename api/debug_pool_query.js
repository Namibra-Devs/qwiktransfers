const { Transaction, User } = require('./models');
const { Op } = require('sequelize');

async function debugPool(vendorId) {
    try {
        const user = await User.findByPk(vendorId);
        if (!user) {
            console.log(`Vendor ${vendorId} not found.`);
            return;
        }

        console.log(`--- Debugging Pool for Vendor: ${user.email} (Region: ${user.country}) ---`);

        const where = {
            status: 'pending',
            vendorId: null
        };

        if (user.country === 'Canada') {
            where.type = { [Op.like]: 'CAD-%' };
        } else if (user.country === 'Ghana') {
            where.type = { [Op.like]: 'GHS-%' };
        }

        console.log('Query "where" clause:', JSON.stringify(where, null, 2));

        const pool = await Transaction.findAll({
            where,
            attributes: ['id', 'type', 'status']
        });

        console.log(`Result: Found ${pool.length} transactions.`);
        pool.forEach(tx => console.log(` - ID: ${tx.id} | Type: ${tx.type}`));
        
        process.exit(0);
    } catch (error) {
        console.error('Debug failed:', error);
        process.exit(1);
    }
}

// Test with vendor IDs from our earlier report: 18 (Ghana), 19 (Canada), 21 (All)
const targetId = process.argv[2] || 18;
debugPool(targetId);
