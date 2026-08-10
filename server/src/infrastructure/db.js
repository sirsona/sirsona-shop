import { Pool } from "pg";

// The pool is the default executor for every repository function. Repositories
// call executor.query(...) rather than a helper here, because pool.query and
// client.query share a signature — so one repository function works both
// standalone and enlisted in a caller's open transaction.
export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || "mctaba_user",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "mctaba_shop",
  max: 10,
});

// Direct query helper for routes that don't use repositories
export const query = (sql, params) => pool.query(sql, params);
