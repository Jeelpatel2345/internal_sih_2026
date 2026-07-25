/**
 * Neon Management API Helper Script
 * Interacts with Neon REST API (https://console.neon.tech/api/v2) using API Key.
 */

const https = require('https');

const NEON_API_KEY = process.env.NEON_API_KEY || 'napi_2ksm0ipqqux01l4722li739r98ng2agmrnnsdsa3oqa77e0i7qlmhahjlb8hstib';
const PROJECT_ID = process.env.NEON_PROJECT_ID || 'sweet-wildflower-13746772';

const agent = new https.Agent({ rejectUnauthorized: false });

function neonApiRequest(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      agent,
      headers: {
        Authorization: `Bearer ${NEON_API_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method,
    };

    const req = https.request(`https://console.neon.tech/api/v2${endpoint}`, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data, raw: true });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'info';

  console.log(`🔑 Using Neon API Key: ${NEON_API_KEY.substring(0, 10)}...`);

  switch (command) {
    case 'info': {
      console.log('📌 Fetching Project Details...');
      const res = await neonApiRequest(`/projects/${PROJECT_ID}`);
      console.log(JSON.stringify(res.data, null, 2));
      break;
    }
    case 'branches': {
      console.log('🌿 Fetching Branches...');
      const res = await neonApiRequest(`/projects/${PROJECT_ID}/branches`);
      console.log(JSON.stringify(res.data, null, 2));
      break;
    }
    case 'connection': {
      console.log('🔗 Fetching Connection String...');
      const res = await neonApiRequest(`/projects/${PROJECT_ID}/connection_uri?database_name=neondb&role_name=neondb_owner`);
      console.log(JSON.stringify(res.data, null, 2));
      break;
    }
    default:
      console.log('Usage: node database/neon_api.cjs [info | branches | connection]');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { neonApiRequest, NEON_API_KEY, PROJECT_ID };
