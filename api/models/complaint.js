'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Complaint extends Model {
    static associate(models) {
      Complaint.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Complaint.belongsTo(models.Transaction, { foreignKey: 'transaction_id', as: 'transaction' });
    }
  }
  Complaint.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('open', 'resolved', 'closed'),
      defaultValue: 'open'
    },
    attachment_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    admin_response: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Complaint',
  });
  return Complaint;
};