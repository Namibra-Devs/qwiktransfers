const { Transaction } = require('./models');

async function checkSpecificTx() {
    try {
        const txs = await Transaction.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'transaction_id', 'status', 'vendorId', 'createdAt']
        });

        console.log('--- Latest Transactions Status ---');
        txs.forEach(tx => {
            console.log(`ID: ${tx.id} | TX_ID: ${tx.transaction_id} | Status: ${tx.status} | VendorID: ${tx.vendorId} | Created: ${tx.createdAt}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Diagnostic failed:', error);
        process.exit(1);
    }
}

checkSpecificTx();
