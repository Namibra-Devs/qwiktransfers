'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    await queryInterface.bulkInsert('Users', [
      {
        email: 'admin@qwiktransfers.com',
        password: hashedPassword,
        role: 'admin',
        kyc_status: 'verified',
        balance_ghs: 1000.00,
        balance_cad: 500.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'user@example.com',
        password: hashedPassword,
        role: 'user',
        kyc_status: 'pending',
        balance_ghs: 200.00,
        balance_cad: 0.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'verified@example.com',
        password: hashedPassword,
        role: 'user',
        kyc_status: 'verified',
        balance_ghs: 5000.00,
        balance_cad: 0.00,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
