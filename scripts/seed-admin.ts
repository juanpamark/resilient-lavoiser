/**
 * Seed Script: Create / Update Platform Admin for Agilizio
 *
 * Usage:
 *   pnpm run seed:admin
 *
 * Requires environment variables:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Helper to manually parse .env or .env.local if present
function loadEnvFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        let value = trimmed.substring(eqIdx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

// Attempt reading env files
loadEnvFile(path.resolve(process.cwd(), '.env.local'));
loadEnvFile(path.resolve(process.cwd(), '.env'));
loadEnvFile(path.resolve(process.cwd(), 'apps/web/.env.local'));
loadEnvFile(path.resolve(process.cwd(), 'apps/web/.env'));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL = 'admin@agilizio.com';
const ADMIN_PASSWORD = 'agilizio2026';
const DEMO_BUSINESS_ID = '00000000-0000-0000-0000-000000000001';

async function main() {
  console.log('='.repeat(70));
  console.log('🚀  AGILIZIO - SEED PLATFORM ADMIN USER');
  console.log('='.repeat(70));

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('\n❌ ERROR: Faltan las variables de entorno de Supabase.');
    console.error('Se requiere:');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY\n');
    console.error('💡 Puedes definirlas en PowerShell antes de ejecutar:');
    console.error('  $env:NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"');
    console.error('  $env:SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"');
    console.error('  pnpm run seed:admin\n');
    console.error('💡 O si prefieres, ejecuta directamente el archivo SQL en el editor de Supabase:');
    console.error('  supabase/seed_admin.sql\n');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log(`\n📡 Conectando a Supabase: ${supabaseUrl}`);

  // 1. Check if user already exists
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Error consultando usuarios en Supabase Auth:', listError.message);
    process.exit(1);
  }

  let user = usersData.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  if (!user) {
    console.log(`👤 Creando usuario ${ADMIN_EMAIL}...`);
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: 'Admin Agilizio',
        role: 'platform_admin',
      },
    });

    if (createError || !createData.user) {
      console.error('❌ Error creando usuario en Supabase Auth:', createError?.message);
      process.exit(1);
    }
    user = createData.user;
    console.log(`✓ Usuario creado exitosamente con ID: ${user.id}`);
  } else {
    console.log(`👤 Usuario ${ADMIN_EMAIL} ya existe (ID: ${user.id}). Actualizando contraseña...`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });

    if (updateError) {
      console.error('❌ Error actualizando contraseña:', updateError.message);
      process.exit(1);
    }
    console.log('✓ Contraseña y confirmación de correo actualizadas.');
  }

  // 2. Grant Platform Admin
  console.log('🛡️  Asignando rol en public.platform_admins...');
  const { error: adminError } = await supabase
    .from('platform_admins')
    .upsert({ user_id: user.id }, { onConflict: 'user_id' });

  if (adminError) {
    console.error('⚠️ Advertencia al asignar platform_admin:', adminError.message);
  } else {
    console.log('✓ Usuario registrado en platform_admins (is_platform_admin = true)');
  }

  // 3. Grant Membership in Business
  console.log('🏢 Asignando membresía de inquilino en public.memberships...');
  // Check if business exists
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id')
    .limit(1);

  const targetBusinessId = businesses && businesses.length > 0 ? businesses[0].id : DEMO_BUSINESS_ID;

  const { error: memberError } = await supabase
    .from('memberships')
    .upsert(
      {
        user_id: user.id,
        business_id: targetBusinessId,
        role: 'owner',
        is_active: true,
      },
      { onConflict: 'user_id,business_id' }
    );

  if (memberError) {
    console.error('⚠️ Advertencia al asignar membresía:', memberError.message);
  } else {
    console.log(`✓ Membresía asignada como 'owner' en negocio: ${targetBusinessId}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎉  ¡CONFIGURACIÓN COMPLETADA CON ÉXITO!');
  console.log('='.repeat(70));
  console.log('Credenciales de acceso:');
  console.log(`  📧 Correo:     ${ADMIN_EMAIL}`);
  console.log(`  🔑 Contraseña: ${ADMIN_PASSWORD}`);
  console.log('Rutas habilitadas:');
  console.log('  - Panel Platform Admin: /platform/dashboard');
  console.log('  - Portal Negocio:       /business/agent & /business/inbox');
  console.log('='.repeat(70) + '\n');
}

main().catch((err) => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
