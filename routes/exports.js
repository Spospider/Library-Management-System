const express = require('express');
const router = express.Router();
const models = require('../models'); // Assuming your models are in this directory
const { Op } = require('sequelize');

// Utility function to calculate the date range for the last month
const getLastMonthDateRange = () => {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - 30);  // Subtract 30 days from the current date
    return { startDate, endDate: now };
};


// ** Export all overdue borrows from the last month **
router.get('/overdue-last-month', async (req, res) => {
    try {
        const { startDate, endDate } = getLastMonthDateRange();
        const overdueBorrows = await models.borrowtransaction.findAll({
            where: {
                returnDate: null, // Book hasn't been returned
                dueDate: {
                    [Op.lt]: new Date(), // Past due date (overdue)
                },
                borrowDate: {
                    [Op.between]: [startDate, endDate], // Borrowed in the last month
                }
            },
            include: [models.book, models.borrower], 
        });

        if (overdueBorrows.length === 0) {
            return res.status(404).json({ message: 'No overdue borrows found for the last 30 days.' });
        }

        res.status(200).json(overdueBorrows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching overdue borrows', error: error.message });
    }
});

// ** Export all borrowing processes of the last month **
router.get('/borrowings-last-month', async (req, res) => {
    try {
        const { startDate, endDate } = getLastMonthDateRange();
        const borrowingTransactions = await models.borrowtransaction.findAll({
            where: {
                borrowDate: {
                    [Op.between]: [startDate, endDate], // Borrowed in the last month
                }
            },
            include: [models.book, models.borrower],
        });

        if (borrowingTransactions.length === 0) {
            return res.status(404).json({ message: 'No borrowing transactions found for the last 30 days.' });
        }
        res.status(200).json(borrowingTransactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching borrowing transactions', error: error.message });
    }
});

module.exports = router;