# Dossier de Arquitectura, Estado Técnico y Auditoría Externa: Plataforma "agilizio"

> **Destinatario del Documento:** Evaluador Técnico Senior / Staff Principal AI Architect (Gemini Argon / Claude Opus / Revisor Externo).  
> **Propósito:** Proporcionar un contexto arquitectónico exhaustivo, detallando lo construido, las decisiones de diseño tomadas, el roadmap inmediato y las preguntas clave para una auditoría rigurosa de código, seguridad y escalabilidad comercial.  
> **Repositorio Oficial:** `juanpamark/resilient-lavoiser` (Rama: `main`)  
> **Fecha de Elaboración:** Noviembre 2026  
> **Versión:** 1.2.0-Production-Ready  

---

## 1. Visión General del Negocio y Propuesta de Valor

**`agilizio`** es una plataforma B2B de comercio conversacional y agentes de inteligencia artificial diseñada para negocios de servicios locales (con enfoque inicial en **Gastronomía & Restaurantes**, expandible a Salud, Belleza y Servicios Profesionales).

### El Problema Operativo que Resuelve:
1. **Pérdida masiva de ventas en WhatsApp:** Los restaurantes pierden hasta el 40% de sus pedidos y reservas los fines de semana y fuera de horario comercial porque su personal está ocupado atendiendo mesas o cocina.
2. **Catálogos desactualizados:** Envían archivos PDF de 20 MB borrosos o desactualizados. Si un plato se agota a las 2:00 PM, los clientes lo piden, generando fricción con la cocina y cancelaciones de pedidos.
3. **Descuido de la Reputación en Google Maps:** El 80% de nuevos comensales los encuentran en Google Maps, pero los dueños nunca tienen tiempo de responder reseñas. Las opiniones de 1 estrella quedan sin gestionar y las de 5 estrellas no se capitalizan para SEO local.

### La Solución agilizio:
- **Agente de IA Omnicanal (WhatsApp & Web):** Actúa como anfitrión experto, explica platos, sugiere maridajes, calcula totales con exactitud matemática, gestiona reservas y toma pedidos.
- **Sincronización de Catálogo en Tiempo Real:** Un panel donde el dueño activa/desactiva la disponibilidad de cualquier plato en 1 segundo. Si se marca como "Agotado", la web muestra *"Agotado por hoy"* y el agente de IA **deja de ofrecerlo proactivamente**, explicando amablemente que se agotó y recomendando una alternativa de la misma categoría si el cliente insiste.
- **Bandeja en Vivo con Handoff Humano:** Permite al operador ver los chats en tiempo real y tomar el control del chat con un solo clic (silenciando al bot) si el cliente tiene una queja o solicita hablar con una persona.
- **Guardián de Reseñas de Google Maps con IA:** Monitorea opiniones y genera respuestas hiperpersonalizadas con IA en segundos para fidelizar comensales y potenciar el SEO local.

---

## 2. Pila Tecnológica (Tech Stack) y Estructura del Monorepo

El proyecto está estructurado como un **Monorepo moderno con Turborepo y pnpm workspaces**:

```
resilient-lavoisier/
├── apps/
│   └── web/                     # Aplicación Next.js 15 (App Router, React 19, Tailwind CSS, shadcn/ui)
│       ├── app/
│       │   ├── (business)/business/   # Panel de control del comerciante (Catálogo, Inbox, Pedidos, Canales, Agente, Analítica)
│       │   ├── (platform)/platform/   # Panel de administración de la plataforma (Superadmin)
│       │   ├── menu/[slug]/           # Sitio Web / Menú Digital público para comensales (SSR, optimizado para móvil)
│       │   └── api/
│       │       ├── agent/simulate/    # Motor de simulación y testing local del agente con function calling
│       │       └── webhooks/whatsapp/ # Webhook oficial de producción para Meta WhatsApp Cloud API
│       └── lib/
│           ├── actions/               # Server Actions (catalog, chat, agent, orders, reviews)
│           ├── realtime/              # Hooks y suscripciones a Supabase Realtime & Presence
│           └── supabase/              # Clientes de Supabase (browser, server con cookies, admin con service_role)
└── packages/
    ├── core/                    # Tipos de dominio, interfaces de estado, schemas Zod y validaciones
    ├── tools/                   # Registro modular de herramientas de IA (search_products, calculate_order, etc.)
    ├── ai/                      # Orquestador conversacional, Gemini API client, Prompt Builder y memory manager
    └── channels/                # Adaptadores de comunicación (Meta WhatsApp Cloud API client, HMAC validator)
```

### Tecnologías Clave:
- **Frontend / Framework:** Next.js 15 (App Router), React 19, Tailwind CSS, Radix UI / shadcn/ui, Lucide Icons, Recharts.
- **Base de Datos & Backend Serverless:** Supabase (PostgreSQL 15), Row Level Security (RLS), Supabase Realtime Channels & Presence, Supabase Auth con Custom Claims JWT (`business_id`, `role`).
- **Motor de Inteligencia Artificial:** Google Gemini (Gemini 3.5 Flash / Gemini Pro) vía Google Generative AI SDK, Function Calling declarativo estructurado.
- **Mensajería:** Meta WhatsApp Cloud API (Graph API v21.0) con verificación HMAC-SHA256 en webhooks y soporte para facturación directa del cliente (*client_direct_meta*).

---

## 3. Estado Actual de la Implementación (Lo que YA está Construido y Operativo)

1. **Catálogo y Control de Disponibilidad en Tiempo Real (`/business/catalog`):**
   - Lectura y escritura en tiempo real sobre la tabla `products` de Supabase.
   - Switch de 1 clic para alternar entre 🟢 **Disponible** y 🔴 **Agotado** (`is_available` e `is_active`).
   - Modal completo de Edición: Permite modificar nombre, precio en COP, categoría, descripción y SKU (almacenado en `metadata->>'sku'`).
   - Revalidación automática de rutas mediante `revalidatePath`.
2. **Sitio Web / Menú Digital Público (`/menu/[slug]`):**
   - Página pública server-side con metadata dinámica para SEO y redes sociales.
   - Diseño móvil primero para comensales.
   - Badges de disponibilidad en vivo: platos disponibles con botón *"Pedir por WhatsApp"*; platos agotados con badge rojo *"Agotado por hoy"* y pedido deshabilitado.
   - Botón flotante para chatear con el asistente de IA.
3. **Razonamiento de Disponibilidad en el Agente de IA (`agilizio`):**
   - Tanto en `/api/agent/simulate` como en `/api/webhooks/whatsapp`, la herramienta `search_products` retorna el campo `is_available`.
   - Instrucción estricta inyectada en el prompt: *Recomienda proactivamente ÚNICAMENTE platos con is_available: true; si el cliente pide uno agotado, informa amablemente y sugiere de inmediato alternativas disponibles de la misma categoría*.
4. **Seguridad y Tipado Estricto:**
   - 100% libre de errores de TypeScript (`tsc --noEmit` limpio en `apps/web` y `packages/ai`).
   - Middleware de Next.js protegiendo rutas privadas (`/business/*`, `/platform/*`) y permitiendo acceso libre a la ruta pública del menú (`/menu/*`).

---

## 4. Roadmap Inmediato (Lo que se Implementará a Continuación)

1. **Bandeja en Vivo Real (`/business/inbox`):**
   - Conectar la interfaz con las tablas `conversations` y `messages` de Supabase.
   - Reemplazar datos de prueba por el contexto real de Restaurante Santa Cruz (parrilla, eventos, reservas).
   - Máquina de estados para **Handoff Humano**: botón *"Tomar Control"* silencia al bot (`human_active`) y el input despacha mensajes reales al WhatsApp del comensal. Botón *"Liberar a la IA"* reactiva el bot (`active`).
2. **Gestión Real de Pedidos (`/business/orders`):**
   - La herramienta `create_order` persiste la orden en la tabla `orders` y sus detalles en `order_items`.
   - La pantalla muestra las comandas entrantes en tiempo real con selector de estado: *Pendiente ➔ En Preparación ➔ Despachado ➔ Entregado*.
3. **Módulo de Reseñas de Google Maps con IA (`/business/reviews`):**
   - Nueva pantalla en el panel para monitorizar la reputación del restaurante.
   - Análisis de sentimiento automático.
   - Generación de respuestas con IA:
     - **5 estrellas:** Gratitud, mención del plato y hospitalidad.
     - **1 a 3 estrellas:** Empatía, desescalamiento y desvío a canal privado de gerencia en WhatsApp.
   - Modo de envío: Auto-publicar para 5 estrellas o borrador asistido de 1 clic para revisión previa del dueño.
4. **Soporte para Notas de Voz (Audio):**
   - Ingesta de mensajes de audio en WhatsApp Cloud API (`type: 'audio'`), descarga del archivo de audio con bearer token y transcripción mediante Gemini Multimodal o Whisper para responder fluidamente.

---

## 5. Puntos Críticos y Criterios Específicos para la Auditoría de Gemini Argon

Solicitamos a **Gemini Argon** (o al evaluador técnico) realizar una auditoría exhaustiva enfocada en los siguientes 5 pilares:

### Pilar A: Arquitectura de Software y Código Limpio
1. ¿La separación de responsabilidades entre paquetes (`@platform/core`, `@platform/tools`, `@platform/ai`, `@platform/channels`, `apps/web`) es óptima o existen dependencias circulares / acoplamientos innecesarios?
2. ¿Cómo evaluarías la robustez del manejo de errores en los Server Actions de Next.js 15 y el uso de `revalidatePath` frente a llamadas de alta concurrencia?

### Pilar B: Seguridad, Aislamiento Multitenant y RLS
1. En Supabase, las políticas de Row Level Security (RLS) deben garantizar aislamiento estricto entre restaurantes (`business_id`). ¿Qué riesgos potenciales de fuga de datos identificas entre inquilinos si un usuario malicioso manipula el token o parámetros de consulta?
2. ¿El webhook de WhatsApp (`/api/webhooks/whatsapp`) cuenta con la protección adecuada contra ataques de denegación de servicio (DDoS) o falsificación de firmas HMAC?

### Pilar C: Resiliencia del Agente de IA y Prevención de Alucinaciones
1. **Protección matemática de órdenes:** El cálculo de totales se delega a `calculate_order` para evitar que el LLM invente precios. ¿Qué salvaguardas adicionales recomiendas para evitar que un cliente engañe al agente ("inyección de prompt") pidiéndole descuentos no autorizados?
2. **Cola de mensajes rápidos (Debounce):** Si un comensal envía 4 mensajes en 5 segundos por WhatsApp, ¿cuál es el mejor patrón arquitectónico en Next.js/Vercel (Upstash Redis, BullMQ, Inngest o Supabase Edge Functions) para acumular los mensajes antes de llamar a Gemini?

### Pilar D: Escalabilidad Operativa (De 1 a 50 Clientes)
1. Cada restaurante nuevo tendrá su propio número de WhatsApp y su propio menú. ¿Cómo debe evolucionar la ingesta del webhook para enrutar dinámicamente según el `recipient_phone_number_id` de Meta sin degradar la latencia?
2. ¿Cómo optimizar el consumo de tokens de Gemini para que el costo operativo por cliente no supere el 5% del valor de la suscripción mensual?

### Pilar E: Viabilidad del Módulo de Google Maps
1. Para responder reseñas de Google Maps: ¿Es preferible utilizar la API oficial de Google My Business (requiere verificación de app en Google Cloud) o apoyarse inicialmente en webhooks / automatizaciones intermedias (n8n/Make)?
2. ¿Cómo garantizar que las respuestas generadas por la IA no suenen robóticas y cumplan con las políticas de contenido de Google?
