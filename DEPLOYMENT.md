# Guía Maestra de Despliegue a Producción (DEPLOYMENT.md)

Esta guía paso a paso describe el procedimiento completo para desplegar la plataforma multi-tenant SaaS a producción, utilizando **Netlify** para el frontend (Next.js 15), **Supabase Cloud** para la base de datos PostgreSQL, autenticación y Realtime, **Meta for Developers** para WhatsApp Cloud API v21.0 (Embedded Signup) y **Google AI Studio** para el modelo Gemini 2.5 Flash.

---

## 📋 Resumen de Cuentas Requeridas

Antes de comenzar, asegúrate de tener acceso o crear las siguientes cuentas:

1. **[Supabase Cloud](https://supabase.com/):** Base de datos PostgreSQL gestionada con Row Level Security y WebSockets.
2. **[Netlify](https://www.netlify.com/):** Hosting y CDN Edge para Next.js 15 App Router.
3. **[Meta for Developers](https://developers.facebook.com/):** WhatsApp Business Platform Cloud API y Embedded Signup.
4. **[Google AI Studio](https://aistudio.google.com/):** Acceso a la API Key de Google Gemini (`gemini-2.5-flash`).

---

## 🗄️ PASO 1: Aprovisionar y Configurar Supabase Cloud

### 1.1 Crear el Proyecto
1. Ingresa a [database.new](https://database.new) e inicia sesión en Supabase.
2. Haz clic en **"New Project"**.
3. Asigna un nombre a la organización y proyecto (ej. `platform-saas-prod`).
4. Selecciona la región más cercana a tus clientes (ej. `us-east-1` o `sa-east-1`).
5. Genera y guarda de forma segura tu **Database Password**.

### 1.2 Obtener las Credenciales
En el panel del proyecto, dirígete a **Project Settings** -> **API**:
- **Project URL:** `https://xxxxxxxxxxxxxxxxxxxx.supabase.co` (`NEXT_PUBLIC_SUPABASE_URL`)
- **Project API Keys (`anon`, `public`):** `ey...` (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- **Project API Keys (`service_role`, `secret`):** `ey...` (`SUPABASE_SERVICE_ROLE_KEY`)
- **Project Reference ID:** El código alfanumérico en la URL de tu panel (ej. `xxxxxxxxxxxxxxxxxxxx`).

### 1.3 Aplicar las Migraciones SQL (001 a 012)
En tu terminal local, vincula tu CLI de Supabase y despliega el esquema:

```bash
# Iniciar sesión en Supabase CLI
supabase login

# Vincular al proyecto remoto
supabase link --project-ref <TU_PROJECT_REFERENCE_ID>

# Empujar todas las migraciones (001_create_businesses a 012_create_analytics_views)
supabase db push
```

> [!NOTE]
> Las migraciones configuran automáticamente:
> - Las 15 tablas relacionales con `FORCE ROW LEVEL SECURITY`.
> - Las 79 políticas RLS con InitPlan Caching (`(SELECT auth.jwt() ->> 'business_id')`).
> - La función del Auth Hook `public.custom_access_token_hook`.
> - Las vistas analíticas con `security_invoker = true`.

### 1.4 Habilitar el Custom Access Token Hook
1. En el panel de Supabase, ve a **Authentication** -> **Hooks** (o **Advanced Settings**).
2. En la sección **Custom Access Token (JWT) Hook**, haz clic en **Edit**.
3. Selecciona **Postgres Function** y elige la función: `public.custom_access_token_hook`.
4. Guarda los cambios. A partir de este momento, cada login inyectará `business_id`, `user_role` e `is_platform_admin` en el JWT.

### 1.5 Activar la Publicación de Realtime
1. Ve a **Database** -> **Replication**.
2. En la publicación `supabase_realtime`, asegúrate de que las tablas `messages` y `conversations` tengan el switch activado para emitir eventos `INSERT` y `UPDATE`.

---

## 💬 PASO 2: Configurar Meta for Developers (WhatsApp Cloud API)

### 2.1 Crear la Aplicación en Meta
1. Ingresa a [Meta for Developers](https://developers.facebook.com/apps).
2. Haz clic en **Crear app** -> Selecciona el tipo de app **Negocios** (Business).
3. Asigna un nombre (ej. `Platform WhatsApp Production`).
4. Asocia tu portafolio de negocios de Meta (Meta Business Account).

### 2.2 Agregar el Producto WhatsApp
1. En el panel de la app, busca el producto **WhatsApp** y haz clic en **Configurar**.
2. Dirígete a **WhatsApp** -> **Configuración de la API**.
3. En la sección **Meta Embedded Signup (Registro Integrado)**:
   - Configura el flujo para que cada nuevo negocio conecte su propio WABA.
   - Esto garantiza que Meta facture directamente al cliente (`billing_type: 'client_direct_meta'`).

### 2.3 Obtener Credenciales de Meta
- **App ID:** Visible en el encabezado de la app.
- **App Secret (`WHATSAPP_APP_SECRET`):** Ve a **Configuración de la app** -> **Básica** -> Haz clic en *Mostrar* en "Secreto de la app".
- **Token de Acceso de Usuario del Sistema (`WHATSAPP_SYSTEM_USER_TOKEN`):**
  1. Ve a tu **Business Manager** -> **Usuarios del sistema**.
  2. Crea un usuario del sistema (Rol: Administrador).
  3. Asígnale activos a la app y genera un token permanente con los permisos:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`

### 2.4 Configurar el Webhook
1. En el menú lateral de la app, ve a **WhatsApp** -> **Configuración**.
2. En la sección **Webhook**, haz clic en **Editar**:
   - **URL de devolución de llamada:** `https://<TU_DOMINIO_O_NETLIFY>.netlify.app/api/webhooks/whatsapp`
   - **Identificador de verificación (`WHATSAPP_VERIFY_TOKEN`):** Una cadena secreta aleatoria segura (ej. `mi_secreto_super_seguro_webhook_2026`).
3. Haz clic en **Verificar y guardar**. Meta enviará una solicitud GET de handshake que la plataforma responderá con `200 OK` devolviendo el `hub.challenge`.
4. En **Campos de webhook**, haz clic en **Administrar** y suscríbete al campo:
   - ✅ **`messages`**

---

## 🌐 PASO 3: Desplegar en Netlify

### 3.1 Conectar el Repositorio
1. Ingresa a [Netlify](https://app.netlify.com/) y haz clic en **"Add new site"** -> **"Import an existing project"**.
2. Conecta tu proveedor de Git (GitHub, GitLab, Bitbucket) y selecciona el repositorio `platform`.

### 3.2 Opciones de Compilación (Automático por `netlify.toml`)
Netlify detectará automáticamente el archivo `netlify.toml` ubicado en la raíz del monorepo:
- **Base directory:** `apps/web`
- **Build command:** `pnpm --filter @platform/web build`
- **Publish directory:** `apps/web/.next` (o `.next`)
- **Plugin:** `@netlify/plugin-nextjs`

### 3.3 Configurar Variables de Entorno en Netlify
Ve a **Site configuration** -> **Environment variables** y agrega las siguientes variables:

| Variable | Descripción | Ejemplo / Origen |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto en Supabase | `https://xyzcompany.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Llave anónima pública de Supabase | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Llave secreta con privilegios de admin | `eyJhbGciOi...` |
| `GEMINI_API_KEY` | API Key para Google Gemini 2.5 Flash | Obtenida en [Google AI Studio](https://aistudio.google.com/) |
| `WHATSAPP_VERIFY_TOKEN` | Token para el handshake del webhook | La misma cadena configurada en Meta |
| `WHATSAPP_APP_SECRET` | Secreto de la aplicación de Meta | Obtenido en Meta Developers |
| `WHATSAPP_SYSTEM_USER_TOKEN` | Token de usuario del sistema permanente | Token con permisos de mensajería |
| `NODE_VERSION` | Versión de Node.js en Netlify | `22` |
| `PNPM_VERSION` | Versión de pnpm | `9.15.4` |

4. Haz clic en **"Deploy site"**. Netlify compilará el monorepo y desplegará la aplicación en menos de 2 minutos.

---

## 🩺 PASO 4: Verificación Post-Despliegue (Health Check)

Una vez completado el despliegue, ejecuta el script de comprobación de salud en tu terminal local o entorno de CI:

```bash
# Ejecutar verificación completa de producción
pnpm test:health
```

El script verificará:
1. ✅ Existencia y formato de las variables de entorno.
2. ✅ Handshake criptográfico de Meta WhatsApp (`hub.challenge`).
3. ✅ Validación de firmas HMAC SHA-256 (`timingSafeEqual`).
4. ✅ Escudo de detección de Prompt Injection (DAN, System Overrides, Secret Harvest).
5. ✅ Limitador de tasa por ventana deslizante (Sliding Window Rate Limiter).
6. ✅ Corte estricto al 100% de cuota de tokens con handoff humano.

---

## 🔒 PASO 5: Crear el Primer Usuario Administrador (Platform Admin)

1. En el panel de Supabase, dirígete a **Authentication** -> **Users** y haz clic en **"Add user"**.
2. Ingresa correo y contraseña del superadministrador de la agencia.
3. En el **SQL Editor** de Supabase, asígnale el rol de `platform_admin`:

```sql
-- Reemplaza con el UUID del usuario recién creado
UPDATE auth.users 
SET raw_app_meta_data = raw_app_meta_data || '{"is_platform_admin": true, "user_role": "platform_admin"}'::jsonb
WHERE email = 'admin@agencia.com';
```

4. Ingresa a `https://<TU_DOMINIO>/login` con esas credenciales. El sistema te redirigirá automáticamente al **Platform Admin Dashboard** (`/platform/dashboard`), desde donde podrás aprovisionar inquilinos (`/platform/businesses`) y monitorear analíticas globales (`/platform/analytics`).

---

## 🔄 Procedimiento de Rollback y Recuperación

- **Frontend (Netlify):** En la pestaña **Deploys** de Netlify, haz clic en el despliegue anterior y selecciona **"Publish deploy"** para volver a la versión previa en segundos.
- **Base de Datos (Supabase):** Las migraciones en `supabase/migrations/` están versionadas secuencialmente. En caso de inconsistencia, aplica scripts de reversión o restaura un backup point-in-time desde **Database** -> **Backups**.
