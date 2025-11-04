const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5435,
  user: 'tarot_user',
  password: 'tarot_password_2024',
  database: 'tarot_db',
});

async function clean() {
  console.log('��� Limpiando usuarios de prueba...');
  await pool.query('DELETE FROM "user" WHERE email LIKE \'%@test.com\'');
  console.log('✅ Usuarios eliminados');
  await pool.end();
}

clean().catch(console.error);
