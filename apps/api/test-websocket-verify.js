const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query("SELECT * FROM invitations WHERE id = 'LNL-TEAM-F09CD252';")
  .then(res => {
    console.log("INVITATION ROWS:", JSON.stringify(res.rows, null, 2));
    pool.end();
  })
  .catch(err => {
    console.error("ERROR:", err);
    pool.end();
  });
