'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'kyc_document_type', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'kyc_document_id', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'kyc_front_url', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'kyc_back_url', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'kyc_document_type');
    await queryInterface.removeColumn('Users', 'kyc_document_id');
    await queryInterface.removeColumn('Users', 'kyc_front_url');
    await queryInterface.removeColumn('Users', 'kyc_back_url');
  }
};
