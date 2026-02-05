'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Seed Rates
    await queryInterface.bulkInsert('Rates', [
      {
        pair: 'GHS-CAD',
        rate: 0.0912,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // 2. Seed Transactions for User ID 2 (user@example.com)
    // We assume IDs are sequential if DB was fresh
    await queryInterface.bulkInsert('Transactions', [
      {
        userId: 2,
        type: 'GHS-CAD',
        amount_sent: 500.00,
        exchange_rate: 0.09,
        amount_received: 45.00,
        status: 'pending',
        recipient_details: JSON.stringify({
          type: 'momo',
          name: 'Kwame Mensah',
          account: '0244112233'
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 2,
        type: 'GHS-CAD',
        amount_sent: 1000.00,
        exchange_rate: 0.09,
        amount_received: 90.00,
        status: 'sent',
        proof_url: '/uploads/sample_receipt.jpg',
        recipient_details: JSON.stringify({
          type: 'bank',
          name: 'Ama Serwaa',
          account: '1002233445'
        }),
        createdAt: new Date(Date.now() - 86400000), // Yesterday
        updatedAt: new Date(Date.now() - 43200000)
      },
      {
        userId: 3,
        type: 'GHS-CAD',
        amount_sent: 2500.00,
        exchange_rate: 0.092,
        amount_received: 230.00,
        status: 'processing',
        proof_url: '/uploads/proof_test.png',
        recipient_details: JSON.stringify({
          type: 'momo',
          name: 'Yaw Boateng',
          account: '0555998877'
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Transactions', null, {});
    await queryInterface.bulkDelete('Rates', null, {});
  }
};
