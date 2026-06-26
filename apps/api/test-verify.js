const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/dashboard/invites/verify',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log("API RESPONSE:", data); });
});

req.on('error', (e) => { console.error(`problem with request: ${e.message}`); });

const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Q%604p%7EobMZ%2942%5B%3E1G@34.158.113.53:5432/postgres' });
pool.query("SELECT id FROM invitations WHERE target_role = 'tenant' AND used = false ORDER BY created_at DESC LIMIT 1;")
  .then(dbRes => {
    if (dbRes.rows.length > 0) {
      console.log("Using Invite Code:", dbRes.rows[0].id);
      req.write(JSON.stringify({ code: dbRes.rows[0].id }));
      req.end();
    } else {
      console.log('No active tenant invites found in DB');
      pool.end();
    }
  })
  .catch(console.error);
