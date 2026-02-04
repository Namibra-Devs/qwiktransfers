'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING
      },
      amount_sent: {
        type: Sequelize.DECIMAL
      },
      exchange_rate: {
        type: Sequelize.DECIMAL
      },
      amount_received: {
        type: Sequelize.DECIMAL
      },
      recipient_details: {
        type: Sequelize.JSONB
      },
      status: {
        type: Sequelize.STRING
      },
      proof_url: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  }
};