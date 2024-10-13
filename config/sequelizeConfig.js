const dotenv = require('dotenv');

// Load the correct .env file based on the NODE_ENV value
if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: '.env.production' });
  } else {
    dotenv.config({ path: '.env.development' });
  }

  
module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'mydatabase',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: (msg) => console.log(msg),
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME_TEST || 'mydatabase',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: (msg) => console.log(msg),
  },
  production: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'mydatabase',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: (msg) => console.log(msg),
  }
};