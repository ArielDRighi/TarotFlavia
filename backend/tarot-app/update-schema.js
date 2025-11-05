require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function updateSchema() {
  const client = new Client({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT
      ? parseInt(process.env.POSTGRES_PORT, 10)
      : 5435,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
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
