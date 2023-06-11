const { Category } = require('../models/Category');
const { Book } = require("../models/Book");

const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const category = new Category({ name });

    const newCategory = await category.save();
    res.status(201).send(newCategory);
  } catch (error) {
    res.status(400).send(error);
  }
}

const updateCategory = async (req, res) => {
  try {
    const { _id } = req.params;
    const { name } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      _id,
      { name },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).send('Category not found');
    }

    const updatedBooks = await Book.updateMany(
      { category: updatedCategory.name },
      { category: name }
    );

    res.status(200).send({ updatedCategory, updatedBooks: updatedBooks.modifiedCount });
  } catch (error) {
    res.status(500).send(error);
  }
}

module.exports = {
  addCategory,
  updateCategory
}