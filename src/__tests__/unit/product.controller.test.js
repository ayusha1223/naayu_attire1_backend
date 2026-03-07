import { jest } from "@jest/globals";

/* ---------------- MOCK MODEL ---------------- */

const mockCreate = jest.fn();
const mockFindByIdAndDelete = jest.fn();
const mockFindById = jest.fn();
const mockFind = jest.fn();
const mockSave = jest.fn();

jest.unstable_mockModule("../../models/product.model.js", () => ({
  default: {
    create: mockCreate,
    findByIdAndDelete: mockFindByIdAndDelete,
    findById: mockFindById,
    find: mockFind,
  },
}));

/* ----------------  CONTROLLER ---------------- */

const {
  createProduct,
  deleteProduct,
  updateProduct,
  getProducts,
} = await import("../../controllers/product.controller.js");

/* ---------------- TEST SUITE ---------------- */

describe("Product Controller Unit Tests", () => {

  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      protocol: "http",
      get: jest.fn().mockReturnValue("localhost:5000"),
      file: { filename: "test.jpg" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  /* ================= CREATE PRODUCT ================= */

  it("should create product successfully", async () => {

    req.body = {
      name: "Shirt",
      price: 1000,
      description: "Nice shirt",
      rating: 5,
      color: "red",
      category: "men",
    };

    const product = { id: "p1", name: "Shirt" };

    mockCreate.mockResolvedValue(product);

    await createProduct(req, res);

    expect(mockCreate).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: product,
    });

  });

  /* ================= DELETE PRODUCT ================= */

  it("should delete product successfully", async () => {

    req.params.id = "p1";

    mockFindByIdAndDelete.mockResolvedValue({});

    await deleteProduct(req, res);

    expect(mockFindByIdAndDelete).toHaveBeenCalledWith("p1");

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Product deleted",
    });

  });

  /* ================= UPDATE PRODUCT ================= */

  it("should update product successfully", async () => {

    req.params.id = "p1";

    req.body = {
      name: "Updated Shirt",
      price: 1200,
      description: "Updated desc",
      category: "men",
      color: "blue",
    };

    const product = {
      name: "",
      price: 0,
      description: "",
      category: "",
      color: "",
      oldPrice: null,
      save: mockSave,
    };

    mockFindById.mockResolvedValue(product);

    await updateProduct(req, res);

    expect(mockSave).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);

  });

  it("should return 404 if product not found", async () => {

    req.params.id = "p1";

    mockFindById.mockResolvedValue(null);

    await updateProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      message: "Product not found",
    });

  });

  /* ================= GET PRODUCTS ================= */

  it("should return product list", async () => {

    const products = [
      { name: "Shirt" },
      { name: "Pants" },
    ];

    mockFind.mockReturnValue({
      sort: jest.fn().mockResolvedValue(products),
    });

    await getProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      total: 2,
      data: products,
    });

  });

});