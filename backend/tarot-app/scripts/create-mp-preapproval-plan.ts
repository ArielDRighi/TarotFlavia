#!/usr/bin/env ts-node
/**
 * Script CLI para crear un plan de preapproval (suscripción recurrente) en MercadoPago.
 *
 * El ID resultante debe guardarse como variable de entorno MP_PREAPPROVAL_PLAN_ID
 * en el archivo .env del backend.
 *
 * Requisitos:
 *   - La variable de entorno MP_ACCESS_TOKEN debe estar configurada en .env
 *
 * Uso:
 *   npm run mp:create-plan
 *   npm run mp:create-plan -- --amount=2999
 *   npm run mp:create-plan -- --amount 2999
 *   npm run mp:create-plan -- --amount=4999 --reason="Auguria Premium Anual"
 *   npm run mp:create-plan -- --amount 4999 --reason "Auguria Premium Anual"
 *
 * Argumentos opcionales:
 *   --amount=<número>   Precio mensual en ARS (por defecto: 2999) — formatos: --amount=2999 o --amount 2999
 *   --reason=<texto>    Nombre/descripción del plan (por defecto: "Auguria Premium")
 *
 * Resultado:
 *   Imprime el preapproval_plan_id en consola. Copiar ese ID a .env como MP_PREAPPROVAL_PLAN_ID.
 *
 * Ejemplo de salida:
 *   ✅ Plan creado exitosamente
 *   Plan ID: 2c938084726fca480172750000ed74a8
 *   → Agregar a .env: MP_PREAPPROVAL_PLAN_ID=2c938084726fca480172750000ed74a8
 */

import * as path from 'path';
import * as dotenv from 'dotenv';
import { MercadoPagoConfig, PreApprovalPlan } from 'mercadopago';
import type { PreApprovalPlanRequest } from 'mercadopago/dist/clients/preApprovalPlan/commonTypes';

// Cargar variables de entorno desde .env (ubicado en backend/tarot-app/)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface ScriptOptions {
  amount: number;
  reason: string;
}

const KNOWN_KEYS = new Set(['amount', 'reason']);

function parseArgs(): ScriptOptions {
  const args = process.argv.slice(2);
  const options: ScriptOptions = {
    amount: 2999,
    reason: 'Auguria Premium',
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (!arg.startsWith('--')) {
      console.error(
        `❌ Argumento desconocido: "${arg}". Solo se aceptan flags con --key=value o --key value.`,
      );
      process.exit(1);
    }

    const withoutDashes = arg.slice(2);
    const eqIndex = withoutDashes.indexOf('=');

    let key: string;
    let value: string;

    if (eqIndex !== -1) {
      // Formato --key=value
      key = withoutDashes.slice(0, eqIndex);
      value = withoutDashes.slice(eqIndex + 1);
      i++;
    } else {
      // Formato --key value
      key = withoutDashes;
      const next = args[i + 1];
      if (next === undefined || next.startsWith('--')) {
        console.error(
          `❌ El argumento --${key} requiere un valor (ej: --${key}=<valor> o --${key} <valor>).`,
        );
        process.exit(1);
      }
      value = next;
      i += 2;
    }

    if (!KNOWN_KEYS.has(key)) {
      console.error(
        `❌ Argumento desconocido: "--${key}". Los argumentos válidos son: --amount, --reason.`,
      );
      process.exit(1);
    }

    if (key === 'amount') {
      // Validación estricta: solo enteros positivos sin caracteres extra
      if (!/^\d+$/.test(value)) {
        console.error(
          `❌ Argumento inválido para --amount: "${value}". Debe ser un número entero positivo (sin decimales ni caracteres extra).`,
        );
        process.exit(1);
      }
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        console.error(
          `❌ Argumento inválido para --amount: "${value}". Debe ser un número entero positivo.`,
        );
        process.exit(1);
      }
      options.amount = parsed;
    } else if (key === 'reason') {
      if (!value.trim()) {
        console.error('❌ El argumento --reason no puede estar vacío.');
        process.exit(1);
      }
      options.reason = value.trim();
    }
  }

  return options;
}

async function createPreapprovalPlan(): Promise<void> {
  const options = parseArgs();

  // Validar que MP_ACCESS_TOKEN esté configurado
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    console.error(
      '❌ MP_ACCESS_TOKEN no está configurado en el archivo .env\n',
    );
    console.error(
      '   Asegurate de tener una línea como: MP_ACCESS_TOKEN=TEST-xxx...',
    );
    console.error('   en backend/tarot-app/.env antes de ejecutar este script.');
    process.exit(1);
  }

  const isTestToken = accessToken.startsWith('TEST-');
  const environment = isTestToken ? 'Sandbox (TEST)' : 'Producción';

  console.log('🚀 Creando plan de preapproval en MercadoPago...\n');
  console.log(`   Entorno:   ${environment}`);
  console.log(`   Precio:    ARS $${options.amount}/mes`);
  console.log(`   Nombre:    ${options.reason}\n`);

  if (!isTestToken) {
    console.warn(
      '⚠️  ATENCIÓN: Estás usando un token de PRODUCCIÓN. El plan se creará en el entorno real.\n',
    );
  }

  const client = new MercadoPagoConfig({ accessToken });
  const planClient = new PreApprovalPlan(client);

  const body: PreApprovalPlanRequest = {
    reason: options.reason,
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: options.amount,
      currency_id: 'ARS',
    },
    back_url: process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/premium`
      : 'http://localhost:3001/premium',
  };

  const response = await planClient.create({ body });

  if (!response.id) {
    console.error(
      '❌ MercadoPago no retornó un ID de plan. Respuesta recibida:',
    );
    console.error(JSON.stringify(response, null, 2));
    process.exit(1);
  }

  console.log('✅ Plan creado exitosamente\n');
  console.log(`   Plan ID:        ${response.id}`);
  console.log(`   Nombre:         ${response.reason ?? options.reason}`);
  console.log(`   Estado:         ${response.status ?? 'active'}`);
  console.log(`   Monto mensual:  ARS $${options.amount}`);

  if (response.init_point) {
    console.log(`   Init point:     ${response.init_point}`);
  }

  if (response.date_created) {
    console.log(`   Creado:         ${response.date_created}`);
  }

  console.log(
    '\n────────────────────────────────────────────────────────────',
  );
  console.log('📋 PRÓXIMO PASO — Agregar el ID al archivo .env:\n');
  console.log(`   MP_PREAPPROVAL_PLAN_ID=${response.id}\n`);
  console.log(
    'Luego reiniciá el servidor (npm run start:dev) para que tome el nuevo valor.',
  );
  console.log(
    '────────────────────────────────────────────────────────────\n',
  );
}

interface MpApiError {
  status?: number;
  statusCode?: number;
  response?: { status?: number };
}

function extractHttpStatus(error: unknown): number | null {
  if (error !== null && typeof error === 'object') {
    const e = error as MpApiError;
    const status = e.status ?? e.statusCode ?? e.response?.status;
    if (typeof status === 'number' && Number.isFinite(status)) {
      return status;
    }
  }
  // Fallback: buscar el código en el mensaje de texto
  if (error instanceof Error) {
    const match = /\b(4\d{2}|5\d{2})\b/.exec(error.message);
    if (match) return Number(match[1]);
  }
  return null;
}

createPreapprovalPlan().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('❌ Error al crear el plan en MercadoPago:', message);

  const httpStatus = extractHttpStatus(error);

  if (httpStatus === 401) {
    console.error(
      '\n💡 Error de autenticación (401). Verificá que MP_ACCESS_TOKEN sea válido.',
    );
  } else if (httpStatus === 400) {
    console.error('\n💡 Error de parámetros (400). Verificá los argumentos del script.');
  }

  process.exit(1);
});
