const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5435,
  user: 'tarot_user',
  password: 'tarot_password_2024',
  database: 'tarot_db',
});

async function check() {
  const decks = await pool.query(
    'SELECT id, name, "cardCount", "isDefault" FROM tarot_deck ORDER BY name LIMIT 5',
  );
  console.log('Decks en la base de datos:');
  console.table(decks.rows);

  const cards = await pool.query('SELECT COUNT(*) FROM tarot_card');
  console.log(`\nTotal de cartas: ${cards.rows[0].count}`);

  const categories = await pool.query('SELECT COUNT(*) FROM reading_category');
  console.log(`Total de categorías: ${categories.rows[0].count}`);

  await pool.end();
}

check().catch(console.error);
