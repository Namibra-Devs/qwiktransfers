'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Announcement extends Model {
    static associate(models) {
      Announcement.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
      Announcement.hasMany(models.AnnouncementDismissal, { foreignKey: 'announcementId', as: 'dismissals' });
    }
  }
  Announcement.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('info', 'warning', 'success', 'urgent'),
      defaultValue: 'info'
    },
    target: {
      type: DataTypes.ENUM('all', 'vendors', 'support', 'users'),
      defaultValue: 'all'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Announcement',
  });
  return Announcement;
};
