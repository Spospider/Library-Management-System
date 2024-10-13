const express = require('express');
const app = express();

const bookRoutes = require('./routes/books');
const borrowerRoutes = require('./routes/borrower');
const exportsRoutes = require('./routes/exports');
const models = require('./models'); // Import your models, which include the sequelize instance

const {errorLogger, apiLimiter} = require('./middlewares');

app.use(express.json());

// Apply rate limiting routes
app.use('/books', apiLimiter);
app.use('/borrower', apiLimiter);
app.use('/exports', apiLimiter);

// Define routes
app.use('/books', bookRoutes);
app.use('/borrower', borrowerRoutes);
app.use('/exports', exportsRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Universal error logging
app.use(errorLogger);

async function startServer() {
    try {
      await models.sequelize.sync(); // Synchronize models with DB
      console.log('All models were synchronized successfully.');
  
      const server = app.listen(3000, () => {
        console.log('Server is running on port 3000');
      });
      return server; 
    } catch (error) {
      console.error('Unable to synchronize the database:', error);
      throw error;
    }
  }

// Export for tests
module.exports = { app, startServer };

if (require.main === module) {
    startServer();
}
  
