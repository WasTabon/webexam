const { User } = require('../models/User');
const { Book } = require('../models/Book');

const addUser = async (req, res) => {
  try {
    const { name, login, password } = req.body;
    const user = new User({ name, login, password, bookLimit: 5 });
    const newUser = await user.save();
    res.status(200).send(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add user' });
  }
};

const getBookForUser = async (req, res) => {
  try {
    const { _id } = req.params;
    const { book_id } = req.body;

    const user = await User.findById(_id);
    const book = await Book.findById(book_id);

    if (!user || !book || book.quantity.available === 0) {
      return res.status(404).json({ error: 'Invalid user or book' });
    }

    const borrowedBooksCount = user.books.filter(book => !book.dateOfReturn).length;
    if (user.bookLimit > 0 && borrowedBooksCount >= user.bookLimit) {
      return res.status(404).json({ error: 'User has reached the book limit' });
    }

    user.books.push({ book_id: book_id });
    await user.save();

    book.quantity.available -= 1;
    await book.save();

    res.status(200).send(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get book for user' });
  }
};

const returnBook = async (req, res) => {
  try {
    const { _id } = req.params;
    const { book_id, comment } = req.body;

    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const book = user.books.find(book => book.book_id === book_id);

    if (!book) {
      return res.status(404).json({ error: 'Book not found in user collection' });
    }

    book.dateOfReturn = new Date();
    book.comment = comment;

    await user.save();

    const updatedBook = await Book.findByIdAndUpdate(
      book_id,
      { $inc: { 'quantity.available': 1 } },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.status(200).send(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to return book' });
  }
};

module.exports = {
  addUser,
  getBookForUser,
  returnBook,
};