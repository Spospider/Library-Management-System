'use strict';

module.exports = (sequelize, DataTypes) => {
    const borrowtransaction = sequelize.define('borrowtransaction', {
      borrowerEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        // references: {
        //   model: 'borrower',  // Reference to Borrower model
        //   key: 'email',
        // },
      },
      ISBN: {
        type: DataTypes.STRING,
        allowNull: false,
        // references: {
        //   model: 'book',  // Reference to Book model
        //   key: 'ISBN',
        // },
      },
      borrowDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,  // Default to the current date
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      returnDate: {
        type: DataTypes.DATE,
        allowNull: true,  // Can be NULL if not yet returned
        defaultValue: null,
      },
    },
    {
      tableName: 'borrowtransaction',
    });

    return borrowtransaction;
  };