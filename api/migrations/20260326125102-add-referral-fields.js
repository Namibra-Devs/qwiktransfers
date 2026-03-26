'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add referral fields to Users
    await queryInterface.addColumn('Users', 'referral_code', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'referred_by_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    });

    // 2. Create Referrals table
    await queryInterface.createTable('Referrals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      referrer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      referred_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'pending' // pending, completed, paid
      },
      reward_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      reward_currency: {
        type: Sequelize.STRING,
        defaultValue: 'GHS'
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

    // 3. Add Index for performance
    await queryInterface.addIndex('Users', ['referral_code']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Referrals');
    await queryInterface.removeColumn('Users', 'referred_by_id');
    await queryInterface.removeColumn('Users', 'referral_code');
  }
};
