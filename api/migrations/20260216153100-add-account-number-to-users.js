'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Users', 'account_number', {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true,
            after: 'role'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Users', 'account_number');
    }
};
