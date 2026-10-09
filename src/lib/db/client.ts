import pg from 'pg';

const { Pool } = pg;

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: pg.Pool | undefined;
}

const poolConfig: pg.PoolConfig = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'silsilah_db',
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

export const pool = globalThis.__pgPool ?? new Pool(poolConfig);

if (process.env.NODE_ENV !== 'production') {
  globalThis.__pgPool = pool;
}

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
}
