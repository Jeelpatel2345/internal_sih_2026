const { Client } = require('D:/DEVANG SIH/internal_sih_2026-main/backend/node_modules/pg');
const bcrypt = require('D:/DEVANG SIH/internal_sih_2026-main/backend/node_modules/bcryptjs');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_KwdEyvOSn6s0@ep-noisy-art-az88msje-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();
  const res = await client.query('SELECT * FROM admins WHERE email = $1', ['admin@sih2026.ac.in']);
  const admin = res.rows[0];
  console.log('ADMIN ROW ID:', admin.id);
  console.log('ADMIN EMAIL:', admin.email);
  console.log('PASSWORD HASH:', admin.password_hash);
  const match = await bcrypt.compare('Admin@SIH2026!', admin.password_hash);
  console.log('Password match for "Admin@SIH2026!":', match);
  await client.end();
}

check().catch(console.error);
