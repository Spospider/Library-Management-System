const express = require('express');
const router = express.Router();
const models = require('../models'); 
const { Op } = require('sequelize');
const {DEFAULT_BORROW_TIME, MAX_BORROW_TIME} = require('../config/appConfig')

// ** CRUD Operations ** 
// Get all books or search for a book by title, author, or ISBN
router.get('/', async (req, res) => {
    const { title, author, ISBN, limit, offset } = req.query;
    try {
        const filter = {};
        if (title) filter.title = { [Op.iLike]: `%${title}%` }; // Case-insensitive search
        if (author) filter.author = { [Op.iLike]: `%${author}%` };
        if (ISBN) filter.ISBN = ISBN;

        query = {
            where: filter
        }
        // Add pagination
        if (limit) {
            query.limit = limit
        }
        if (offset) {
            query.offset = offset
        }

        const books = await models.book.findAll(query);
        // Check if books is empty
        if (books.length === 0) {
            return res.status(404).json({ message: 'No books found' });
        }
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books', error: error.message });
    }
});

// Add a new book
router.post('/', async (req, res) => {
    const { title, author, ISBN, quantity, shelf } = req.body;
    if (!title || !author || !ISBN || quantity == null || !shelf) {
        return res.status(400).json({ message: 'Missing required fields: title, author, ISBN, quantity, shelf' });
    }

    try {
        const bookExists = await models.book.findOne({ where: { ISBN } });
        if (bookExists) {
            return res.status(400).json({ message: 'Book already Exists.'});
        }

        if (parseInt(quantity) < 0) {
            return res.status(400).json({ message: 'Validaiton Failed: please input a valid quantity.'});
        }
        const book = await models.book.create({ title, author, ISBN, quantity, shelf });
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ message: 'Error adding book', error: error.message });
    }
});

// Update a book's details by ISBN
router.put('/:isbn', async (req, res) => {
    const { isbn } = req.params;
    const { title, author, quantity, shelf } = req.body;

    try {
        // Check for existance
        const book = await models.book.findOne({ where: { ISBN: isbn } });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Update only the provided fields
        if (title) book.title = title;
        if (author) book.author = author;
        if (quantity != null & parseInt(quantity) >= 0) book.quantity = quantity;
        if (shelf) book.shelf = shelf;

        await book.save();
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Error updating book', error: error.message });
    }
});

// Delete a book by ISBN
router.delete('/:isbn', async (req, res) => {
    const { isbn } = req.params;

    try {
        const result = await models.book.destroy({ where: { ISBN: isbn } });
        if (result === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(204).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting book', error: error.message });
    }
});


// ** Borrowing Operations **

// Borrow a book
router.post('/borrow', async (req, res) => {
    var { email, ISBN, dueDate } = req.body;
    if (!email || !ISBN) {
        return res.status(400).json({ message: 'Missing required fields: email, ISBN' });
    }

    // start transaction to keep borrow and quantity synced
    const t = await models.sequelize.transaction();
    try {
        const currentDate = new Date();
        if (dueDate) {
            // Check if the due date is more than now
            dueDate = new Date(dueDate);
            const maxDueDate = new Date(currentDate);
            maxDueDate.setDate(currentDate.getDate() + MAX_BORROW_TIME);

            if (dueDate <= currentDate) {
                return res.status(400).json({ message: 'Due date must be in the future.' });
            }
            else if (dueDate > maxDueDate) {
                return res.status(400).json({ message: 'Due date exceeds the maximum borrow period.' });
            }
        }
        else {
            // if no due date is specified, set to default bowworing period
            dueDate = new Date(currentDate);
            dueDate.setDate(currentDate.getDate() + DEFAULT_BORROW_TIME);
        }
        
        // Check if the book exists and is available for borrowing
        const book = await models.book.findOne({ where: { ISBN } });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        // Check if the book's quantity is greater than 0
        if (book.quantity < 1) {
            return res.status(400).json({ message: 'No available copies to borrow' });
        }        

        // Decrement the book quantity by 1
        book.quantity -= 1;
        await book.save({ transaction: t });

        // Create borrow Transaction
        const transaction = await models.borrowtransaction.create({ borrowerEmail : email, 
                                                     ISBN : ISBN,
                                                     dueDate : dueDate }, { transaction: t },);
        await t.commit();
                                                     
        res.status(201).json({message: 'Book borrowed successfully'});
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Error borrowing book', error: error.message });
    }
});

// Return a book
router.post('/return', async (req, res) => {
    const { email, ISBN } = req.body;
    if (!email || !ISBN) {
        return res.status(400).json({ message: 'Missing required fields: email, ISBN' });
    }

    // start transaction to keep borrow and quantity synced
    const t = await models.sequelize.transaction();
    try {
        // Increment the book quantity by 1
        const book = await models.book.findOne({ where: { ISBN } });
        book.quantity += 1;
        await book.save({ transaction: t });

        // Find transaction with oldest borrow date for this person with that book
        const transaction = await models.borrowtransaction.findOne({ where: { ISBN:ISBN, borrowerEmail:email, returnDate:null },
                                                              order: [['borrowDate', 'ASC']],}, { transaction: t },);
        // Finalize borrow transaction (Set return date)
        transaction.returnDate = new Date();
        await transaction.save({ transaction: t });

        await t.commit();
                                                     
        res.status(201).json({message: 'Book returned successful'});
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Error returning book', error: error.message });
    }
});

// Return a book
router.get('/overdue', async (req, res) => {
    const { email, ISBN, limit, offset } = req.body;
    try {
        var filter = {
            dueDate: {
                [Op.lt]: new Date(), // Check if dueDate is less than the current date
            }
        }
        if (email) {
            filter.borrowerEmail = email;
        }
        if (ISBN) {
            filter.ISBN = ISBN;
        }

        query = {
            where: filter
        }
        // Add pagination
        if (limit) {
            query.limit = limit
        }
        if (offset) {
            query.offset = offset
        }
        
        const overdue = await models.borrowtransaction.findAll(query);
                                                     
        res.status(200).json(overdue);
    } catch (error) {
        res.status(500).json({ message: 'Error checking overdue books.', error: error.message });
    }
});


module.exports = router;