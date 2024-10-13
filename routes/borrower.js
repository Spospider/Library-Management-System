const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const models = require('../models'); 

// ** CRUD Operations ** 
// Get borrower
router.get('/', async (req, res) => {
    const { email, limit, offset } = req.query;
    try {
        const filter = {};
        if (email) filter.email = email;

        query = {
            attributes: ['name', 'email', 'registeredDate'],
            where: filter
        }
        // Add pagination
        if (limit) {
            query.limit = limit
        }
        if (offset) {
            query.offset = offset
        }

        const borrowers = await models.borrower.findAll(query);
        // Check if result is empty
        if (borrowers.length === 0) {
            return res.status(404).json({ message: 'No borrowers found.' });
        }
        res.json(borrowers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching borrowers.', error: error.message });
    }
});

// Add a new borrower user
router.post('/', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Missing required fields: name, email, password' });
    }

    try {
        const userExists = await models.borrower.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already Exists.'});
        }
        if (password.length < 8) { // add more validation conditions as needed
            return res.status(400).json({ message: 'Validaiton Failed: Password must be longer than 7 chars.'});
        }
        if (!email.includes('@') || !email.includes('.')) {
            return res.status(400).json({ message: 'Validaiton Failed: Please enter a valid email address.'});
        }
        const borrower = await models.borrower.create({ name, email, password });
        res.status(201).json({message : 'Borrower user created successfully.'});
    } catch (error) {
        res.status(500).json({ message: 'Error creating Borrower user.', error: error.message });
    }
});

// Update a borrower's details
router.put('/:email', async (req, res) => {
    const { email } = req.params;
    const { name, password } = req.body;

    try {
        // Check for existance
        const borrower = await models.borrower.findOne({ where: { email } });
        if (!borrower) {
            return res.status(404).json({ message: 'Borrower not found.' });
        }

        // Update only the provided fields
        if (name) models.borrower.name = name;
        if (password) models.borrower.password = password;

        await models.borrower.save();
        res.json({ message: 'Borrower updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating models.borrower.', error: error.message });
    }
});

// Delete a borrower account
router.delete('/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const result = await models.borrower.destroy({ where: { email } });
        if (result === 0) {
            return res.status(404).json({ message: 'Borrower not found' });
        }

        res.status(204).json({ message: 'Borrower user deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting Borrower user.', error: error.message });
    }
});


// ** Borrowing Operations **
// Check books borrowed by user
router.post('/check', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Missing required fields: email' });
    }

    // start transaction to keep borrow and quantity synced
    try {
        // Check if the book exists and is available for borrowing
        const borrowed = await models.borrowtransaction.findAll({ 
            attributes: ["ISBN", "borrowDate", "dueDate"],  // Attributes from BorrowTransaction
            where: { borrowerEmail: email, returnDate: null },
            include: [
                {
                    model: models.book, // Include the Book model
                    attributes: ['title'], // Fetch only the 'name' attribute from the Book model
                    required: true // Ensures it performs an INNER JOIN
                }
            ]
        });

        if (!borrowed) {
            return res.status(404).json({ message: 'No borrowed books found.' });
        }
        res.status(200).json(borrowed);
        
    } catch (error) {
        res.status(500).json({ message: 'Error checking borrowed books', error: error.message });
    }
});


module.exports = router;