'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class RateAlert extends Model {
        static associate(models) {
            RateAlert.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }
    RateAlert.init({
        userId: DataTypes.INTEGER,
        targetRate: DataTypes.DECIMAL,
        direction: DataTypes.STRING,
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'RateAlert',
    });
    return RateAlert;
};
