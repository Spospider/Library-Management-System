'use strict';

module.exports = (sequelize, DataTypes) => {
  const borrower = sequelize.define( 'borrower', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,  // Ensure email is unique
      primaryKey: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,  // Optional for now, for future features
    },
    registeredDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,  // Default to the current date
    },
  }, {
    indexes: [
      {
        unique: true,  
        fields: ['email'],  // Index on the email field, to optimize queries for read operations
      },
    ],
  },
  {
    tableName: 'borrower',
  });

  return borrower;
};