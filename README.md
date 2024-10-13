
# Library Management System API
A RESTful API to manage a library system that handles books, borrowers, and borrowing transactions. Features include CRUD operations for books and borrowers, as well as tracking and managing book borrowings and returns.
Written in 2 days.

## Usage
### Locally
- Install dependencies
```
npm install
```
- Running the app
```
npm start
```

- Running tests (/books)
```
npm run test
```

### Using Docker Compose
Running the application with Docker Compose starts the PostgreSQL database and Node.js server.
```
docker compose up --build
```

By default the docker compose runs the app in development mode, when changing that one must take care to write [migrations](https://sequelize.org/docs/v6/other-topics/migrations/) for sequelize properly in production.



## **Documentation**

## Project Organization
```
├── models/           # Database models
├── routes/           # Route handlers for books and borrower
├── migrations/       # Sequelize migration files
├── seeders/          # Sequelize seeder files
├── middlewares.js    # Defines custom middlewars: rate limiting, error logging
├── tests/            # Test cases for API endpoints
├── config/           # Configuration files
└── app.js            # Main application file
```

## API Schema, RESTful

### Books
#### GET /books
    params -> offset,limit ,  author, title, ISBN
    no params -> list all (limit 100 by default)
Response:
```json
[
  {
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "ISBN": "978-0743273565",
    "quantity": 5,
    "shelf": "A1"
  }
]
```

#### POST /books
payload example:
```json
{
    "title" : "str",
    "author" : "str",
    "ISBN" : "str",
    "quantity" : "int",
    "shelf" : "str",
}
```

#### PUT /books

#### DELETE /books/\<ISBN>

### Borrowers
#### GET /borrower
    params -> limit, offset, email

returns:
```json
{
    "name" : "str",
    "email" : "str",
    "registeredDate" : "str"
}
```
Other CRUD operations:
#### POST /borrower
Payload example:
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "12345678"
}
```
#### PUT /borrower/\<email>
Payload example:
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "12345678"
}
```

#### DELETE /borrower/\<email>

### Borrowing
// Implemented in post requests for the future possibility of implementing auth measures or session tokens, since they're user specific.
#### POST /books/borrow
```json
{
    "email": "john@example.com",
    "ISBN": "978-0743273565",
    "dueDate": "2024-11-15"
}
```

#### POST /books/return
```json
{
    "email": "john@example.com",
    "ISBN": "978-0743273565",
}
```

#### POST /borrower/check
checks borrowed books by user
```json
{
    "email": "john@example.com",
}
```
returns:
```json
[
    {
        "name" : "str",
        "ISBN" : "str",
        "dueDate" : "str"
    }
]
```
#### GET /books/overdue
optional params -> borrowerEmail
lists all overdue books
```json
[
    {
        "name" : "str",
        "ISBN" : "str",
        "dueDate" : "str",
        "borrowerEmail" : "str"
    }
]
```

#### Error Handling
- **429 Too Many Requests**: Returned when rate limits are exceeded.
- **500 Internal Server Error**: Returned when the server encounters an error.
- **404 Not Found**: Returned when the requested resource is not found.
- **400 Bad Request**: Returned when the input data is invalid.


## DB Schema
### book:
```
    "title" : "str",
    "author" : "str",
    "ISBN" : "str",
    "quantity" : "int",
    "shelf" : "str",
```

### borrower:
```
    "name" : "str",
    "email" : "str",
    "password" : "str", # for future scalability or bonus features.
    "registeredDate" : "DATE",
```

### borrowtransaction:
```
    "borrowerEmail" : "str",
    "ISBN" : "str",
    "borrowDate" : "DATE",
    "dueDate" : "DATE",
    "returnDate" : "DATE" | NULL
```

