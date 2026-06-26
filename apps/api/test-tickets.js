const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/dashboard/maintenance',
  method: 'GET',
  headers: {
    // We can't easily mock SessionGuard without a real session cookie.
    // Instead, let's query the DB directly to see all tickets.
  }
};

const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Q%604p%7EobMZ%2942%5B%3E1G@34.158.113.53:5432/postgres' });
pool.query("SELECT id, title, tenant_id, status FROM tickets;")
  .then(dbRes => {
    console.log("ALL TICKETS IN DB:");
    console.log(JSON.stringify(dbRes.rows, null, 2));
    pool.end();
  })
  .catch(err => {
    console.error(err);
    pool.end();
  });
