'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('Users', {
      fields: ['phone'],
      type: 'unique',
      name: 'Users_phone_unique_constraint'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Users', 'Users_phone_unique_constraint');
  }
};
