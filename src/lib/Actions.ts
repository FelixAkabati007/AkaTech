import { Pool, PoolClient, QueryResult } from "@neondatabase/serverless";

// 4. Environment configuration
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// 1. Set up the database connection
const pool = new Pool({
  connectionString,
  ssl: true, // Neon requires SSL
  max: 20, // Connection pooling configuration
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Helper type for SQL query result
export interface SqlResult<T = any> {
  rows: T[];
  rowCount: number | null;
}

// Tagged template literal helper for safe query construction
export function sql(
  strings: TemplateStringsArray,
  ...values: any[]
): { text: string; values: any[] } {
  const text = strings.reduce((prev, curr, i) => prev + "$" + i + curr);
  return { text, values };
}

/**
 * 2. Implement the getData function
 * Fetches data from the database using a SQL query.
 * @param queryOrText The SQL query string or result from sql tag
 * @param params Optional parameters for the query (if query is string)
 * @returns Array of fetched data
 */
export async function getData<T = any>(
  queryOrText: string | { text: string; values: any[] },
  params: any[] = []
): Promise<T[]> {
  const queryText =
    typeof queryOrText === "string" ? queryOrText : queryOrText.text;
  const queryParams =
    typeof queryOrText === "string" ? params : queryOrText.values;

  const client = await pool.connect();
  try {
    const result: QueryResult<T> = await client.query(queryText, queryParams);
    return result.rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error(`Failed to fetch data: ${(error as Error).message}`);
  } finally {
    client.release();
  }
}

// 3. Add additional CRUD operations

/**
 * Generic create function
 * @param table Table name
 * @param data Object containing data to insert
 */
export async function createItem<T = any>(
  table: string,
  data: Record<string, any>
): Promise<T> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const columns = keys.join(", ");

  const queryText = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;

  const client = await pool.connect();
  try {
    const result = await client.query(queryText, values);
    return result.rows[0];
  } catch (error) {
    console.error(`Error creating item in ${table}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Generic update function
 * @param table Table name
 * @param id Item ID
 * @param data Data to update
 */
export async function updateItem<T = any>(
  table: string,
  id: string | number,
  data: Record<string, any>
): Promise<T | null> {
  const keys = Object.keys(data);
  const values = Object.values(data);

  if (keys.length === 0) return null;

  const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(", ");
  const queryText = `UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`;

  const client = await pool.connect();
  try {
    const result = await client.query(queryText, [id, ...values]);
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Error updating item in ${table}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Generic delete function
 * @param table Table name
 * @param id Item ID
 */
export async function deleteItem(
  table: string,
  id: string | number
): Promise<boolean> {
  const queryText = `DELETE FROM ${table} WHERE id = $1`;

  const client = await pool.connect();
  try {
    const result = await client.query(queryText, [id]);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error(`Error deleting item from ${table}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Transaction support helper
 * @param callback Function to execute within a transaction
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Export pool for advanced usage
export { pool };
