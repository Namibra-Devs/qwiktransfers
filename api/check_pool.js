const { Transaction } = require('./models');

async function checkPool() {
    try {
        const pending = await Transaction.findAll({
            where: { status: 'pending', vendorId: null },
            attributes: ['id', 'transaction_id', 'type', 'status', 'createdAt']
        });

        console.log('--- Pending Transactions Report ---');
        if (pending.length === 0) {
            console.log('No pending transactions found.');
        } else {
            pending.forEach(tx => {
                console.log(`ID: ${tx.id} | TX_ID: ${tx.transaction_id} | Type: ${tx.type} | Status: ${tx.status} | Created: ${tx.createdAt}`);
            });
        }
        process.exit(0);
    } catch (error) {
        console.error('Diagnostic failed:', error);
        process.exit(1);
    }
}

checkPool();
