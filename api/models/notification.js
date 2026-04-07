'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Notification extends Model {
        static associate(models) {
            Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }
    Notification.init({
        userId: DataTypes.INTEGER,
        type: DataTypes.STRING,
        message: DataTypes.TEXT,
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        link: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Notification',
    });
    return Notification;
};
