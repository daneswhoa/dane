const http = require('http');

// First, insert dummy tickets directly using pg
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:Q%604p%7EobMZ%2942%5B%3E1G@34.158.113.53:5432/postgres' });

async function run() {
  try {
    // 1. Get a valid tenant user id
    const resUser = await pool.query("SELECT id FROM users WHERE role = 'tenant' LIMIT 1;");
    if (resUser.rows.length === 0) {
      console.log("No tenant found");
      return;
    }
    const tenantId = resUser.rows[0].id;
    console.log("Using Tenant:", tenantId);

    // 2. Insert 3 tickets
    for(let i=1; i<=3; i++) {
      const id = 'tkt-test-' + i;
      await pool.query(`
        INSERT INTO tickets (id, title, description, urgency, owner_id, tenant_id, status) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING;
      `, [id, `Test Ticket ${i}`, `Desc ${i}`, 'routine', 'owner-1', tenantId, 'open']);
    }
    console.log("Inserted 3 tickets.");

    // 3. Instead of http request with session, let's just query what the controller does!
    // The controller does a LEFT JOIN
    const query = `
      SELECT t.id, t.title, t.tenant_id, p.name as property_name
      FROM tickets t
      LEFT JOIN properties p ON t.property_id = p.id
      LEFT JOIN units u ON t.unit_id = u.id
      WHERE t.tenant_id = $1
      ORDER BY t.created_at DESC;
    `;
    const ticketsRes = await pool.query(query, [tenantId]);
    console.log("Tickets fetched by query length:", ticketsRes.rows.length);
    console.log(ticketsRes.rows);

  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
