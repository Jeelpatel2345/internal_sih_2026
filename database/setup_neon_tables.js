/**
 * Neon DB Schema Initialization & Setup Script
 * Reads schema.sql and creates all tables, indexes, extensions, triggers in Neon PostgreSQL.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { Client } = require('pg');

// Neon API Key provided by user
const NEON_API_KEY = process.env.NEON_API_KEY || 'napi_2ksm0ipqqux01l4722li739r98ng2agmrnnsdsa3oqa77e0i7qlmhahjlb8hstib';
const PROJECT_ID = 'sweet-wildflower-13746772';

// Fallback direct connection string retrieved from Neon REST API
const DEFAULT_DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL ||
  'postgresql://neondb_owner:npg_KwdEyvOSn6s0@ep-noisy-art-az88msje-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const agent = new https.Agent({ rejectUnauthorized: false });

function getNeonConnectionUri() {
  return new Promise((resolve) => {
    const req = https.request(
      `https://console.neon.tech/api/v2/projects/${PROJECT_ID}/connection_uri?database_name=neondb&role_name=neondb_owner`,
      {
        agent,
        headers: {
          Authorization: `Bearer ${NEON_API_KEY}`,
          Accept: 'application/json',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.uri) {
              console.log('⚡ Retrieved dynamic connection URI from Neon Management API.');
              return resolve(parsed.uri);
            }
          } catch (e) {}
          resolve(DEFAULT_DATABASE_URL);
        });
      }
    );
    req.on('error', () => resolve(DEFAULT_DATABASE_URL));
    req.end();
  });
}

async function setupDatabase() {
  console.log('🚀 Connecting to Neon PostgreSQL Database...');
  const connectionString = await getNeonConnectionUri();
  console.log(`🔗 Target Connection Host: ${connectionString.split('@')[1] ? connectionString.split('@')[1].split('/')[0] : 'Neon DB'}`);

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to Neon Database!');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const sqlScript = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Executing DDL Schema script (schema.sql)...');
    await client.query(sqlScript);
    console.log('🎉 All Neon DB tables, indexes, and triggers created successfully!');

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n📊 Created Tables in Neon DB:');
    res.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });
  } catch (err) {
    console.error('❌ Error executing Neon DB setup:', err);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✨ Database setup process complete.');
  }
}

setupDatabase();
