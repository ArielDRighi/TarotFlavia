const { Client } = require('pg');

async function resetDatabase() {
  // Conectar como superusuario para poder drop/create la base de datos
  const adminClient = new Client({
    host: 'localhost',
    port: 5435,
    user: 'tarotflavia_user',
    password: 'tarotflavia_secure_password_2024',
    database: 'postgres', // Conectar a la base postgres default
  });

  try {
    await adminClient.connect();
    console.log('Connected to PostgreSQL');

    // Terminar conexiones activas
    await adminClient.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'tarotflavia_db'
        AND pid <> pg_backend_pid();
    `);
    console.log('Terminated active connections');

    // Drop database
    await adminClient.query('DROP DATABASE IF EXISTS tarotflavia_db;');
    console.log('Database dropped');

    // Recreate database
    await adminClient.query(
      'CREATE DATABASE tarotflavia_db OWNER tarotflavia_user;',
    );
    console.log('Database created');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    await adminClient.end();
  }
}

resetDatabase().then(() => {
  console.log('Database reset completed!');
  process.exit(0);
});
