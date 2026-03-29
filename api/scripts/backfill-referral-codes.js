const { User } = require('../models');

async function backfillReferralCodes() {
    console.log('Starting referral code backfill...');
    
    const users = await User.findAll({
        where: { referral_code: null }
    });
    
    console.log(`Found ${users.length} users needing codes.`);
    
    for (const user of users) {
        let code = '';
        let exists = true;
        
        while (exists) {
            code = 'QT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            const existing = await User.findOne({ where: { referral_code: code } });
            if (!existing) exists = false;
        }
        
        user.referral_code = code;
        await user.save();
        console.log(`Assigned ${code} to ${user.email}`);
    }
    
    console.log('Backfill complete!');
    process.exit(0);
}

backfillReferralCodes().catch(err => {
    console.error(err);
    process.exit(1);
});
