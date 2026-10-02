# Platform — Multi-Tenant AI Agent SaaS Platform

Plataforma SaaS para la creación, orquestación y administración de agentes de inteligencia artificial multi-empresa.

## 🚀 Arquitectura General

- **Frontend:** Next.js 15 (App Router) alojado en **Netlify** con separación de layouts mediante route groups `(platform)` y `(business)`.
- **Backend & Base de Datos:** **Supabase** (PostgreSQL con Row Level Security + Edge Functions Deno + Auth con Custom Access Token Hooks).
- **Capa de IA:** Orquestador multi-proveedor agnóstico con integración inicial para **Google Gemini** (`@google/genai`).
- **Canales de Comunicación:** Abstracción extensible (`packages/channels`), iniciando con **WhatsApp Cloud API** bajo el modelo **Meta Embedded Signup** (facturación directa con Meta por parte de cada cliente).

---

## 📁 Estructura del Monorepo

```
platform/
├── apps/
│   └── web/                   # Aplicación Next.js (Netlify)
│       ├── app/
│       │   ├── (platform)/    # Dashboard para la Agencia / Platform Admin
│       │   └── (business)/    # Dashboard para cada Negocio / Tenant
│       └── netlify.toml       # Configuración de despliegue en Netlify
│
├── packages/
│   ├── core/                  # Tipos TypeScript, interfaces y validaciones Zod
│   ├── ai/                    # Abstracción de IA, Orquestador y Proveedores
│   ├── tools/                 # Registro y ejecución controlada de Function Calling
│   └── channels/              # Adaptadores de canales (WhatsApp, etc.)
│
├── supabase/
│   ├── config.toml            # Configuración local de Supabase
│   ├── migrations/            # Migraciones SQL versionadas
│   └── functions/             # Supabase Edge Functions (Webhooks y API)
│
├── package.json               # Monorepo root
├── pnpm-workspace.yaml        # Definición de workspaces
└── turbo.json                 # Configuración de Turborepo
```

---

## 🛠️ Comandos de Desarrollo y Pruebas

### 1. Instalación y Compilación
```bash
# Instalar dependencias en todo el monorepo
pnpm install

# Compilar todos los paquetes y aplicaciones (Turborepo)
pnpm build

# Ejecutar el servidor de desarrollo local
pnpm dev
```

### 2. Pruebas Unitarias y de Integración (Vitest)
```bash
# Ejecutar todas las pruebas unitarias e integración en el monorepo (62 tests)
pnpm test

# Ejecutar pruebas de un paquete específico:
pnpm --filter @platform/core test      # Máquina de estados, memoria, rate limiter, quotas, audit
pnpm --filter @platform/ai test        # Prompt builder, Gemini adapter, prompt guard
pnpm --filter @platform/tools test     # Tool registry, context injection, order tools
pnpm --filter @platform/channels test  # Webhook processor, signature validator, WhatsApp client

# Prueba automatizada de Aislamiento Multi-Tenant (PostgreSQL RLS):
pnpm test:isolation
```

### 3. Pruebas End-to-End (Playwright)
```bash
# Ejecutar la suite completa de pruebas E2E en Chromium headless
pnpm test:e2e

# Ejecutar un flujo E2E específico:
pnpm --filter @platform/web exec playwright test e2e/auth-flow.spec.ts           # Flujo de login y auth
pnpm --filter @platform/web exec playwright test e2e/tenant-provisioning.spec.ts # Aprovisionamiento de inquilinos
pnpm --filter @platform/web exec playwright test e2e/agent-config.spec.ts       # Calibración del agente IA
pnpm --filter @platform/web exec playwright test e2e/live-inbox.spec.ts         # Live Inbox y handoff humano

# Modo interactivo con UI gráfica de Playwright:
pnpm --filter @platform/web exec playwright test --ui
```

### 4. Demostraciones de Seguridad y Hardening
```bash
# Demostración del escudo contra Prompt Injections, Rate Limiting y Cuotas de Tokens:
pnpm --silent tsx scripts/demo-security-hardening.ts
```

