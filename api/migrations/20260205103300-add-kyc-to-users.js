'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'kyc_status', {
      type: Sequelize.ENUM('pending', 'verified', 'rejected'),
      defaultValue: 'pending'
    });
    await queryInterface.addColumn('Users', 'kyc_document', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'kyc_status');
    await queryInterface.removeColumn('Users', 'kyc_document');
  }
};
