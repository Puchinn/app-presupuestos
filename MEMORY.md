# MEMORY.md — Memoria del proyecto

> Este archivo lo lee y lo mantiene el agente. `AGENTS.md` tiene las reglas estables; aquí va lo que cambia.
> Si hay contradicción entre ambos, manda `AGENTS.md`. Ver "Protocolo de MEMORY.md" allí.

Última actualización: 2026-09-29 (T-001 ejecutada; mantenida por el agente)

## 1. Estado actual

**Qué existe hoy**

- Auth con Supabase (proxy.ts), `/login`.
- Dashboard en `/`.
- `/profile`: editar información del usuario.
- `/new-budget`: crear presupuestos.
- `/edit/[id]`: editar presupuestos con autoguardado (`useBudget`, debounce 800 ms). Incluye un sidebar que **todavía no trae ni muestra información**.
- Hay dos campos de estado: `status` (`draft | issued`, fiscal, con acción "Emitir") y `sent_status` (`draft | pending | sent | approved | rejected`, comercial). `sent_status` se muestra (badge, filtros del dashboard, banner) y **ya se puede cambiar desde la UI** (menú en la tarjeta del dashboard y en el header del editor).
- `@react-pdf/renderer` está instalado pero **no se usa en ningún lado**.

**Fuera de alcance por ahora**

- Envío de mails.
- Integración con AFIP.

## 2. Tareas

Formato: `T-XXX` · título · estado · notas. Estados: `pendiente`, `en curso`, `bloqueada`, `hecha`.
Las tareas se hacen de a una y con plan aprobado. El orden sugerido es de arriba hacia abajo.

### Pendientes

- **T-002** · Poblar el sidebar de `/edit/[id]` · pendiente
  Definir con el dueño qué información debe mostrar (ver Preguntas abiertas).
- **T-003** · Generar PDF con `@react-pdf/renderer` (documento reutilizable) · pendiente
  Componente del documento en `features/budget/components/`. Debe reutilizarse en vista previa, descarga y vista pública.
- **T-004** · Vista previa del PDF dentro de la app · pendiente
  Depende de T-003.
- **T-005** · Descargar el PDF · pendiente
  Depende de T-003.
- **T-006** · Vista pública de un presupuesto para el cliente (sin login) · pendiente
  Requiere decidir mecanismo de acceso y ajustar `proxy.ts` y RLS. Necesita migración: pedir aprobación. Ver Preguntas abiertas.
- **T-007** · Versión pública sin login que usa `localStorage` · pendiente
  Editor separado, sin Supabase. No debe tocar `useBudget` ni la persistencia actual. Requiere plan detallado antes de empezar.
- **T-008** · Manejo de errores en server actions (reemplazar `throw` por resultado tipado) · pendiente
  Migrar gradualmente, empezando por las acciones de presupuestos. Ver convención en `AGENTS.md`. Ya se hizo el mínimo de T-001: `changeSentStatus` devuelve resultado tipado y `updateBudget` usa `BudgetSchema.omit({ sent_status: true })` (sigue con `throw` y mensaje placeholder, falta el resto).
- **T-009** · Estados de carga y UI de error/vacío · pendiente
  Aplicar en dashboard, editor y perfil. Puede hacerse junto con T-008.

### En curso

_(ninguna)_

### Hechas

- **T-001** · Cambiar el `sent_status` de un presupuesto · hecha 2026-09-29
  Nueva server action `changeSentStatus` (resultado tipado, valida con `SentStatusSchema`, filtra por `id` y `user_id`) + componente `ChangeStatusMenu` (badge clickeable con menú de estados) en `budget-card` (dashboard) y `header-status` (editor). `updateBudget` ahora parsea con `BudgetSchema.omit({ sent_status: true })` y el autoguardado excluye `sent_status` del payload. No toca el `status` fiscal.

## 3. Preguntas abiertas (necesitan respuesta del dueño)

- **Sidebar (T-002):** ¿qué debe mostrar? (resumen de totales, estado, historial, datos del cliente, otra cosa)
- **Vista pública (T-006):** ¿acceso por link con token aleatorio o por el `id` del presupuesto? Recomendación a evaluar: token aleatorio, para que los ids no sean adivinables. ¿El cliente solo mira o también puede aprobar/rechazar?
- **Versión pública con localStorage (T-007):** ¿qué funciones debe tener respecto al editor con login? ¿Puede exportar a PDF? ¿Hay un camino para "migrar" el borrador local a una cuenta?
- ~~**Estados (T-001):** ¿transiciones válidas o libres?~~ Resuelta el 2026-09-29: libres (ver Decisiones).

## 4. Decisiones

Formato: fecha · decisión · porqué.

- 2026-09-29 · Solo pnpm (`pnpm exec`, `pnpm dlx`); nada de npm/npx. · Consistencia del lockfile y del entorno.
- 2026-09-29 · Flujo "plan primero, código después" para toda tarea que modifique archivos. · El dueño quiere revisar antes de ejecutar.
- 2026-09-29 · Sin envío de mails ni AFIP por ahora. · Fuera de alcance de esta etapa.
- 2026-09-29 · Los errores de server actions nuevas se devuelven como resultado tipado, no con `throw`. · Permite UI controlada ante fallos.
- 2026-09-29 · El documento PDF se construye una sola vez y se reutiliza (vista previa, descarga, vista pública). · Evitar duplicar el diseño.
- 2026-09-29 · T-001 opera solo sobre `sent_status`; el `status` fiscal (`issued`) queda fuera. · Emitir tiene implicancias propias (marca de agua, posible irreversibilidad) y no debe mezclarse con el seguimiento comercial.
- 2026-09-29 · Transiciones de `sent_status` libres (cualquiera a cualquiera), validadas solo con `SentStatusSchema`. · Es un flujo comercial donde se reabren negociaciones; las reglas rígidas hoy serían especulación. Revisable.
- 2026-09-29 · En el editor, `sent_status` se cambia solo con la acción dedicada, no por el autoguardado. · Evitar carreras entre el debounce de 800 ms y el cambio de estado.
- 2026-09-29 · `updateBudget` valida con `BudgetSchema.omit({ sent_status: true })`, no con `.partial()`. · En Zod 4 el `.default()` se aplica aunque el campo esté en `.optional()` o el schema sea `.partial()`: con un schema parcial faltaría el valor y zod lo rellenaría con `"draft"`, pisando el estado real. `omit` saca la clave del output y la columna queda intacta.

## 5. Bugs y deuda técnica

- `pnpm lint` en rojo de base: 3 errores `react-hooks/set-state-in-effect` en `components/editable-price.tsx`, `components/editable-quantity.tsx`, `hooks/use-mobile.ts`. Además warnings de `<img>` y variables sin usar. No urgente; no agregar errores nuevos.
- Server actions solo hacen `throw`, sin manejo de errores en la UI (cubierto por T-008/T-009).
- `updateBudget` sigue haciendo `throw` con un mensaje placeholder ("aaaca capo") y no filtra por `user_id` en el update (hoy lo cubre RLS, pero conviene filtrar igual como las demás acciones). T-001 ya cambió el parse a `BudgetSchema.omit({ sent_status: true })`; lo demás lo cubre T-008.
- Carpeta raíz `actions/` es un remanente pre-migración. Mover a `features/` de a poco, solo cuando se toque cada archivo y con plan aprobado.
- No hay tests ni CI. No agregar sin consultar.

## 6. Lecciones aprendidas

- Las URLs de storage se construyen siempre con `getPublicStorageUrl()`; concatenarlas a mano causó un bug.
- Cambiar una columna jsonb de `budgets` exige migración **y** actualizar el schema zod en el mismo cambio.
- Tocar el flujo de cookies o `getClaims()` en `lib/supabase/proxy.ts` puede desloguear usuarios al azar.
- Zod 4 (v4.6.2): `.default()` se ejecuta también dentro de `.optional()` y sobre `.partial()`. Si omitís un campo del payload para "no pisarlo", el default igual lo rellena en el parse. Para excluir una columna de un update, usá `.omit({ campo: true })` en el schema.

## 7. Notas del historial

- Hubo una versión temprana de la app que ya usaba `@react-pdf/renderer`; está en el historial de git. **No consultar el historial salvo que el dueño lo pida**: la implementación de PDF se hará de nuevo sobre el estado actual.

## 8. Registro

Una línea por tarea terminada: `YYYY-MM-DD · T-XXX · resultado`.

- 2026-09-29 · — · Creación de `AGENTS.md` y `MEMORY.md` iniciales.
- 2026-09-29 · T-001 · `changeSentStatus` + `ChangeStatusMenu` en dashboard y editor; autoguardado deja de escribir `sent_status`. `tsc`, `lint` (línea base) y `build` en verde.
