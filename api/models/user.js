'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Transaction, { foreignKey: 'userId', as: 'transactions' });
      User.hasMany(models.Transaction, { foreignKey: 'vendorId', as: 'handledTransactions' });

      // Referral Associations
      User.belongsTo(models.User, { as: 'referrer', foreignKey: 'referred_by_id' });
      User.hasMany(models.User, { as: 'referredUsers', foreignKey: 'referred_by_id' });
      User.hasMany(models.Referral, { as: 'referralsMade', foreignKey: 'referrer_id' });
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    kyc_status: DataTypes.STRING, // 'pending', 'verified', 'rejected'
    kyc_document: DataTypes.STRING,
    kyc_document_type: DataTypes.STRING,
    kyc_document_id: DataTypes.STRING,
    kyc_front_url: DataTypes.STRING,
    kyc_back_url: DataTypes.STRING,
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    middle_name: DataTypes.STRING,
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    full_name: {
      type: DataTypes.VIRTUAL,
      get() {
        return [this.first_name, this.middle_name, this.last_name].filter(Boolean).join(' ');
      }
    },
    phone: {
      type: DataTypes.STRING,
      unique: true
    },
    profile_picture: DataTypes.STRING,
    country: DataTypes.STRING,
    transaction_pin: DataTypes.STRING, // 4-digit PIN (hashed)
    balance_ghs: DataTypes.DECIMAL,
    balance_cad: DataTypes.DECIMAL,
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verification_token: DataTypes.STRING,
    verification_token_expires: DataTypes.DATE,
    reset_password_token: DataTypes.STRING,
    reset_password_expires: DataTypes.DATE,
    account_number: {
      type: DataTypes.STRING,
      unique: true
    },
    is_online: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    expo_push_token: DataTypes.STRING,
    referral_code: {
      type: DataTypes.STRING,
      unique: true
    },
    referred_by_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    deletion_requested_at: DataTypes.DATE,
    deletion_reason: DataTypes.TEXT,
    deactivation_reason: DataTypes.TEXT,
    two_factor_secret: DataTypes.STRING,
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sub_role: {
      type: DataTypes.STRING,
      defaultValue: 'super'
    }
  }, {
    sequelize,
    modelName: 'User',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

  return User;
};