const { User } = require('../models');

const generateAccountNumber = async (user) => {
    let isUnique = false;
    let accountNumber = '';
    while (!isUnique) {
        if (user.role === 'vendor') {
            const random = Math.floor(1000 + Math.random() * 9000); // 4 digits
            accountNumber = `QT-V-${random}`;
        } else {
            const random = Math.floor(100000 + Math.random() * 900000); // 6 digits
            accountNumber = `QT-${random}`;
        }
        const existing = await User.findOne({ where: { account_number: accountNumber } });
        if (!existing) isUnique = true;
    }
    return accountNumber;
};

const populate = async () => {
    try {
        const users = await User.findAll({ where: { account_number: null } });
        console.log(`Found ${users.length} users without account numbers.`);

        for (const user of users) {
            const accountNumber = await generateAccountNumber(user);
            user.account_number = accountNumber;
            await user.save();
            console.log(`Assigned ${accountNumber} to ${user.email}`);
        }

        console.log('Finished populating account numbers.');
        process.exit(0);
    } catch (error) {
        console.error('Error populating account numbers:', error);
        process.exit(1);
    }
};

populate();
