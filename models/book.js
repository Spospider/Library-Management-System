'use strict';

module.exports = (sequelize, DataTypes) => {
    const book = sequelize.define('book', {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ISBN: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,  // Ensure ISBN is unique
        primaryKey: true, // Set ISBN as the primary key
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      shelf: {
        type: DataTypes.STRING,
        allowNull: true,  // Shelf can be optional
      },
    }, {
      tableName: 'book',
      indexes: [
        {
          unique: true,  // This makes the index unique
          fields: ['ISBN'],  // Index on the ISBN field
        },
      ],
    });
  
    return book;
  };