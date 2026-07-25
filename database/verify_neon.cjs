const { Client } = require('D:/DEVANG SIH/internal_sih_2026-main/backend/node_modules/pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_KwdEyvOSn6s0@ep-noisy-art-az88msje-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();

  console.log('\n=== ADMINS TABLE IN NEON DB ===');
  const admins = await client.query(
    'SELECT id, name, email, role, is_active, last_login, created_at FROM admins'
  );
  admins.rows.forEach(r => console.log(JSON.stringify(r, null, 2)));

  console.log('\n=== SETTINGS TABLE IN NEON DB ===');
  const settings = await client.query(
    'SELECT id, registration_open, registration_deadline, site_title, maintenance_mode FROM settings'
  );
  settings.rows.forEach(r => console.log(JSON.stringify(r, null, 2)));

  console.log('\n=== ALL TABLE ROW COUNTS ===');
  const tables = ['admins', 'teams', 'participants', 'mentors', 'otps', 'settings', 'activity_logs'];
  for (const t of tables) {
    const cnt = await client.query(`SELECT COUNT(*) FROM ${t}`);
    console.log(`  ${t}: ${cnt.rows[0].count} rows`);
  }

  await client.end();
}

run().catch(console.error);
