const { User } = require('./models');

async function checkVendors() {
    try {
        const vendors = await User.findAll({
            where: { role: 'vendor' },
            attributes: ['id', 'email', 'country', 'is_online', 'is_active']
        });

        console.log('--- Vendor Status Report ---');
        if (vendors.length === 0) {
            console.log('No vendors found in the database.');
        } else {
            vendors.forEach(v => {
                console.log(`ID: ${v.id} | Email: ${v.email} | Region: ${v.country} | Online: ${v.is_online} | Active: ${v.is_active}`);
            });
        }
        process.exit(0);
    } catch (error) {
        console.error('Diagnostic failed:', error);
        process.exit(1);
    }
}

checkVendors();
