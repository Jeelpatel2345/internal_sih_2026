/**
 * seed.ts — Neon PostgreSQL Seeder
 * Replaced MongoDB/Mongoose seeding with direct Neon DB inserts.
 * Run: npx ts-node src/scripts/seed.ts
 */

import { neonPool, connectNeonDB } from '../config/neon';
import { createAdmin } from '../db/admin.repo';
import { getSettings } from '../db/settings.repo';
import { config } from '../config';

const seed = async () => {
  console.log('🌱 Connecting to Neon PostgreSQL...');
  await connectNeonDB();

  // ── Seed Super Admin ───────────────────────────────────────────────
  const existing = await neonPool.query(
    `SELECT id FROM admins WHERE email = $1 LIMIT 1`,
    [config.seed.adminEmail]
  );

  if ((existing.rowCount ?? 0) > 0) {
    console.log(`ℹ️  Admin "${config.seed.adminEmail}" already exists in Neon DB. Skipping.`);
  } else {
    await createAdmin({
      name: config.seed.adminName,
      email: config.seed.adminEmail,
      password: config.seed.adminPassword,
      role: 'super_admin',
    });
    console.log(`✅ Super Admin created in Neon DB: ${config.seed.adminEmail}`);
    console.log(`🔑 Password: ${config.seed.adminPassword}`);
  }

  // ── Seed Default Settings ─────────────────────────────────────────
  const settings = await getSettings();
  console.log(`✅ Default settings ensured (ID: ${settings.id}).`);

  await neonPool.end();
  console.log('🎉 Neon Seed complete!');
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
