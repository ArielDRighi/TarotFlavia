#!/usr/bin/env node
/**
 * update-card-content.js
 *
 * Reads arcanos_mayores.md and arcanos_menores.md, parses card content,
 * and updates the encyclopedia_tarot_cards table directly via SQL.
 *
 * Run from backend/tarot-app/:
 *   node scripts/update-card-content.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// ---------------------------------------------------------------------------
// Database connection
// ---------------------------------------------------------------------------
const DB_CONFIG = {
  connectionString:
    'postgresql://tarotflavia_user:tarotflavia_secure_password_2024@localhost:5435/tarot_db',
};

// ---------------------------------------------------------------------------
// File paths
// ---------------------------------------------------------------------------
const DOCS_DIR = path.resolve(__dirname, '../../../docs/prompts_enciclopedia');
const MAYORES_FILE = path.join(DOCS_DIR, 'arcanos_mayores.md');
const MENORES_FILE = path.join(DOCS_DIR, 'arcanos_menores.md');

// ---------------------------------------------------------------------------
// Major Arcana slug mapping
// The keys are normalised (trimmed, upper-cased) versions of the first line
// after the ALL-CAPS heading.  We match the heading line itself.
// ---------------------------------------------------------------------------
const MAJOR_SLUG_MAP = {
  'EL LOCO': 'the-fool',
  'EL MAGO': 'the-magician',
  // Two spelling variants appear in the file
  'LA SACERDOTISA': 'the-high-priestess',
  'LA SACERDOTIZA': 'the-high-priestess',
  'LA EMPERATRIZ': 'the-empress',
  'EL EMPERADOR': 'the-emperor',
  'EL SUMO SACERDOTE': 'the-hierophant',
  'EL SUMO SACERDORTE': 'the-hierophant', // typo in source
  'LOS ENAMORADOS': 'the-lovers',
  'EL CARRO': 'the-chariot',
  'LA FUERZA': 'strength',
  'EL ERMITAÑO': 'the-hermit',
  'LA RUEDA DE LA FORTUNA': 'wheel-of-fortune',
  'LA JUSTICIA': 'justice',
  'EL COLGADO': 'the-hanged-man',
  'LA MUERTE': 'death',
  'LA MUERTE/ EL ARCANO SIN NOMBRE': 'death',
  'LA TEMPLANZA': 'temperance',
  'EL DIABLO': 'the-devil',
  'EL DIABLO/LA SOMBRA': 'the-devil',
  'LA TORRE': 'the-tower',
  'LA ESTRELLA': 'the-star',
  'LA LUNA': 'the-moon',
  'EL SOL': 'the-sun',
  'EL JUICIO': 'judgement',
  'EL MUNDO': 'the-world',
};

// Secondary headings that appear inside a card section (not new cards).
// When we see these we should NOT start a new card section.
const SECONDARY_HEADINGS = new Set([
  'LA RUEDA: UN GIRO EN EL DESTINO',
  'EL PESO DE LA VERDAD',
  'LA RENDICIÓN COMO CAMINO DE REVELACIÓN_EL VIAJE DEL COLGADO',
  'LA TIRADA DEL ARCANO DEL SOL',
]);

// ---------------------------------------------------------------------------
// Minor Arcana slug helpers
// ---------------------------------------------------------------------------
const NUMBER_MAP = {
  AS: 'ace',
  DOS: 'two',
  TRES: 'three',
  CUATRO: 'four',
  CINCO: 'five',
  SEIS: 'six',
  SIETE: 'seven',
  OCHO: 'eight',
  NUEVE: 'nine',
  DIEZ: 'ten',
  SOTA: 'page',
  CABALLERO: 'knight',
  REINA: 'queen',
  REY: 'king',
};

const SUIT_MAP = {
  COPAS: 'cups',
  ESPADAS: 'swords',
  BASTOS: 'wands',
  'PENTÁCULOS': 'pentacles',
  OROS: 'pentacles',
};

/**
 * Convert "As de Copas:" → "ace-of-cups"
 * Returns null if not recognised.
 */
function minorCardNameToSlug(rawName) {
  // Remove trailing colon and trim
  const name = rawName.replace(/:$/, '').trim().toUpperCase();

  // Pattern: <number/rank> DE <suit>
  const match = name.match(/^(.+?)\s+DE\s+(.+)$/);
  if (!match) return null;

  const rankKey = match[1].trim();
  const suitKey = match[2].trim();

  const rank = NUMBER_MAP[rankKey];
  const suit = SUIT_MAP[suitKey];

  if (!rank || !suit) return null;
  return `${rank}-of-${suit}`;
}

// ---------------------------------------------------------------------------
// Parse Major Arcana
// Returns: Map<slug, descriptionText>
// ---------------------------------------------------------------------------
function parseMajorArcana(fileContent) {
  const lines = fileContent.split('\n');
  const result = new Map();

  // We need to track which heading lines are valid card starts
  // A card heading is an ALL-CAPS line that exists as a key in MAJOR_SLUG_MAP
  // and is NOT a secondary heading.

  let currentSlug = null;
  let currentLines = [];

  function flushCurrent() {
    if (currentSlug && currentLines.length > 0) {
      // Join lines, trim leading/trailing blank lines
      const text = currentLines.join('\n').trim();
      if (text) {
        // If slug already has content (e.g. LA EMPERATRIZ appears twice),
        // append to existing
        if (result.has(currentSlug)) {
          result.set(currentSlug, result.get(currentSlug) + '\n\n' + text);
        } else {
          result.set(currentSlug, text);
        }
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if this is a major arcana heading line
    // Headings are ALL-CAPS (possibly with / and spaces), no lowercase letters
    // except special chars like Ñ
    const isAllCaps =
      trimmed.length > 0 &&
      trimmed === trimmed.toUpperCase() &&
      /^[A-ZÁÉÍÓÚÑÜ\s/._-]+$/.test(trimmed);

    if (isAllCaps) {
      const slug = MAJOR_SLUG_MAP[trimmed];
      if (slug && !SECONDARY_HEADINGS.has(trimmed)) {
        // New card section starts
        flushCurrent();
        currentSlug = slug;
        currentLines = [];
        continue;
      }
      // Secondary heading or unrecognised ALL-CAPS line: add to current section
      if (currentSlug !== null) {
        currentLines.push(line);
      }
    } else {
      // Regular line: add to current section
      if (currentSlug !== null) {
        currentLines.push(line);
      }
    }
  }

  // Flush last card
  flushCurrent();

  return result;
}

// ---------------------------------------------------------------------------
// Parse Minor Arcana keywords
// Returns: Map<slug, string[]>
// The file only has numbered sections for Copas and Oros.
// ---------------------------------------------------------------------------
function parseMinorArcanaKeywords(fileContent) {
  const lines = fileContent.split('\n');
  const result = new Map();

  let currentSlug = null;
  let currentKeywords = [];

  function flushCurrent() {
    if (currentSlug && currentKeywords.length > 0) {
      result.set(currentSlug, [...currentKeywords]);
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Card header pattern: "<Name> de <Suit>:"
    // e.g. "As de Copas:", "Diez de Oros:"
    if (/^.+ de .+:$/.test(trimmed)) {
      const slug = minorCardNameToSlug(trimmed);
      if (slug) {
        flushCurrent();
        currentSlug = slug;
        currentKeywords = [];
        continue;
      }
    }

    // Blank lines are separators between keywords — skip but keep collecting
    if (trimmed === '') {
      continue;
    }

    // Non-blank line while collecting keywords
    if (currentSlug !== null) {
      // A line in ALL CAPS that is NOT a card header (card headers contain " de ")
      // signals the end of keyword data for this card (e.g. LECCIONES GLOBALES:)
      const isAllCapsSection =
        trimmed === trimmed.toUpperCase() &&
        trimmed.length > 3 &&
        !trimmed.includes(' de ') &&
        !trimmed.includes(' DE ');
      if (isAllCapsSection) {
        // This is a section header, flush and stop collecting
        flushCurrent();
        currentSlug = null;
        currentKeywords = [];
        continue;
      }
      currentKeywords.push(trimmed);
    }
  }

  flushCurrent();

  return result;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('Reading source files…');

  const mayoresContent = fs.readFileSync(MAYORES_FILE, 'utf8');
  const menoresContent = fs.readFileSync(MENORES_FILE, 'utf8');

  console.log('Parsing Major Arcana descriptions…');
  const majorDescriptions = parseMajorArcana(mayoresContent);
  console.log(`  Found ${majorDescriptions.size} major arcana card descriptions`);
  for (const [slug] of majorDescriptions) {
    console.log(`    → ${slug}`);
  }

  console.log('Parsing Minor Arcana keywords…');
  const minorKeywords = parseMinorArcanaKeywords(menoresContent);
  console.log(`  Found ${minorKeywords.size} minor arcana keyword sets`);
  for (const [slug, kws] of minorKeywords) {
    console.log(`    → ${slug}: [${kws.join(', ')}]`);
  }

  // ---------------------------------------------------------------------------
  // Connect to DB and run updates
  // ---------------------------------------------------------------------------
  const client = new Client(DB_CONFIG);
  await client.connect();
  console.log('\nConnected to database.');

  let majorUpdated = 0;
  let majorNotFound = 0;

  console.log('\n--- Updating Major Arcana descriptions ---');
  for (const [slug, description] of majorDescriptions) {
    const res = await client.query(
      `UPDATE encyclopedia_tarot_cards
         SET description = $1
       WHERE slug = $2`,
      [description, slug],
    );
    if (res.rowCount > 0) {
      console.log(`  ✓ Updated description for: ${slug}`);
      majorUpdated++;
    } else {
      console.warn(`  ✗ No row found for slug: ${slug}`);
      majorNotFound++;
    }
  }

  let minorUpdated = 0;
  let minorNotFound = 0;

  console.log('\n--- Updating Minor Arcana keywords.upright ---');
  for (const [slug, keywords] of minorKeywords) {
    // Use jsonb_set to update only the "upright" key, preserving "reversed"
    const res = await client.query(
      `UPDATE encyclopedia_tarot_cards
         SET keywords = jsonb_set(
           COALESCE(keywords, '{"upright": [], "reversed": []}'),
           '{upright}',
           $1::jsonb
         )
       WHERE slug = $2`,
      [JSON.stringify(keywords), slug],
    );
    if (res.rowCount > 0) {
      console.log(`  ✓ Updated keywords.upright for: ${slug}`);
      minorUpdated++;
    } else {
      console.warn(`  ✗ No row found for slug: ${slug}`);
      minorNotFound++;
    }
  }

  await client.end();

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('\n=== Summary ===');
  console.log(`Major Arcana: ${majorUpdated} updated, ${majorNotFound} not found`);
  console.log(`Minor Arcana: ${minorUpdated} updated, ${minorNotFound} not found`);
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
