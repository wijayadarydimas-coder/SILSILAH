import pg from 'pg';

const { Pool } = pg;

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: pg.Pool | undefined;
}

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

const poolConfig: pg.PoolConfig = databaseUrl
  ? {
      connectionString: databaseUrl,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE || 'silsilah_db',
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

export const pool = globalThis.__pgPool ?? new Pool(poolConfig);

if (!isProduction) {
  globalThis.__pgPool = pool;
}

/**
 * Executes a parameterized SQL query with strict parameter binding to prevent SQL Injection
 */
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  return res;
}
