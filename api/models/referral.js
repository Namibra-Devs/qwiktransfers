'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Referral extends Model {
        static associate(models) {
            Referral.belongsTo(models.User, { as: 'referrer', foreignKey: 'referrer_id' });
            Referral.belongsTo(models.User, { as: 'referredUser', foreignKey: 'referred_user_id' });
        }
    }
    Referral.init({
        referrer_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        referred_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending' // pending, completed, paid
        },
        reward_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        reward_currency: {
            type: DataTypes.STRING,
            defaultValue: 'GHS'
        }
    }, {
        sequelize,
        modelName: 'Referral',
    });
    return Referral;
};
