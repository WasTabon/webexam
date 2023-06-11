const { Book } = require('../models/Book');

const addBook = async (req, res) => {
  const { title, category, description: { short, full }, countOfPages, quantity } = req.body;

  const errorMessages = [];
  if (short.length > 256) {
    errorMessages.push("Short description is too long");
  }
  if (countOfPages < 0 || quantity < 0) {
    errorMessages.push("Cannot have negative values for count of pages or quantity");
  }

  if (errorMessages.length > 0) {
    return res.status(400).json({ error: errorMessages });
  }

  try {
    const book = new Book({
      title,
      category,
      description: { short, full },
      countOfPages,
      quantity: {
        available: quantity
      }
    });

    const newBook = await book.save();
    res.status(201).send(newBook);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getBook = async (req, res) => {
  const { _id } = req.params;

  try {
    const book = await Book.findById(_id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.status(200).send(book);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getBookByFilter = async (req, res) => {
  const { categories, title, search, isAvailable } = req.query;

  const filters = {};

  if (categories) {
    const categoryArray = categories.split(',').map((category) => new RegExp(category, 'i'));
    filters.category = { $in: categoryArray };
  }

  if (title) {
    filters.title = { $regex: title, $options: 'i' };
  }

  if (search) {
    filters.$or = [
      { title: { $regex: search, $options: 'i' } },
      { 'description.short': { $regex: search, $options: 'i' } },
      { 'description.full': { $regex: search, $options: 'i' } },
    ];
  }

  try {
    const books = await Book.find(filters);
    res.status(200).send(books);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  addBook,
  getBook,
  getBookByFilter,
};