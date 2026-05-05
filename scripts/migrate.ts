import { Pool } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/personal_os',
});

async function migrate() {
  // Create ledger table if it doesn't exist
  await pool.query(`
    create table if not exists _migrations (
      name text primary key,
      applied_at timestamptz default now()
    )
  `);

  // Get already-applied migrations
  const { rows: applied } = await pool.query('select name from _migrations order by name');
  const appliedSet = new Set(applied.map((r: { name: string }) => r.name));

  // Read migration files in order
  const migrationsDir = join(__dirname, '..', 'migrations');
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`  skip: ${file} (already applied)`);
      continue;
    }

    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    console.log(`  apply: ${file}`);
    await pool.query(sql);
    await pool.query('insert into _migrations (name) values ($1)', [file]);
    console.log(`  done: ${file}`);
  }

  console.log('Migrations complete.');
  await pool.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
