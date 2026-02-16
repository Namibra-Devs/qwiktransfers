'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class SystemConfig extends Model {
        static associate(models) {
            // define association here
        }
    }
    SystemConfig.init({
        key: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        value: {
            type: DataTypes.JSONB,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'SystemConfig',
    });
    return SystemConfig;
};
