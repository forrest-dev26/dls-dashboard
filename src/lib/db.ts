import { Pool } from 'pg';

let _pool: Pool | null = null;

export function db(): Pool {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/personal_os',
      max: 10,
    });
  }
  return _pool;
}

export async function q<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const r = await db().query(text, params);
  return r.rows as T[];
}
