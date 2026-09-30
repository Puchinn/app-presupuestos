<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# app-presupuestos

App de presupuestos/cotizaciones para usuarios hispanohablantes (textos de UI, comentarios y mensajes de error en español). Next.js 16 App Router + React 19 + Supabase + Tailwind v4 + zod. Un solo paquete: `pnpm-workspace.yaml` solo contiene una allow-list de builds, no hay workspaces.

## Antes de empezar cualquier tarea

1. Lee `MEMORY.md` completo (estado, tareas, decisiones, bugs, lecciones).
2. Lee la guía relevante de `node_modules/next/dist/docs/` si la tarea toca Next.js.
3. Sigue el flujo de trabajo de la sección "Flujo de trabajo".

## Reglas duras (nunca las rompas)

- **Solo pnpm.** Prohibido usar `npm`, `npx`, `yarn` o `bunx`, tanto para instalar como para ejecutar.
  - Ejecutar binarios: `pnpm exec <bin>` (ej: `pnpm exec tsc --noEmit`).
  - Herramientas de un solo uso: `pnpm dlx <paquete>` (ej: `pnpm dlx shadcn@latest add button`).
  - No crear ni commitear `package-lock.json` ni `yarn.lock`.
- **No instales dependencias sin preguntar.** Propón el paquete y el motivo en el plan y espera aprobación. (Excepción: `@react-pdf/renderer` ya está instalado.)
- **No crees ni edites migraciones SQL sin aprobación explícita**, y una migración siempre va junto con el cambio en el schema zod de `features/budget/types.ts`.
- **No borres archivos** ni hagas refactors fuera del alcance de la tarea sin preguntar.
- **No inventes un test runner** ni scripts nuevos en `package.json` sin preguntar.
- **Nunca uses una service-role key** ni pongas secretos en el código. Solo las dos variables públicas de `.env.local`.
- No toques el flujo de cookies + `getClaims()` de `lib/supabase/proxy.ts` (ver comentarios ahí).

## Flujo de trabajo: primero plan, después código

Para toda tarea que modifique archivos:

1. **Plan.** Responde con un plan y **detente**. No edites nada todavía. El plan debe incluir:
   - Objetivo en una frase.
   - Archivos que vas a crear/modificar (rutas exactas).
   - Pasos numerados y cortos.
   - Decisiones o dudas que necesiten mi respuesta.
   - Riesgos (migraciones, dependencias, cambios en auth, etc.).
2. **Espera mi OK explícito** ("dale", "aprobado", "hacelo"). Sin OK, no hay código.
3. **Ejecuta solo lo aprobado.** Si aparece algo nuevo a mitad de camino, para y consúltame.
4. **Verifica** (ver "Definición de terminado").
5. **Actualiza `MEMORY.md`** (ver "Protocolo de MEMORY.md").
6. **Reporta**: qué cambiaste, qué verificaste, qué quedó pendiente.

Excepción: preguntas, explicaciones y lectura de código no requieren plan.

## Comandos

- Gestor: **pnpm** (`packageManager: pnpm@11.20.0`). `pnpm dev` / `pnpm build` / `pnpm lint` (eslint flat config, sin argumentos).
- Typecheck: no hay script, usar `pnpm exec tsc --noEmit`. Hoy pasa limpio.
- **No hay test runner ni archivos de test.**
- `pnpm lint` está **en rojo de base**: 3 errores previos `react-hooks/set-state-in-effect` en `components/editable-price.tsx`, `components/editable-quantity.tsx`, `hooks/use-mobile.ts`, más warnings de `<img>` y variables sin usar. Es la línea base: no asumas que los rompiste tú, pero **nunca agregues errores nuevos**.
- No hay CI (`.github/` no existe) ni pre-commit hooks: lint y tsc solo corren si los corres tú.

## Definición de terminado

Una tarea está terminada solo si:

1. `pnpm exec tsc --noEmit` pasa sin errores.
2. `pnpm lint` no tiene errores ni warnings nuevos respecto a la línea base.
3. Si hubo UI: hay estado de carga, estado de error y estado vacío (ver "Manejo de errores").
4. Textos de usuario, comentarios y mensajes en español.
5. `MEMORY.md` actualizado.

Si no puedes verificar algo (por ejemplo, no puedes correr la app), dilo explícitamente. No afirmes que funciona sin haberlo comprobado.

## Arquitectura

- Alias `@/*` → raíz del repo; TS `strict`; Tailwind v4 vía PostCSS.
- Layout por dominio: `features/<dominio>/` contiene `actions.ts` (server actions, `"use server"`), `types.ts` (schemas zod + tipos inferidos) y, si hace falta, `components/`, `hooks/`, `context/`. Las páginas en `app/` son delgadas: llaman a una server action y renderizan componentes de la feature. **La lógica de negocio nueva va en `features/`**, no en `app/` ni en `lib/`.
- Toda server action vive dentro de su dominio en `features/<dominio>/actions.ts`. Ya no existe una carpeta raíz `actions/`; no la recrees.
- Estado del editor de presupuestos: `features/budget/context/context-provider.tsx` expone `useBudget`, que autoguarda con un `updateBudget` (server action) con debounce de 800 ms y expone `saveStatus`. No agregues un segundo estado ni otra capa de persistencia para editar presupuestos.
- Clientes Supabase: `lib/supabase/client.ts` (browser), `server.ts` (server actions), `proxy.ts` (auth/sesión). La auth corre en el **`proxy.ts`** de la raíz (renombre de middleware en Next 16; no existe `middleware.ts`). Redirige a `/login` a los no autenticados.
- Esquema de DB: SQL plano en `supabase/migrations/*.sql` con RLS habilitado; config local en `supabase/config.toml` (API 54321, DB 54322). `budgets` guarda `dates`, `services`, `participants`, `settings` como **jsonb**, reflejados por los schemas zod de `features/budget/types.ts`: un cambio de columna requiere migración **y** schema zod juntos. Agregar una clave _dentro_ de un objeto jsonb existente (ej. `settings`) no requiere migración, pero sí actualizar el schema zod declarando la clave nueva con `.default(...)`, para que las filas viejas se parseen bien.
- Env: `.env.local` define `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Rutas actuales

- `/login`: acceso (público).
- `/`: dashboard (autenticado).
- `/profile`: edición de datos del usuario.
- `/new-budget`: crear presupuesto.
- `/edit/[id]`: editar presupuesto (incluye sidebar).

Las rutas nuevas planificadas están en `MEMORY.md`. No las crees sin plan aprobado.

## Convenciones

- Español en textos de usuario, comentarios y errores.
- Helpers de formato en `lib/utils.ts`: `formatARS()` y `formatDate()`. date-fns usa locale `es` por defecto y cada `types.ts` llama `z.config(es())`.
- Imágenes: `lib/storage.ts` sube al bucket `public_images` bajo `<user_id>/<name>`. Construye siempre las URLs con `getPublicStorageUrl()` de `lib/utils.ts`; nunca concatenes URLs de storage a mano (bug pasado).
- shadcn/ui estilo `base-nova` sobre **`@base-ui/react` (no Radix)**, íconos lucide, alias en `components.json`. Genera componentes nuevos con `pnpm dlx shadcn@latest add <componente>`; no copies ejemplos de Radix.
- Un presupuesto tiene **dos campos de estado distintos**; no los mezcles:
  - `status` (`draft | issued`): estado **fiscal/de emisión**. Controla la marca de agua "Emitido" y la acción "Emitir presupuesto".
  - `sent_status` (`draft | pending | sent | approved | rejected`): estado **comercial/de negociación**. Es el que muestran `BadgeStatus`, los filtros del dashboard y `budget-banner`.
    Los valores se definen en los schemas zod (`SentStatusSchema`, etc.); no los dupliques como strings sueltos, deriva los tipos del schema. Ante la duda sobre el nombre o valores de una columna, el código y `supabase/migrations/` mandan sobre este texto.

## Manejo de errores (convención objetivo)

Hoy las server actions solo hacen `throw`. Para código **nuevo** (y al tocar código existente, si el plan lo incluye):

- Las server actions devuelven un resultado tipado en vez de lanzar, por ejemplo `{ ok: true, data } | { ok: false, error: string }`, con el mensaje de error en español.
- La UI siempre contempla: cargando, error (con opción de reintentar cuando aplique) y vacío.
- No cambies el contrato de acciones existentes sin que el plan lo diga, porque otros componentes dependen de ellas.

## Protocolo de MEMORY.md

`MEMORY.md` es la memoria del proyecto y **tú eres responsable de mantenerla**. Al terminar cada tarea (y antes de reportar):

- **Apenas recibas el OK a un plan, y antes de escribir código**, pega en la tarea de `MEMORY.md` el plan aprobado y las respuestas del dueño a tus decisiones (resumidos). Así cualquier sesión nueva puede retomar la tarea sin depender del historial del chat. Si quedó trabajo a medias, anota qué pasos están hechos.
- Mueve la tarea a "Hecho" con fecha y una línea de resumen, o actualiza su estado.
- Registra decisiones tomadas y su **porqué** en "Decisiones".
- Registra bugs encontrados (arreglados o no) en "Bugs y deuda técnica".
- Si aprendiste algo que evitaría repetir un error, súmalo a "Lecciones aprendidas".
- Agrega una línea al "Registro" con fecha, tarea y resultado.

Reglas de estilo: entradas cortas (1–3 líneas), sin duplicar lo que ya está en este archivo, no borres historial (tacha o mueve). Si algo en `MEMORY.md` contradice este archivo, **manda `AGENTS.md`**; avísame de la contradicción.

## Estilo de trabajo

- Cambios pequeños y enfocados. Una tarea, un objetivo.
- Reutiliza componentes y patrones existentes antes de crear nuevos.
- Si algo no está claro, pregunta antes de asumir. Máximo unas pocas preguntas concretas por vez.
- No comentes lo obvio; comenta el porqué de decisiones no evidentes.
