const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5435,
  user: 'tarotflavia_user',
  password: 'tarotflavia_secure_password_2024',
  database: 'tarotflavia_db',
});

async function clean() {
  console.log('í·¹ Limpiando usuarios de prueba...');
  await pool.query("DELETE FROM \"user\" WHERE email LIKE '%@test.com'");
  console.log('âœ… Usuarios eliminados');
  await pool.end();
}

clean().catch(console.error);
