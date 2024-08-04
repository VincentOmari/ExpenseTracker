const IncomeSchema = require("../models/IncomeModel");

exports.addIncome = async (req, res) => {
    const { title, amount, category, description, date } = req.body;

    // Convert amount to number if it's not already
    const amountAsNumber = parseFloat(amount);

    const income = new IncomeSchema({
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

        await income.save();
        res.status(200).json({ message: 'Income Added' });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getIncomes = async (req, res) => {
    try {
        const incomes = await IncomeSchema.find().sort({ createdAt: -1 });
        res.status(200).json(incomes);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteIncome = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await IncomeSchema.findByIdAndDelete(id);
        if (result) {
            res.status(200).json({ message: 'Income Deleted' });
        } else {
            res.status(404).json({ message: 'Income Not Found' });
        }
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server Error' });
    }
};
