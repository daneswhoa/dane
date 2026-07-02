const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_gY5y2cEqvQNL@ep-cold-meadow-a24h4p9w-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require' });

pool.query("SELECT * FROM invitations WHERE id = 'LNL-TEAM-F09CD252';")
  .then(res => {
    console.log("INVITATION ROWS:", res.rows);
    pool.end();
  })
  .catch(err => {
    console.error("ERROR:", err);
    pool.end();
  });
