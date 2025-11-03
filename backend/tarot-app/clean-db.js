const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5435,
  user: 'tarotflavia_user',
  password: 'tarotflavia_secure_password_2024',
  database: 'tarotflavia_db',
});

async function clean() {
  console.log('🧹 Limpiando datos de prueba...');

  // Eliminar en orden correcto por foreign keys
  await pool.query('DELETE FROM tarot_reading');
  console.log('✅ Lecturas eliminadas');

  await pool.query('DELETE FROM tarot_card');
  console.log('✅ Cartas eliminadas');

  await pool.query('DELETE FROM tarot_deck');
  console.log('✅ Decks eliminados');

  const decks = await pool.query('SELECT COUNT(*) FROM tarot_deck');
  const cards = await pool.query('SELECT COUNT(*) FROM tarot_card');
  console.log(`\nDecks restantes: ${decks.rows[0].count}`);
  console.log(`Cartas restantes: ${cards.rows[0].count}`);

  await pool.end();
}

clean().catch(console.error);
