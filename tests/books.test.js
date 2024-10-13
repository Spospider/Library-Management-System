// book.test.js
const request = require('supertest');
const { app, startServer } = require('../app'); // Import the app and startServer function
const models = require('../models'); // Import your models
let server;

beforeAll(async () => {
  server = await startServer(); // Start the server before tests
});

afterAll(async () => {
  await server.close(); // Close the server
  await models.sequelize.close(); // Close Sequelize connection
});

describe('Books API', () => {
  let bookISBN;

  // Test for POST /books
  describe('POST /books', () => {
    it('should add a new book and return 201 status', async () => {
      const newBook = {
        title: 'Test Book',
        author: 'John Doe',
        ISBN: '1234567890',
        quantity: 10,
        shelf: 'A1',
      };

      const response = await request(app)
        .post('/books')
        .send(newBook);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining(newBook)
      );

      bookISBN = response.body.ISBN; // Store ISBN for later use
    });
  });

  // Test for GET /books
  describe('GET /books', () => {
    it('should return all books with a 200 status', async () => {
      const response = await request(app).get('/books');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeLessThanOrEqual(100); // Default limit
    });

    it('should return filtered books by author', async () => {
      const response = await request(app).get('/books?author=John%20Doe');
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      response.body.forEach(book => {
        expect(book.author).toBe('John Doe');
      });
    });

    it('should return a book by ISBN', async () => {
      const response = await request(app).get(`/books?ISBN=${bookISBN}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0].ISBN).toBe(bookISBN);
    });
  });

  // Test for DELETE /books
  describe('DELETE /books', () => {
    it('should delete a book and return 204 status', async () => {
      const response = await request(app).delete(`/books/${bookISBN}`);

      expect(response.status).toBe(204); // No Content
    });

    it('should return 404 for deleted book', async () => {
      const response = await request(app).get(`/books/${bookISBN}`);

      expect(response.status).toBe(404); // Not Found
    });
  });

  // Additional tests for invalid input
  describe('POST /books with invalid data', () => {
    it('should return 400 for invalid book entry', async () => {
      const invalidBook = {
        title: 'Invalid Book',
        author: 'Jane Doe',
        ISBN: 'invalid_isbn', // Invalid ISBN format
        quantity: -5, // Invalid quantity
        shelf: 'A1',
      };

      const response = await request(app)
        .post('/books')
        .send(invalidBook);

      expect(response.status).toBe(400); // Bad Request
      expect(response.body.message).toBe('Validaiton Failed: please input a valid quantity.');
    });
  });
});