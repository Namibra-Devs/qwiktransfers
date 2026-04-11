'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AnnouncementDismissal extends Model {
    static associate(models) {
      AnnouncementDismissal.belongsTo(models.Announcement, { foreignKey: 'announcementId', as: 'announcement' });
      AnnouncementDismissal.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  AnnouncementDismissal.init({
    announcementId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'AnnouncementDismissal',
  });
  return AnnouncementDismissal;
};
