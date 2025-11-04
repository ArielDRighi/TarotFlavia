const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function updateSchema() {
  const client = new Client({
    host: 'localhost',
    port: 5435,
    user: 'tarotflavia_user',
    password: 'tarotflavia_secure_password_2024',
    database: 'tarotflavia_db',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const sqlPath = path.join(
      __dirname,
      'src/database/migrations/update-reading-schema.sql',
    );
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing migration...');
    await client.query(sql);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error executing migration:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

updateSchema();
