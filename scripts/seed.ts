import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/personal_os',
});

async function seed() {
  // Pillar state — 6 rows (idempotent via on conflict)
  await pool.query(`
    insert into pillar_state (pillar, status, summary)
    values
      ('work',          'green',  'Active across DLS, Wellness, Personal OS Dashboard.'),
      ('physical',      'yellow', 'Workout protocol locked; pullup-stand + rower not yet assembled. Tuesday injection appointments active.'),
      ('cognitive',     'green',  'Daily reading + agentic-AI curriculum + learning pipeline.'),
      ('relationships', 'green',  'Daily marriage anchors active (morning coffee + evening together). Friend roster pending.'),
      ('hobbies',       'green',  'Reading, weekly hike, French press coffee, light gaming, essays.'),
      ('recovery',      'green',  '11 PM lights-out / 7 AM wake target. Bipolar mood-stability priority.')
    on conflict (pillar) do nothing
  `);
  console.log('  seeded: pillar_state (6 rows)');

  // Relationship roster — 4 core family (idempotent via name uniqueness check)
  await pool.query(`
    insert into relationship_roster (name, relationship_type, cadence)
    values
      ('Amy Forrest', 'spouse', 'daily'),
      ('Kyle', 'stepchild', 'monthly'),
      ('Amber', 'stepchild', 'monthly'),
      ('Calvin', 'grandchild', 'monthly')
    on conflict do nothing
  `);
  // Add unique constraint for idempotency if not exists
  await pool.query(`
    do $$ begin
      if not exists (
        select 1 from pg_constraint where conname = 'uq_roster_name'
      ) then
        alter table relationship_roster add constraint uq_roster_name unique (name);
      end if;
    end $$
  `);
  // Re-run insert with proper conflict target
  await pool.query(`
    insert into relationship_roster (name, relationship_type, cadence)
    values
      ('Amy Forrest', 'spouse', 'daily'),
      ('Kyle', 'stepchild', 'monthly'),
      ('Amber', 'stepchild', 'monthly'),
      ('Calvin', 'grandchild', 'monthly')
    on conflict (name) do nothing
  `);
  console.log('  seeded: relationship_roster (4 rows)');

  // One placeholder pending proposal (seed marker in metadata)
  await pool.query(`
    insert into proposals (title, body, project, category, metadata)
    select
      'Welcome to Personal OS',
      'This is a seed proposal to verify the dashboard renders correctly. You can approve or dismiss it.',
      'home',
      'recommendation',
      '{"seed": true}'::jsonb
    where not exists (
      select 1 from proposals where metadata @> '{"seed": true}'::jsonb
    )
  `);
  console.log('  seeded: proposals (1 placeholder)');

  console.log('Seed complete.');
  await pool.end();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
