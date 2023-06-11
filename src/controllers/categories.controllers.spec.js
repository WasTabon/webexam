const { Category } = require("../models/Category");

const createCategory = (name) => {
  const category = new Category({ name });
  return category.save();
};

const findCategoryById = (id) => {
  return Category.findById(id);
};

const updateCategoryName = (id, name) => {
  return Category.findByIdAndUpdate(id, { name }, { new: true });
};

module.exports = {
  createCategory,
  findCategoryById,
  updateCategoryName,
};
const {
  createCategory,
  findCategoryById,
  updateCategoryName,
} = require("./categories.controllers");

const CategoryMock = {
  save: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

jest.mock("../models/Category", () => ({
  Category: jest.fn().mockImplementation(() => CategoryMock),
}));

describe("Category", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createCategory", () => {
    it("should return status code 400 when insert in db fails", async () => {
      const req = { body: { name: "name-1" } };
      const res = {
        status: jest.fn().mockImplementation(() => res),
        send: jest.fn(),
      };

      CategoryMock.save.mockRejectedValue(new Error());

      await createCategory(req.body.name).catch(() => {
        res.status(400).send();
      });

      expect(res.status).toBeCalledTimes(1);
      expect(res.status).toBeCalledWith(400);
    });

    it("should return status code 201 when insert in db succeeds", async () => {
      const req = { body: { name: "name-1" } };
      const res = {
        status: jest.fn().mockImplementation(() => res),
        send: jest.fn(),
      };

      CategoryMock.save.mockResolvedValue({});

      await createCategory(req.body.name).then(() => {
        res.status(201).send();
      });

      expect(res.status).toBeCalledTimes(1);
      expect(res.status).toBeCalledWith(201);
    });
  });

  describe("updateCategoryName", () => {
    it("should return status code 404 when category not found", async () => {
      const req = { params: { _id: "category-id" }, body: { name: "updated-name" } };
      const res = {
        status: jest.fn().mockImplementation(() => res),
        send: jest.fn(),
      };

      CategoryMock.findByIdAndUpdate.mockRejectedValue(new Error());

      await updateCategoryName(req.params._id, req.body.name).catch(() => {
        res.status(404).send();
      });

      expect(res.status).toBeCalledTimes(1);
      expect(res.status).toBeCalledWith(404);
    });

    it("should return status code 200 and update category", async () => {
      const req = { params: { _id: "category-id" }, body: { name: "updated-name" } };
      const res = {
        status: jest.fn().mockImplementation(() => res),
        send: jest.fn(),
      };

      CategoryMock.findByIdAndUpdate.mockResolvedValue({});

      await updateCategoryName(req.params._id, req.body.name).then(() => {
        res.status(200).send();
      });

      expect(res.status).toBeCalledTimes(1);
      expect(res.status).toBeCalledWith(200);
    });
  });
});
