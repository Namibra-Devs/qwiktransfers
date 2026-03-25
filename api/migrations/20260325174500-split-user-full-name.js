'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add new columns if they don't exist
    const tableDefinition = await queryInterface.describeTable('Users');
    
    if (!tableDefinition.first_name) {
      await queryInterface.addColumn('Users', 'first_name', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    if (!tableDefinition.middle_name) {
      await queryInterface.addColumn('Users', 'middle_name', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    if (!tableDefinition.last_name) {
      await queryInterface.addColumn('Users', 'last_name', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    // 2. Migrate data
    const [users] = await queryInterface.sequelize.query('SELECT id, "full_name" FROM "Users"');
    
    for (const user of users) {
      if (user.full_name) {
        const parts = user.full_name.trim().split(/\s+/);
        let firstName = '';
        let middleName = '';
        let lastName = '';

        if (parts.length === 1) {
          firstName = parts[0];
        } else if (parts.length === 2) {
          firstName = parts[0];
          lastName = parts[1];
        } else {
          firstName = parts[0];
          lastName = parts[parts.length - 1];
          middleName = parts.slice(1, -1).join(' ');
        }

        await queryInterface.sequelize.query(
          `UPDATE "Users" SET "first_name" = :firstName, "middle_name" = :middleName, "last_name" = :lastName WHERE id = :id`,
          {
            replacements: { firstName, middleName, lastName, id: user.id }
          }
        );
      }
    }

    // 3. Remove old column
    await queryInterface.removeColumn('Users', 'full_name');
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Add back full_name
    await queryInterface.addColumn('Users', 'full_name', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // 2. Combine names back
    const [users] = await queryInterface.sequelize.query('SELECT id, "first_name", "middle_name", "last_name" FROM "Users"');
    
    for (const user of users) {
      const parts = [user.first_name, user.middle_name, user.last_name].filter(Boolean);
      const fullName = parts.join(' ');
      
      await queryInterface.sequelize.query(
        `UPDATE "Users" SET "full_name" = :fullName WHERE id = :id`,
        {
          replacements: { fullName, id: user.id }
        }
      );
    }

    // 3. Remove new columns
    await queryInterface.removeColumn('Users', 'first_name');
    await queryInterface.removeColumn('Users', 'middle_name');
    await queryInterface.removeColumn('Users', 'last_name');
  }
};
