const booksControllers = require('./books.controllers');
const { Book } = require('../models/Book');

jest.mock('../models/Book', () => ({
  Book: jest.fn().mockImplementation(() => ({
    save: jest.fn(),
    findById: jest.fn(),
  })),
}));

describe('Book', () => {
  let bookMockInstance;

  beforeEach(() => {
    bookMockInstance = new Book();
  });

  it('addBook should return status code 400 when short description is too long', async () => {
    const req = {
      body: {
        title: 'book-title',
        category: 'book-category',
        description: {
          short: 'book-short'.repeat(257),
          full: 'book-full',
        },
        countOfPages: 100,
        quantity: 5,
      },
    };
    const res = {
      status: jest.fn().mockImplementation(() => res),
      send: jest.fn(),
      json: jest.fn(),
    };

    bookMockInstance.save.mockRejectedValueOnce(new Error());

    await booksControllers.addBook(req, res);

    expect(res.status).toBeCalledTimes(3);
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledTimes(3);
    expect(res.send).toBeCalledWith({ error: 'Short description is too long' });
  });

  it('addBook should return status code 400 when count of pages or quantity is negative', async () => {
    const req = {
      body: {
        title: 'book-title',
        category: 'book-category',
        description: {
          short: 'book-short',
          full: 'book-full',
        },
        countOfPages: -100,
        quantity: -5,
      },
    };
    const res = {
      status: jest.fn().mockImplementation(() => res),
      send: jest.fn(),
    };

    bookMockInstance.save.mockRejectedValueOnce(new Error());

    await booksControllers.addBook(req, res);

    expect(res.status).toBeCalledTimes(4);
    expect(res.status).toBeCalledWith(400);
    expect(res.send).toBeCalledTimes(4);
    expect(res.send).toBeCalledWith({ error: 'Cannot have negative values for count of pages or quantity' });
  });

  it('addBook should return status code 201 when insert in db was successful', async () => {
    const req = {
      body: {
        title: 'book-title',
        category: 'book-category',
        description: {
          short: 'book-short',
          full: 'book-full',
        },
        countOfPages: 'book-count',
        quantity: 'book-quantity',
      },
    };
    const res = {
      status: jest.fn().mockImplementation(() => res),
      send: jest.fn(),
    };

    bookMockInstance.save.mockResolvedValueOnce({});

    await booksControllers.addBook(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(201);
  });

  it('getBook should return status code 200 and get book', async () => {
    const req = { params: { _id: 'book-id' } };
    const res = {
      status: jest.fn().mockImplementation(() => res),
      send: jest.fn(),
    };

    bookMockInstance.findById.mockResolvedValueOnce({});

    await booksControllers.getBook(req, res);

    expect(res.status).toBeCalledTimes(2);
    expect(res.status).toBeCalledWith(200);
  });
});