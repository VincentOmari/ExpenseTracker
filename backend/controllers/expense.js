const ExpenseSchema = require("../models/ExpenseModel");
const Expense = require('../models/ExpenseModel'); // Ensure 'Expense' is the correct export name

exports.addExpense = async (req, res) => {
    const { title, amount, category, description, date } = req.body;

    // Convert amount to number if it's not already
    const amountAsNumber = parseFloat(amount);

    const expense = new ExpenseSchema({
        title,
        amount: amountAsNumber,
        category,
        description,
        date
    });

    try {
        // Validations
        if (!title || !category || !description || !date) {
            return res.status(400).json({ message: 'All fields are required!' });
        }
        if (isNaN(amountAsNumber) || amountAsNumber <= 0) {
            return res.status(400).json({ message: 'Amount must be a positive number!' });
        }

        await expense.save();
        res.status(200).json({ message: 'Expense Added' });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getExpenses = async (req, res) => {
    try {
        const expenses = await ExpenseSchema.find().sort({ createdAt: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteExpense = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await ExpenseSchema.findByIdAndDelete(id);
        if (result) {
            res.status(200).json({ message: 'Expense Deleted' });
        } else {
            res.status(404).json({ message: 'Expense Not Found' });
        }
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server Error' });
    }
};
