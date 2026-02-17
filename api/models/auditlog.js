'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class AuditLog extends Model {
        static associate(models) {
            AuditLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }
    AuditLog.init({
        userId: DataTypes.INTEGER,
        action: {
            type: DataTypes.STRING,
            allowNull: false
        },
        details: DataTypes.TEXT,
        ipAddress: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'AuditLog',
    });
    return AuditLog;
};
