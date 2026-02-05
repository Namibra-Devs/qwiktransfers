'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // kyc_status already exists from initial migration
    await queryInterface.addColumn('Users', 'kyc_document', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // No need to remove kyc_status as it belongs to the base table
    await queryInterface.removeColumn('Users', 'kyc_document');
  }
};
