import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getData,
  createItem,
  updateItem,
  deleteItem,
  withTransaction,
  pool,
  sql,
} from "./Actions";

// Mock the pool
vi.mock("@neondatabase/serverless", () => {
  const mClient = {
    query: vi.fn(),
    release: vi.fn(),
  };
  const mPool = {
    connect: vi.fn(() => Promise.resolve(mClient)),
    query: vi.fn(),
    end: vi.fn(),
  };
  return {
    Pool: vi.fn(function () {
      return mPool;
    }),
  };
});

describe("Actions", () => {
  let clientMock: any;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
    clientMock = await pool.connect();
  });

  describe("getData", () => {
    it("should fetch data successfully", async () => {
      const mockData = [{ id: 1, name: "Test" }];
      clientMock.query.mockResolvedValueOnce({ rows: mockData });

      const result = await getData("SELECT * FROM test");
      expect(result).toEqual(mockData);
      expect(clientMock.query).toHaveBeenCalledWith("SELECT * FROM test", []);
    });

    it("should handle errors", async () => {
      clientMock.query.mockRejectedValueOnce(new Error("DB Error"));
      await expect(getData("SELECT * FROM test")).rejects.toThrow(
        "Failed to fetch data"
      );
    });

    it("should support sql tag", async () => {
      const mockData = [{ id: 1 }];
      clientMock.query.mockResolvedValueOnce({ rows: mockData });

      const id = 1;
      const result = await getData(sql`SELECT * FROM test WHERE id = ${id}`);

      expect(result).toEqual(mockData);
      expect(clientMock.query).toHaveBeenCalledWith(
        "SELECT * FROM test WHERE id = $1",
        [1]
      );
    });
  });

  describe("createItem", () => {
    it("should create an item successfully", async () => {
      const newItem = { id: 1, name: "New Item" };
      clientMock.query.mockResolvedValueOnce({ rows: [newItem] });

      const result = await createItem("items", { name: "New Item" });
      expect(result).toEqual(newItem);
      // Check if query was constructed correctly
      expect(clientMock.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO items"),
        ["New Item"]
      );
    });
  });

  describe("updateItem", () => {
    it("should update an item successfully", async () => {
      const updatedItem = { id: 1, name: "Updated" };
      clientMock.query.mockResolvedValueOnce({ rows: [updatedItem] });

      const result = await updateItem("items", 1, { name: "Updated" });
      expect(result).toEqual(updatedItem);
      expect(clientMock.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE items"),
        [1, "Updated"]
      );
    });
  });

  describe("deleteItem", () => {
    it("should delete an item successfully", async () => {
      clientMock.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await deleteItem("items", 1);
      expect(result).toBe(true);
      expect(clientMock.query).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM items"),
        [1]
      );
    });
  });

  describe("withTransaction", () => {
    it("should commit transaction on success", async () => {
      const callback = vi.fn().mockResolvedValue("success");

      await withTransaction(callback);

      expect(clientMock.query).toHaveBeenCalledWith("BEGIN");
      expect(callback).toHaveBeenCalled();
      expect(clientMock.query).toHaveBeenCalledWith("COMMIT");
    });

    it("should rollback transaction on error", async () => {
      const callback = vi.fn().mockRejectedValue(new Error("Fail"));

      await expect(withTransaction(callback)).rejects.toThrow("Fail");

      expect(clientMock.query).toHaveBeenCalledWith("BEGIN");
      expect(clientMock.query).toHaveBeenCalledWith("ROLLBACK");
    });
  });
});
