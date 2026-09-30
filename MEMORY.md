# MEMORY.md — Memoria del proyecto

> Este archivo lo lee y lo mantiene el agente. `AGENTS.md` tiene las reglas estables; aquí va lo que cambia.
> Si hay contradicción entre ambos, manda `AGENTS.md`. Ver "Protocolo de MEMORY.md" allí.

Última actualización: 2026-09-30 (T-012 hecha: pestaña Cliente con selector y alta; decisiones de migración de clientes revertidas; mantenida por el agente)

## 1. Estado actual

**Qué existe hoy**

- Auth con Supabase (proxy.ts), `/login`.
- Dashboard en `/`.
- `/profile`: editar información del usuario.
- `/new-budget`: crear presupuestos.
- `/edit/[id]`: editar presupuestos con autoguardado (`useBudget`, debounce 800 ms). Incluye un sidebar de 5 pestañas: Servicios, Textos, Configuración y Cliente están cableadas (T-010, T-013a, T-013b, T-015, T-012); Info es solo lectura con checklist (falta T-016).
- Hay dos campos de estado: `status` (`draft | issued`, fiscal, con acción "Emitir") y `sent_status` (`draft | pending | sent | approved | rejected`, comercial). `sent_status` se muestra (badge, filtros del dashboard, banner) y **ya se puede cambiar desde la UI** (menú en la tarjeta del dashboard y en el header del editor).
- `@react-pdf/renderer` está instalado pero **no se usa en ningún lado**.

**Fuera de alcance por ahora**

- Envío de mails.
- Integración con AFIP.

**Hallazgos de la auditoría del sidebar (T-002, 2026-09-29, solo lectura)**

- Info: checklist = los 8 campos de `CheckEmpty` (`client_name`, `client_id`, `dates.sent`, `dates.estimated`, `services`, `logo_url`, `conditions`, `budget_details`); solo lectura y ya cableado. No valida la emisión: "Emitir presupuesto" no tiene `onClick` y `emitBudget` no llama `checkEmpty`.
- Servicios: "+ Ítem vacío" funciona (`createBlankService`); en `ServiceCard` no se pasan `onAdd`/`onUpdate`/`onDelete`, así que "Usar", "Guardar" y "Eliminar" del catálogo no hacen nada (destinos ya existen: `addService`, `updateService`, `deleteService`).
- Clientes: solo `client_name` escribe; Contacto/CUIT/email/dirección no tienen handler ni columna; `client_id` lo exige `CheckEmpty` pero no hay selector. Tabla `clients` + `ClientSchema` existen y **no hay ni una acción ni un componente** que la use.
- Textos: los 3 campos están comentados y referencian la API vieja `triggerAutoSave`; no existen `project_title`/`notes`/`payment_terms` (candidatos naturales: `budget_details`, `conditions`).
- Configuración: moneda/IVA/descuento/plazo comentados y sin columnas; en cambio los 4 toggles de `settings` sí tienen columna + schema y **nadie los modifica** (solo se leen en `budget-edit`).
- `useBudget`: 6 métodos sin uso en la UI (`addService`, `setBudget`, `addConditions`, `addDetailText`, `selectClient`, `cleanBudget`) y `status: "unsaved"` nunca se setea.
- `/profile`: 4 campos "Mock" + `BankSection` sin columna; `avatar_url` tiene columna sin UI; `updateUser` recibe `counters` completo (carrera con `emitBudget`).
- Esquema zod de `budgets` y columnas reales están 1:1. Sin migraciones nuevas ni dependencias.

## 2. Tareas

Formato: `T-XXX` · título · estado · notas. Estados: `pendiente`, `en curso`, `bloqueada`, `hecha`.
Las tareas se hacen de a una y con plan aprobado. El orden sugerido es de arriba hacia abajo.

### Pendientes

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
- **T-014** · Moneda, IVA, descuento y plazo de entrega · pendiente (diferida)
  Decidido: se difiere todo a T-014 y **mientras tanto se quitan esos controles de la UI** (hecho en T-015, 2026-09-30). El plazo de entrega probablemente sea `dates.estimated`. Cuando se retome: migración/schema y efecto en totales y PDF.
- **T-016** · Emisión: validación en servidor y checklist en dos niveles · pendiente
  Decidido: `emitBudget` valida en el servidor lo esencial (**razón social** y **al menos un servicio**); el checklist de Info pasa a dos niveles (esencial para emitir / recomendado) y **`client_id` sale del checklist**. El botón "Emitir presupuesto" no tiene `onClick` (nadie puede emitir desde la UI) y **T-016 se implementa junto con T-019**: no puede haber emisión sin bloquear la edición. Además (2026-09-30): el checklist **no debe exigir** `logo_url`, `conditions` ni `budget_details` si su toggle de `settings` está apagado.
- **T-017** · `/profile`: columnas reales y limpieza de UI · pendiente
  Decidido: **borrar `BankSection`**; los campos Mock pasan a columnas reales (estudio, CUIT, ciudad) → migración de `profiles` + `UserInfoSchema`; **email de solo lectura** desde `auth`; **`avatar_url` fuera** del formulario (la columna existe en DB y no se toca). Toca también el copy que promete datos bancarios.
- **T-019** · Presupuestos emitidos (`status === "issued"`): editor de solo lectura + marca de agua · pendiente (prioridad alta)
  Hoy el botón "Emitir presupuesto" (`header-status.tsx`) no tiene `onClick`, así que **no se puede emitir desde la UI**. **T-016 y T-019 se implementan juntas** (no emitir sin bloquear la edición). Cuando `status === "issued"`, `/edit/[id]` debe ser de solo lectura (campos, servicios, participantes, fechas) y la marca de agua "Emitido" debe mostrarse **también en el editor**, no solo en el PDF. El bloqueo debe validarse también en el **servidor**: `updateBudget` rechaza los cambios cuando `status === "issued"`.

### En curso

_(ninguna)_

### Hechas

- **T-001** · Cambiar el `sent_status` de un presupuesto · hecha 2026-09-29
  Nueva server action `changeSentStatus` (resultado tipado, valida con `SentStatusSchema`, filtra por `id` y `user_id`) + componente `ChangeStatusMenu` (badge clickeable con menú de estados) en `budget-card` (dashboard) y `header-status` (editor). `updateBudget` ahora parsea con `BudgetSchema.omit({ sent_status: true })` y el autoguardado excluye `sent_status` del payload. No toca el `status` fiscal.
- **T-002** · Auditoría y decisiones de diseño del sidebar de `/edit/[id]` · hecha 2026-09-29
  Auditoría de las 5 pestañas en solo lectura (tablas por campo, `useBudget`, `BudgetSchema` vs columnas, `/profile`, dominios, checklist) + decisiones de diseño registradas en §4. El cableado queda en T-010 a T-018. Cero cambios de código.
- **T-010** · Cablear "Usar" / editar / eliminar de `ServiceCard` en la pestaña Servicios · hecha 2026-09-30
  `ServiceCard` recibe `onAdd`/`onUpdate`/`onDelete` desde `tab-services.tsx`: "Usar" → `methods.addService` (ítem armado con solo `name/price/quantity/details`), "Guardar" → `updateService`, "Eliminar" → `deleteService` con confirmación en `DeleteAlertDialog`. La lista del catálogo **no** tiene estado local: se deriva de la prop del servidor y tras cada mutación se llama `router.refresh()` en un `useTransition`. `updateService`/`deleteService` devuelven `ServiceActionResult` (`{ ok: true } | { ok: false, error }`), `deleteService` usa `.select()` para detectar 0 filas afectadas. Feedback efímero (3 s) en la propia tarjeta para "Usar", "Servicio actualizado" y errores. Verificado con `tsc`, `lint` (línea base) y `build`; **no** se probó en el navegador.

  Plan aprobado 2026-09-30 (decisiones del dueño): unificar `new-servicecard.tsx` sobre el `Service` de `services-catalog` y borrar la interfaz local (verificado antes: `ServiceCard` solo se usa en `tab-services.tsx`, siempre con `id`); `updateService`/`deleteService` a resultado tipado, con `.select()` en el delete; **sin estado local** para la lista → `router.refresh()` en `useTransition` + `revalidatePath` apuntando a `/edit/[id]` (motivo: "Guardar este servicio" del documento agrega al catálogo con el sidebar abierto); borrado confirmado con `delete-alert-dialog.tsx`; feedback efímero sin dependencias nuevas; crear servicios desde el sidebar **fuera** de T-010; en "Usar" solo `name/price/quantity/details`.
  Verificado a mano por el dueño 2026-09-30: "Guardar este servicio" actualiza el sidebar con el sidebar abierto (no hizo falta el plan B de `router.refresh()`).

- **T-011** · Estados vacío/carga/error del catálogo y del sidebar · hecha 2026-09-30
  Lista vacía del catálogo queda en blanco. Ojo: `getServices()` devuelve `[]` tanto sin datos como con error, así que hoy no se puede distinguir vacío de fallo. Aprovechar para la biblioteca de fragmentos de T-013b.
  Plan aprobado 2026-09-30 (corre en el mismo lote que T-018 + T-013b):
  - `getServices()` pasa a **resultado tipado** (`ServiceListResult` en `features/services-catalog/types.ts`); único consumidor: `app/(budget)/edit/[id]/page.tsx`.
  - `page.tsx` → `SideBar` → tabs: propagar los resultados tipados (`services`, `texts`), no arrays crudos.
  - `tab-services.tsx`: estado **vacío** con `EmptyState` (`components/ui/empty-state.tsx`), estado **error** con texto + botón "Reintentar" (`router.refresh()`), estado **pendiente** usando el `isPending` del `useTransition` que hoy se descarta (`:21`).
  - La biblioteca de T-013b nace con sus propios estados vacío/error/carga (mismo patrón; plan completo en T-013b).
    Hecho 2026-09-30: `getServices()` y `getUserTexts()` devuelven resultado tipado (`ServiceListResult`/`TextListResult`: vacío ≠ error); `page.tsx` → `SideBar` → tabs propagan `services`/`texts` como resultados; `tab-services.tsx` y la biblioteca de `tab-texts.tsx` con estados **vacío** (`EmptyState`), **error** (aviso + "Reintentar" vía `router.refresh()`) y **pendiente** (`isPending` del `useTransition`, que antes se descartaba). Fuera de alcance: `error.tsx` por ruta y `app/(budget)/loading.tsx`. Verificado con `tsc`, `lint` (línea base, sin errores nuevos) y `build`; **no** se probó en el navegador.
- **T-013a** · Pestaña Textos: cablear `conditions` y `budget_details` · hecha 2026-09-30
  Partida de T-013 el 2026-09-30 (la biblioteca de fragmentos queda en T-013b). Mapeo decidido: "Términos de pago" → `conditions`, "Notas y alcance" → `budget_details`, **se borra** "Título o concepto principal".
  Plan aprobado 2026-09-30 (respuestas del dueño):
  - **Objetivo:** cablear los dos campos de la pestaña Textos con el patrón de `tab-client.tsx` y borrar el campo muerto de título.
  - **Archivos:** `features/budget/components/editor-sidebar/tab-texts.tsx` (reescribir), `editor-sidebar/tab-info.tsx` (alinear 1 etiqueta), `MEMORY.md`. **No** tocar `components/editable-field.tsx` (opción A), `types.ts`, `actions.ts` ni `budget-edit.tsx`. Sin migración ni dependencias nuevas.
  - **Pasos:** 1) pegar plan acá; 2) reescribir `tab-texts.tsx`: 2 `<textarea>` controlados → `methods.editBudgetInfo` (commit por tecla + debounce 800 ms), etiquetas del documento, subtítulo tipo pestaña; 3) línea atenuada "Oculto en el documento (se activa en Configuración)" cuando el toggle de `settings` respectivo esté apagado; 4) alinear `tab-info.tsx` ("Detalles…" → "Detalle del presupuesto"; **verificado antes**: es solo texto visible de `FIELD_LABELS`, no se toca el matching por clave); 5) `tsc`, `lint` (línea base), `build`.
  - **Decisiones del dueño:** **textarea siempre visible y controlado** en el sidebar (no `EditableField`) — "para escribir en el sidebar el campo del documento pierde el foco y commitea antes, así que los dos editores no coexisten"; **opción A**: no tocar `components/editable-field.tsx`; etiquetas del sidebar = **"Condiciones de pago"** y **"Detalle del presupuesto"** (las de `budget-edit.tsx:245/:273`); agregar el aviso atenuado del toggle; sin dependencias nuevas.
  - **Verificación:** `tsc`, `lint` contra la línea base, `build`; sin prueba en navegador.
    Hecho 2026-09-30: `tab-texts.tsx` reescrito con 2 `<textarea>` siempre visibles y controlados → `methods.editBudgetInfo` (commit por tecla + autoguardado 800 ms), etiquetas iguales al documento, aviso "Oculto en el documento (se activa en Configuración)" cuando el toggle está apagado y borrado el campo "Título o concepto principal" (con los comentarios de la API vieja `triggerAutoSave`). Etiqueta de `tab-info.tsx` alineada (solo texto visible; el matching por clave de `CheckEmpty` no cambia). `EditableField` sin tocar. Verificado con `tsc`, `lint` (línea base, sin errores nuevos) y `build`; **no** se probó en el navegador.
- **T-013b** · Biblioteca de fragmentos (`text_items`) · hecha 2026-09-30
  Partida de T-013 (2026-09-30). Inserta el fragmento **al final** del campo elegido (nunca pisa lo escrito). Depende de T-018 (mover `getUserTexts` a `features/text-item` y completar actions) y conviene alinearla con T-011 (estados vacío/error). Hoy el botón "Guardar" de `budget-edit.tsx` ya llama `createTextItem`, pero no hay UI que lea la biblioteca.
  Plan aprobado 2026-09-30 (respuestas del dueño; corre junto con T-018 y T-011):
  - **Objetivo:** lista de fragmentos en la pestaña Textos que inserta al final del campo elegido, con estados vacío/error/carga.
  - **Archivos:** `features/budget/components/editor-sidebar/tab-texts.tsx` (agregar biblioteca), `editor-sidebar/sidebar.tsx` y `app/(budget)/edit/[id]/page.tsx` (propagar listas), `features/budget/components/budget-edit.tsx` (feedback de los botones "Guardar"), `MEMORY.md`. El resto de archivos en T-018 y T-011.
  - **Pasos:** 1) pegar plan acá; 2) actions de `text-item` (T-018); 3) `getServices()` tipado (T-011); 4) propagar `texts`/`services` por `page.tsx` → `SideBar` → tabs; 5) biblioteca en `tab-texts.tsx`: selector de destino arriba (**opción A**: "Insertar en: Condiciones / Detalle", por defecto Condiciones) + botón "Insertar" por fila que concatena `\n` + fragmento vía `methods.editBudgetInfo` (nunca pisa), estados vacío (`EmptyState`) / error (con "Reintentar") / pendiente (`isPending`), borrado con `DeleteAlertDialog` + aviso efímero de 3 s; 6) feedback efímero en los 2 botones "Guardar" del documento (`budget-edit.tsx`, hoy lanzan la promise sin await ni aviso); 7) `tsc`, `lint` (línea base), `build`.
  - **Decisiones del dueño:** **opción A** (selector de destino + un botón "Insertar" por fila, no dos botones por fila); **sin edición inline** de fragmentos (`updateTextItem` queda creada en T-018 pero sin UI); **feedback sí** en los "Guardar" del documento; orden de la lista `created_at` descendente (como el catálogo); separador `\n` al insertar; destino por defecto "Condiciones".
  - **Fuera de alcance:** `app/(budget)/loading.tsx` (dice `"loadingg"`; sin respuesta del dueño en el plan, queda como deuda), `error.tsx` por ruta, edición de fragmentos, columna `field` en `text_items` (habría que migrar).
  - **Verificación:** `tsc`, `lint` contra la línea base, `build`; sin prueba en navegador.
    Hecho 2026-09-30: biblioteca en `tab-texts.tsx` — selector "Insertar en" (defecto Condiciones, opción A), botón "Insertar" por fila que concatena `\n` al final vía `editBudgetInfo` (nunca pisa), borrado con `DeleteAlertDialog` + aviso efímero de 3 s, estados vacío/error/carga; los botones "Guardar" de `budget-edit.tsx` ahora hacen `await createTextItem(...)`, muestran aviso efímero por sección (`print:hidden`) y refrescan con `router.refresh()` en `useTransition`. Verificado con `tsc`, `lint` (línea base, sin errores nuevos) y `build`; **no** se probó en el navegador.
- **T-015** · Controles para los toggles de `settings` · hecha 2026-09-30
  Hecho: `tab-settings.tsx` reescrito con 4 `Switch` (componente nuevo `components/ui/switch.tsx` de shadcn, `pnpm dlx shadcn@latest add switch`; el CLI solo creó ese archivo) y se borraron los controles muertos de moneda/IVA/descuento/plazo; nuevo `editSetting(clave, valor)` en `useBudget` con merge anidado; pestaña renombrada a "Configuración" con subtítulo "Qué se muestra en el documento". Persiste por el autoguardado normal (el payload ya incluía `settings`). Verificado con `tsc`, `lint` (línea base, sin errores nuevos) y `build`; **no** se probó en el navegador.
  Decidido (2026-09-29): claves **sin migración**, solo agregarlas al schema zod con `.default(...)` (regla de AGENTS.md sobre jsonb). `settings` guarda únicamente opciones de visualización: nada de IVA, moneda ni descuento acá.
  Plan aprobado 2026-09-30:
  - **Objetivo:** cablear los 4 toggles de `settings` en la pestaña del sidebar y quitar los controles muertos diferidos a T-014 (moneda, IVA, descuento, plazo).
  - **Archivos:** `features/budget/components/editor-sidebar/tab-settings.tsx` (reescribir), `features/budget/hooks/use-budget.ts` (método nuevo `editSetting`), `features/budget/components/editor-sidebar/sidebar.tsx` (etiqueta + subtítulo). Sin migración y sin tocar `types.ts`, `actions.ts` ni `budget-edit.tsx`.
  - **Pasos:** 1) borrar los 4 bloques muertos; 2) agregar 4 filas de toggle; 3) persistencia vía autoguardado (el payload ya incluye `settings` y `updateBudget` lo parsea con `BudgetSchema`).
  - **Respuestas del dueño:** **opción B** → `editSetting(clave, valor)` en `useBudget` con update funcional anidado (clave tipada `keyof` de settings, valor booleano); **Switch de shadcn** con `pnpm dlx shadcn@latest add switch` y revisar `git status` después (si el CLI toca algo más que el componente nuevo, detenerse y avisar); pestaña renombrada a **"Configuración"** con subtítulo **"Qué se muestra en el documento"**; los textos de los toggles son **los encabezados de sección de `budget-edit.tsx`**, no los del plan.
  - **Fuera de alcance:** la limitación del `ImageUpload` (ver §5).
  - **Verificación:** `tsc`, `lint` contra la línea base, `build`; sin prueba en navegador.
- **T-018** · Mover `getUserTexts` a `features/text-item` y completar actions de `text_items` · hecha 2026-09-30
  Hoy vive en `features/services-catalog/actions.ts`; faltan update, delete y list consumido. Es el cimiento de la biblioteca de T-013b.
  Plan aprobado 2026-09-30 (ver plan completo en T-013b; corre junto con T-011 y T-013b):
  - **Archivos:** `features/text-item/types.ts` (agregar `TextListResult` y `TextActionResult`), `features/text-item/actions.ts` (reescribir), `features/services-catalog/actions.ts` (borrar `getUserTexts` e import de `TextItem`, `getServices()` a resultado tipado), `features/services-catalog/types.ts` (`ServiceListResult`).
  - **Acciones nuevas/completadas:** `getUserTexts` (movido, orden `created_at` desc, resultado tipado distinguiendo vacío de error), `createTextItem` (de `throw` a resultado tipado + `revalidatePath` corregido: `"/edit"` no matchea; ahora `/(budget)/edit/[id]` con `type: "page"`), `updateTextItem` (nueva, **sin UI** por decisión del dueño), `deleteTextItem` (nueva, `.select()` para detectar 0 filas, patrón de `deleteService`).
  - **Sin migración:** la RLS de `text_items` ya habilita los 4 permisos (`20260913000000_create_entities_tables.sql:95-109`); `user_id` siempre de `auth.getUser()` + `.eq("user_id")` además del RLS.
  - **Verificación:** `tsc`, `lint` contra la línea base, `build`; sin prueba en navegador.
    Hecho 2026-09-30: `getUserTexts` movido a `features/text-item/actions.ts` (orden `created_at` desc, resultado tipado); `createTextItem` pasó de `throw`/retorno silencioso a `TextActionResult` con `revalidatePath` corregido (antes `"/edit"`, no matcheaba la ruta real); nuevas `updateTextItem` (sin UI) y `deleteTextItem` (con `.select()` para detectar 0 filas); borrado `getUserTexts` de `services-catalog/actions.ts` (0 consumidores) con su import cruzado de `TextItem`. Sin migración: la RLS de `text_items` ya tiene los 4 permisos. Verificado con `tsc`, `lint` (línea base, sin errores nuevos) y `build`; **no** se probó en el navegador.

- **T-012** · Pestaña Cliente: selector y alta de clientes · hecha 2026-09-30
  Plan aprobado 2026-09-30 (respuestas del dueño; **cambios importantes** sobre el plan original):
  - **Objetivo:** elegir un cliente existente de la tabla `clients` (copiando su nombre al presupuesto) y crear uno nuevo desde la pestaña Cliente.
  - **Sin migración:** no se crean `cuit`, `contact` ni `address`; esos datos se difieren (probablemente hasta el PDF). Verificado antes de implementar: `clients.email` **es nullable** (`20260913000000_create_entities_tables.sql:9`), así que el alta inserta solo `user_id` + `name`.
  - **Archivos:** crear `features/clients/types.ts` (`ClientSchema` movido desde `features/user/types.ts`, solo con los campos que existen, + `ClientActionResult`/`ClientListResult`) y `features/clients/actions.ts` (`getClients()`, `createClient()`, resultado tipado); modificar `features/user/types.ts` (borrar `ClientSchema`), `features/budget/hooks/use-budget.ts:6` (import de `Client`), `app/(budget)/edit/[id]/page.tsx`, `features/budget/components/editor-sidebar/sidebar.tsx`, `features/budget/components/editor-sidebar/tab-client.tsx` (reescribir), `MEMORY.md`.
  - **Pasos:** 1) pegar plan acá; 2) types + actions de `features/clients/`; 3) arreglar el import roto y borrar de `features/user/types.ts`; 4) propagar `clients` por `page.tsx` → `SideBar` → `TabClient`; 5) reescribir `tab-client.tsx`; 6) `tsc`, `lint` (línea base), `build`.
  - **UI:** se **borran los 4 inputs muertos** (Contacto, CUIT, email, dirección); **no** hay ficha de solo lectura. `client_name` siempre editable y **no** modifica el cliente guardado. Lo que se escribe en `client_name` **filtra la lista** en el cliente (sin dependencias ni segundo input). Lista estilo catálogo de servicios con botón **"Elegir"** → `methods.selectClient`. Estados vacío (`EmptyState`), error (aviso + "Reintentar") y pendiente (`isPending`) con el patrón de `tab-services.tsx`.
  - **Alta:** botón **"Guardar como cliente"** junto al campo `client_name`, **deshabilitado** si el nombre está vacío o si ya está vinculado a un cliente con ese nombre. `createClient(name)`: `user_id` de la sesión, compara el nombre **sin distinguir mayúsculas ni espacios sobrantes** y, si ya existe, **vincula el existente** en vez de duplicar; en la UI hace `selectClient` + `router.refresh()`.
  - **Vínculo:** mostrar **"Vinculado a: X"** + botón **"Quitar vínculo"**, que deja `client_id` vacío **sin tocar** `client_name`. Verificado: en el estado de UI el vacío es `""` (`UIBudgetSchema` transforma `null` → `""`, `types.ts:41-45`) y `BudgetSchema` lo convierte a `null` al guardar (`types.ts:78-81`); el único `BudgetProvider` usa el presupuesto de `getById` (siempre `string`), `DEFAULT_BUDGET` trae `null` pero no se usa en esa ruta.
  - **Fuera de alcance:** migración y columnas nuevas, editar o borrar clientes, el checklist de Info (T-016 no se toca).
  - **Verificación:** `tsc`, `lint` contra la línea base, `build`; sin prueba en navegador.
    Hecho 2026-09-30: nuevo dominio `features/clients/` (`types.ts` con `ClientSchema` movido + resultados tipados; `actions.ts` con `getClients()` ordenado por nombre y `createClient()` que vincula el existente si el nombre ya existe, comparando en el servidor con `trim().toLowerCase()`); `ClientSchema`/`Client` borrados de `features/user/types.ts` y `use-budget.ts` reapuntado; `clients` propagado `page.tsx` → `SideBar` → `TabClient`; `tab-client.tsx` reescrito (los 4 inputs muertos borrados, `client_name` filtra la lista, "Guardar como cliente", "Vinculado a: X" + "Quitar vínculo" → `client_id: ""`, estados vacío/error/pendiente). Verificado con `tsc`, `lint` (línea base, sin errores nuevos) y `build`; **no** se probó en el navegador.

## 3. Preguntas abiertas (necesitan respuesta del dueño)

- ~~**Sidebar (T-002):** ¿qué debe mostrar?~~ Resuelta 2026-09-29 (ver Decisiones: clientes, textos, config, settings, emisión, perfil). Sin respuesta: si el sidebar debe poder **crear** servicios nuevos en el catálogo (no solo usar/editar/borrar) y si los campos duplicados con el documento (cliente, condiciones, detalle) se quedan en ambos lados.
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
- 2026-09-29 · Clientes: tabla `clients` **reutilizable** (una vez por cliente), `client_id` **opcional** y `client_name` alcanza para emitir; al elegir un cliente se copia su nombre al presupuesto. · Reutilizar datos entre presupuestos sin exigir la asociación.
- 2026-09-29 · Clientes: ~~migración nueva (CUIT, dirección, contacto)~~ **derogado 2026-09-30 (sin migración)** + dominio `features/clients/`, moviendo `ClientSchema` desde `features/user`. Fase 1: solo **elegir y crear**. · Mantener el dominio acotado; editar/borrar clientes después. Ver decisión del 2026-09-30 sobre la migración.
- 2026-09-29 · Textos: "Términos de pago" → `conditions`, "Notas y alcance" → `budget_details`; se **borra** "Título o concepto principal". · Ya existen esas columnas: cero migración y cero duplicados con el documento.
- 2026-09-29 · La biblioteca de fragmentos (`text_items`) inserta el texto **al final** del campo elegido. · Nunca pisar lo que el usuario ya escribió.
- 2026-09-29 · Moneda, IVA, descuento y plazo de entrega se **diferían a T-014** y sus controles se quitan de la UI hasta entonces; el plazo probablemente sea `dates.estimated`. · No dejar controles que no hacen nada.
- 2026-09-29 · Claves nuevas dentro de `settings`: **sin migración**, solo la clave nueva en el schema zod con `.default(...)` (regla de AGENTS.md sobre jsonb). `settings` guarda únicamente **opciones de visualización**. · Separar lo visual de lo que afecta cálculos.
- 2026-09-29 · Emisión: `emitBudget` valida en el **servidor** lo esencial (razón social y al menos un servicio); el checklist de Info pasa a **dos niveles** (esencial para emitir / recomendado) y `client_id` sale del checklist. · Con `client_id` opcional no puede ser requisito; lo crítico se valida donde no se puede saltar.
- 2026-09-29 · Perfil: borrar `BankSection`; los campos Mock pasan a columnas reales (estudio, CUIT, ciudad); email de **solo lectura** desde `auth`; `avatar_url` queda fuera del formulario. · No mostrar ni prometer datos que no se guardan.
- 2026-09-30 · El catálogo en el sidebar **no** tiene estado local: se deriva de la prop del servidor y se refresca con `router.refresh()` en un `useTransition`. · "Guardar este servicio" del documento agrega al catálogo con el sidebar abierto; una copia local quedaría desactualizada.
- 2026-09-30 · `revalidatePath` de `services-catalog` usa `"/(budget)/edit/[id]"` con `type: "page"`. · La etiqueta se compara contra `definition.page`, que **conserva** el route group; pasar la URL visible (`/edit/[id]`) no matchea.
- 2026-09-30 · "Usar" del catálogo arma el ítem con solo `name`, `price`, `quantity`, `details` (nunca el objeto completo). · El catálogo tiene `id` y `user_id`; no deben viajar al presupuesto (snapshot). Por eso `addService` ahora recibe `Omit<Service, "id">`.
- 2026-09-30 · El feedback de "Usar"/guardar/borrar vive en la propia `ServiceCard` (texto efímero de 3 s), sin librería de toasts. · No hay ningún sistema de avisos en el proyecto y el plan prohibía dependencias nuevas.
- 2026-09-30 · T-015: los toggles se escriben con `editSetting(clave, valor)` (merge anidado en `setBudgetState`), no con `editBudgetInfo({ settings })`, que haría merge shallow y pisaría el objeto entero. · Seguridad contra estados obsoletos; costo: un método aditivo en `useBudget`.
- 2026-09-30 · T-015: textos de los toggles = encabezados/textos de `budget-edit.tsx`: "Logo", "Conoce mis trabajos", "Condiciones de pago", "Detalle del presupuesto" ("Logo" lo eligió el dueño porque ese bloque no tiene encabezado en el documento). · Que lo que se apaga coincida con lo que el usuario ve en el documento.
- 2026-09-30 · T-016 y T-019 se implementan **juntas** y el bloqueo de presupuestos emitidos se valida en el **servidor**: `updateBudget` rechaza cambios si `status === "issued"`. · Emitir sin bloquear la edición dejaría un presupuesto inmutable en DB pero editable en pantalla; el chequeo solo en cliente no alcanza porque el autoguardado escribe directo.
- 2026-09-30 · T-013a: campos de texto del sidebar con **textarea siempre visible y controlado** (patrón `tab-client.tsx`), no `EditableField`; `components/editable-field.tsx` queda intacto (opción A). · Del dueño: "para escribir en el sidebar el campo del documento pierde el foco y commitea antes, así que los dos editores no coexisten"; un espejo local extra solo agregaría desincronización.
- 2026-09-30 · T-013a: etiquetas de la pestaña Textos = **"Condiciones de pago"** y **"Detalle del presupuesto"** (las de `budget-edit.tsx`); se alineó `tab-info.tsx` ("Detalles…" → "Detalle…"). · Que lo editable, el checklist y los toggles de Configuración digan lo mismo.
- 2026-09-30 · T-013a: si el toggle de `settings` de un campo está apagado, el sidebar muestra **"Oculto en el documento (se activa en Configuración)"** bajo la etiqueta. · Avisar sin bloquear la edición (los toggles son "qué se muestra", no "qué existe"); sin dependencias nuevas.
- 2026-09-30 · T-013b: destino del insert con **selector "Insertar en"** arriba de la biblioteca (opción A del dueño, defecto "Condiciones"), no dos botones por fila. · Sin columna `field` en `text_items` (habría que migrar) la biblioteca es única y el destino se elige al insertar; un botón por fila mantiene la fila liviana.
- 2026-09-30 · T-013b/T-018: **sin edición inline** de fragmentos (`updateTextItem` queda creada sin UI); los botones "Guardar" del documento dan **aviso efímero de 3 s** por sección + `router.refresh()`. · Sin feedback el usuario nunca veía que se guardó y la biblioteca del sidebar quedaba vieja.
- 2026-09-30 · T-011: `getServices`/`getUserTexts` a **resultado tipado** (`{ ok, data } | { ok, error }`) en vez de `[]` en fallo; estados vacío (`EmptyState`), error (aviso + "Reintentar") y pendiente (`isPending`) en las listas. · `[]` no distinguía vacío de error y la lista vacía se veía en blanco.
- 2026-09-30 · T-013b: separador `\n` al insertar un fragmento y orden de la biblioteca `created_at` descendente (igual que el catálogo). · Los fragmentos son párrafos y los nuevos deben verse arriba.
- 2026-09-30 · T-012: **sin migración**; `cuit`, `contact` y `address` no se crean y se difieren hasta que haga falta (probablemente el PDF). · Evita una migración que hoy no consume nadie.
- 2026-09-30 · T-012: se **borran** los 4 inputs muertos de la pestaña Cliente (Contacto, CUIT, email, dirección) y **no** hay ficha de solo lectura; `client_name` es el único campo editable. · Esos datos no tienen columna ni dónde persistirse.
- 2026-09-30 · T-012: el texto de `client_name` **filtra la lista** de clientes en el cliente (sin segundo input y sin dependencias). · Un campo de búsqueda extra competiría con el campo que ya existe.
- 2026-09-30 · T-012: el alta es un botón **"Guardar como cliente"** (sin formulario): deshabilitado si el nombre está vacío o si ya hay vínculo con ese nombre; `createClient` compara el nombre **sin distinguir mayúsculas ni espacios sobrantes** y vincula el existente en vez de duplicar; `user_id` sale de la sesión. · Evita duplicados por diferencias de tipeo.
- 2026-09-30 · T-012: "Quitar vínculo" deja `client_id: ""` **sin tocar** `client_name`. · En el estado de UI el vacío es `""` (`UIBudgetSchema`), que `BudgetSchema` convierte a `null` al guardar; así el nombre escrito a mano se conserva.
- 2026-09-30 · T-012: `client_name` es siempre editable y **no** modifica el cliente guardado en `clients`. · El presupuesto guarda un nombre propio (snapshot); editar la ficha del cliente queda para después.

## 5. Bugs y deuda técnica

- `pnpm lint` en rojo de base: 3 errores `react-hooks/set-state-in-effect` en `components/editable-price.tsx`, `components/editable-quantity.tsx`, `hooks/use-mobile.ts`. Además warnings de `<img>` y variables sin usar. No urgente; no agregar errores nuevos.
- Server actions solo hacen `throw`, sin manejo de errores en la UI (cubierto por T-008/T-009).
- `updateBudget` sigue haciendo `throw` con un mensaje placeholder ("aaaca capo") y no filtra por `user_id` en el update (hoy lo cubre RLS, pero conviene filtrar igual como las demás acciones). T-001 ya cambió el parse a `BudgetSchema.omit({ sent_status: true })`; lo demás lo cubre T-008.
- Carpeta raíz `actions/`: **ya no existe** (AGENTS.md advierte no recrearla). ~~`getUserTexts` mal ubicado y `text_items` incompleto~~ (resuelto en T-018, 2026-09-30).
- UI muerta sin handler (auditoría T-002): botón "Emitir presupuesto" y "Vista previa" (`header-status.tsx`), ~~"Usar"/"Guardar"/"Eliminar" de `ServiceCard`~~ (cableados en T-010), los 4 inputs de la pestaña Cliente menos `client_name`, ~~los 3 campos de Textos~~ (cableados en T-013a: quedan 2, se borró el de título) y ~~los 5 de Configuración~~ (los 4 toggles cableados en T-015; los controles muertos de Configuración se borraron, diferidos a T-014), y 4 campos "Mock" + `BankSection` en `/profile`.
- `DeleteAlertDialog` cierra el diálogo siempre que `onConfirm` resuelva, incluso si el borrado falló; el error queda visible solo como aviso efímero en la tarjeta. No se tocó el componente compartido en T-010.
- Limitación conocida (queda fuera de T-015, anotada 2026-09-30): al apagar `show_logo_url` o `show_footer_url`, `budget-edit.tsx` oculta también el `ImageUpload`, así que no se puede cambiar la imagen sin reactivar el toggle.
- `editBudgetInfo` acepta `status`, `sent_status`, `public_code` y `settings`: hoy ningún control abusa, pero nada lo impide (el autoguardado escribiría esas columnas).
- Tabla `budget_items` (migración 1): **huérfana** — sin types, sin actions, sin componentes; además en `text_items` se le borró `budget_item_id` en la migración 2, así que nadie la referencia. Decidir si se usa o se elimina (borrar tabla = migración, pedir aprobación).
- No hay tests ni CI. No agregar sin consultar.
- `updateTextItem` (T-018) existe **sin UI**: decisión del dueño (sin edición inline de fragmentos); no es código muerto olvidado.
- `app/(budget)/loading.tsx` muestra `"loadingg"` (texto placeholder con typo). Quedó fuera de T-011 sin respuesta del dueño; arreglar de una línea cuando se toque.

## 6. Lecciones aprendidas

- Las URLs de storage se construyen siempre con `getPublicStorageUrl()`; concatenarlas a mano causó un bug.
- Cambiar una columna jsonb de `budgets` exige migración **y** actualizar el schema zod en el mismo cambio. Nuancia (T-002): agregar una clave _dentro_ de `settings` no rompe la columna, pero sí hay que tocar el schema zod, porque `z.object` descarta claves desconocidas al parsear.
- Tocar el flujo de cookies o `getClaims()` en `lib/supabase/proxy.ts` puede desloguear usuarios al azar.
- Zod 4 (v4.6.2): `.default()` se ejecuta también dentro de `.optional()` y sobre `.partial()`. Si omitís un campo del payload para "no pisarlo", el default igual lo rellena en el parse. Para excluir una columna de un update, usá `.omit({ campo: true })` en el schema.
- En los `DropdownMenu` de Base UI, `DropdownMenuLabel` y `DropdownMenuRadioGroup` deben ir dentro de un `DropdownMenuGroup` (o el label dentro del propio `DropdownMenuRadioGroup`); sin ese padre falta `MenuGroupContext` y la app se detiene con el error en runtime "MenuGroupContext is missing".
- `revalidatePath(ruta, "page")` en Next 16 se etiqueta contra `definition.page`, que **incluye el route group** (p. ej. `/(budget)/edit/[id]/page`); la URL visible no sirve. Verificado en `node_modules/next/dist/build/templates/app-page-runtime.js` + `shared/lib/router/utils/app-paths.js`. Aun así, cualquier `revalidatePath` desde una server action setea `pathWasRevalidated` y el cliente refresca la ruta actual aunque la etiqueta no matchee.
- `router.refresh()` (Next 16) re-renderiza los Server Components **sin** perder el `useState` de los client components (ver `docs/.../use-router.md`): sirve para refrescar props del servidor —como el catálogo del sidebar— sin reiniciar `useBudget` ni perder ediciones pendientes del editor.
- No existe ningún sistema de toasts/avisos en el proyecto; el "estado de guardado" más cercano es `SaveStatusIndicator` (`status-indicator.tsx`), que lee el `status` del contexto y no sirve para avisos efímeros de otras acciones.
- Comillas rectas (`"`) en texto JSX crudo rompen `pnpm lint` (`react/no-unescaped-entities`); escapar con `&quot;` o usar comillas tipográficas. En atributos entre comillas simples no falla.
- Una columna **nullable** en DB no se parsea con `z.string().optional().default("")`: `.optional()` solo admite `undefined` y `null` revienta el parse. Usar `.nullish()` + `transform` (o `.nullable()`). Detectado en T-012 con `clients.email` antes de usarla en `ClientSchema`.

## 7. Notas del historial

- Hubo una versión temprana de la app que ya usaba `@react-pdf/renderer`; está en el historial de git. **No consultar el historial salvo que el dueño lo pida**: la implementación de PDF se hará de nuevo sobre el estado actual.

## 8. Registro

Una línea por tarea terminada: `YYYY-MM-DD · T-XXX · resultado`.

- 2026-09-29 · — · Creación de `AGENTS.md` y `MEMORY.md` iniciales.
- 2026-09-29 · T-001 · `changeSentStatus` + `ChangeStatusMenu` en dashboard y editor; autoguardado deja de escribir `sent_status`. `tsc`, `lint` (línea base) y `build` en verde.
- 2026-09-29 · T-002 · Auditoría en solo lectura de las 5 pestañas del sidebar (tablas por campo, `useBudget`, `BudgetSchema` vs columnas, `/profile`, dominios, checklist) + registro de las decisiones de diseño; cableado derivado a T-010–T-018. Cero cambios de código.
- 2026-09-30 · T-010 · `ServiceCard` cableada (Usar/Guardar/Eliminar) con resultado tipado, confirmación de borrado y `router.refresh()` en `useTransition`; `revalidatePath` → `/(budget)/edit/[id]`. `tsc`, `lint` (línea base) y `build` en verde; sin prueba en navegador.
- 2026-09-30 · — · Se creó T-019 (presupuestos emitidos de solo lectura en el editor, prioridad alta).
- 2026-09-30 · T-015 · 4 toggles de `settings` cableados con `Switch` de shadcn + `editSetting` (merge anidado), pestaña renombrada a "Configuración" y controles muertos de T-014 eliminados. `tsc`, `lint` (línea base) y `build` en verde; sin prueba en navegador.
- 2026-09-30 · T-013a · Pestaña Textos cableada (2 textarea controlados + aviso de toggle), campo "Título o concepto principal" borrado, `tab-info.tsx` alineado y T-013 partida en T-013a/T-013b. `tsc`, `lint` (línea base) y `build` en verde; sin prueba en navegador.
- 2026-09-30 · T-018 · `getUserTexts` movido a `features/text-item`; actions completas (`create`/`update`/`delete`) con resultado tipado y `revalidatePath` corregido a `/(budget)/edit/[id]`; `getServices()` también tipado. Sin migración. `tsc`, `lint` (línea base) y `build` en verde; sin prueba en navegador.
- 2026-09-30 · T-011 · Estados vacío/error/carga en catálogo y biblioteca (`ServiceListResult`/`TextListResult`, `EmptyState`, "Reintentar", `isPending`); resultados propagados `page.tsx` → `SideBar` → tabs. `tsc`, `lint` (línea base) y `build` en verde; sin prueba en navegador.
- 2026-09-30 · T-013b · Biblioteca de fragmentos en la pestaña Textos (selector de destino, insert al final con `\n`, borrado con confirmación, avisos de 3 s) + feedback en los botones "Guardar" del documento. `tsc`, `lint` (línea base) y `build` en verde; sin prueba en navegador.
- 2026-09-30 · — · §2 reordenado: T-010, T-011, T-013a, T-013b, T-015 y T-018 movidas de "Pendientes" a "Hechas" (contenido intacto); nota de `actions/` en §5 corregida.
- 2026-09-30 · T-012 · Nuevo dominio `features/clients/` (`ClientSchema` movido de `features/user`, `getClients`/`createClient` con resultado tipado) y pestaña Cliente reescrita: los 4 inputs muertos borrados, `client_name` filtra la lista, "Guardar como cliente" vincula el existente si el nombre ya existe, "Vinculado a: X" + "Quitar vínculo" (`client_id: ""`). Sin migración. `tsc`, `lint` (línea base) y `build` en verde; sin prueba en navegador.
