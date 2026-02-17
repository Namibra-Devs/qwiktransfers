'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Transactions', 'rate_locked_until', {
            type: Sequelize.DATE,
            allowNull: true
        });
        await queryInterface.addColumn('Transactions', 'locked_rate', {
            type: Sequelize.DECIMAL,
            allowNull: true
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Transactions', 'rate_locked_until');
        await queryInterface.removeColumn('Transactions', 'locked_rate');
    }
};
