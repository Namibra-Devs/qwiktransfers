'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AnnouncementDismissals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      announcementId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Announcements',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // Add unique index to prevent duplicate dismissals
    await queryInterface.addIndex('AnnouncementDismissals', ['announcementId', 'userId'], {
      unique: true,
      name: 'announcement_user_dismissal_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AnnouncementDismissals');
  }
};
