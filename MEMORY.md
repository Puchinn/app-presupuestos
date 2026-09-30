# MEMORY.md — Memoria del proyecto

> Este archivo lo lee y lo mantiene el agente. `AGENTS.md` tiene las reglas estables; aquí va lo que cambia.
> Si hay contradicción entre ambos, manda `AGENTS.md`. Ver "Protocolo de MEMORY.md" allí.

Última actualización: 2026-09-30 (T-010 hecha; creada T-019; mantenida por el agente)

## 1. Estado actual

**Qué existe hoy**

- Auth con Supabase (proxy.ts), `/login`.
- Dashboard en `/`.
- `/profile`: editar información del usuario.
- `/new-budget`: crear presupuestos.
- `/edit/[id]`: editar presupuestos con autoguardado (`useBudget`, debounce 800 ms). Incluye un sidebar de 5 pestañas que ya muestra contenido, pero solo Info y parte de Servicios/Cliente están cableadas (ver hallazgos de T-002).
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
- **T-010** · Cablear "Usar" / editar / eliminar de `ServiceCard` en la pestaña Servicios · hecha 2026-09-30
  `ServiceCard` recibe `onAdd`/`onUpdate`/`onDelete` desde `tab-services.tsx`: "Usar" → `methods.addService` (ítem armado con solo `name/price/quantity/details`), "Guardar" → `updateService`, "Eliminar" → `deleteService` con confirmación en `DeleteAlertDialog`. La lista del catálogo **no** tiene estado local: se deriva de la prop del servidor y tras cada mutación se llama `router.refresh()` en un `useTransition`. `updateService`/`deleteService` devuelven `ServiceActionResult` (`{ ok: true } | { ok: false, error }`), `deleteService` usa `.select()` para detectar 0 filas afectadas. Feedback efímero (3 s) en la propia tarjeta para "Usar", "Servicio actualizado" y errores. Verificado con `tsc`, `lint` (línea base) y `build`; **no** se probó en el navegador.

  Plan aprobado 2026-09-30 (decisiones del dueño): unificar `new-servicecard.tsx` sobre el `Service` de `services-catalog` y borrar la interfaz local (verificado antes: `ServiceCard` solo se usa en `tab-services.tsx`, siempre con `id`); `updateService`/`deleteService` a resultado tipado, con `.select()` en el delete; **sin estado local** para la lista → `router.refresh()` en `useTransition` + `revalidatePath` apuntando a `/edit/[id]` (motivo: "Guardar este servicio" del documento agrega al catálogo con el sidebar abierto); borrado confirmado con `delete-alert-dialog.tsx`; feedback efímero sin dependencias nuevas; crear servicios desde el sidebar **fuera** de T-010; en "Usar" solo `name/price/quantity/details`.
- **T-011** · Estados vacío/carga/error del catálogo y del sidebar · pendiente
  Lista vacía del catálogo queda en blanco. Ojo: `getServices()` devuelve `[]` tanto sin datos como con error, así que hoy no se puede distinguir vacío de fallo. Aprovechar para la biblioteca de fragmentos de T-013.
- **T-012** · Pestaña Cliente: selector y alta de clientes · pendiente
  Decidido: tabla `clients` reutilizable, `client_id` **opcional**, `client_name` alcanza para emitir; al elegir se copia el nombre. Migración nueva (CUIT, dirección, contacto) + dominio `features/clients/` moviendo `ClientSchema` desde `features/user`. Fase 1: elegir y crear. `client_id` sale del checklist (T-016).
- **T-013** · Pestaña Textos: cablear notas/términos + biblioteca de fragmentos · pendiente
  Decidido: "Términos de pago" → `conditions`, "Notas y alcance" → `budget_details`, **se borra** "Título o concepto principal". Biblioteca de `text_items` que inserta **al final** del campo. Depende de T-018 (mover `getUserTexts` a `features/text-item`).
- **T-014** · Moneda, IVA, descuento y plazo de entrega · pendiente (diferida)
  Decidido: se difiere todo a T-014 y **mientras tanto se quitan esos controles de la UI** (hoy están muertos). El plazo de entrega probablemente sea `dates.estimated`. Cuando se retome: migración/schema y efecto en totales y PDF.
- **T-015** · Controles para los toggles de `settings` · pendiente
  Decidido: claves nuevas **sin migración**, solo agregarlas al schema zod con `.default(...)` (regla de AGENTS.md sobre jsonb). `settings` guarda únicamente opciones de visualización: nada de IVA, moneda ni descuento acá.
- **T-016** · Emisión: validación en servidor y checklist en dos niveles · pendiente
  Decidido: `emitBudget` valida en el servidor lo esencial (**razón social** y **al menos un servicio**); el checklist de Info pasa a dos niveles (esencial para emitir / recomendado) y **`client_id` sale del checklist**. Sigue faltando que el botón "Emitir presupuesto" tenga `onClick`.
- **T-017** · `/profile`: columnas reales y limpieza de UI · pendiente
  Decidido: **borrar `BankSection`**; los campos Mock pasan a columnas reales (estudio, CUIT, ciudad) → migración de `profiles` + `UserInfoSchema`; **email de solo lectura** desde `auth`; **`avatar_url` fuera** del formulario (la columna existe en DB y no se toca). Toca también el copy que promete datos bancarios.
- **T-018** · Mover `getUserTexts` a `features/text-item` y completar actions de `text_items` · pendiente
  Hoy vive en `features/services-catalog/actions.ts`; faltan update, delete y list consumido. Es el cimiento de la biblioteca de T-013.
- **T-019** · Presupuestos emitidos (`status === "issued"`): editor de solo lectura + marca de agua · pendiente (prioridad alta)
  Cuando `status === "issued"`, `/edit/[id]` debe ser de solo lectura (campos, servicios, participantes, fechas) y la marca de agua "Emitido" debe mostrarse **también en el editor**, no solo en el PDF. Ligada a T-016 (emisión).

### En curso

_(ninguna)_

### Hechas

- **T-001** · Cambiar el `sent_status` de un presupuesto · hecha 2026-09-29
  Nueva server action `changeSentStatus` (resultado tipado, valida con `SentStatusSchema`, filtra por `id` y `user_id`) + componente `ChangeStatusMenu` (badge clickeable con menú de estados) en `budget-card` (dashboard) y `header-status` (editor). `updateBudget` ahora parsea con `BudgetSchema.omit({ sent_status: true })` y el autoguardado excluye `sent_status` del payload. No toca el `status` fiscal.
- **T-002** · Auditoría y decisiones de diseño del sidebar de `/edit/[id]` · hecha 2026-09-29
  Auditoría de las 5 pestañas en solo lectura (tablas por campo, `useBudget`, `BudgetSchema` vs columnas, `/profile`, dominios, checklist) + decisiones de diseño registradas en §4. El cableado queda en T-010 a T-018. Cero cambios de código.

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
- 2026-09-29 · Clientes: migración nueva (CUIT, dirección, contacto) + dominio `features/clients/`, moviendo `ClientSchema` desde `features/user`. Fase 1: solo **elegir y crear**. · Mantener el dominio acotado; editar/borrar clientes después.
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

## 5. Bugs y deuda técnica

- `pnpm lint` en rojo de base: 3 errores `react-hooks/set-state-in-effect` en `components/editable-price.tsx`, `components/editable-quantity.tsx`, `hooks/use-mobile.ts`. Además warnings de `<img>` y variables sin usar. No urgente; no agregar errores nuevos.
- Server actions solo hacen `throw`, sin manejo de errores en la UI (cubierto por T-008/T-009).
- `updateBudget` sigue haciendo `throw` con un mensaje placeholder ("aaaca capo") y no filtra por `user_id` en el update (hoy lo cubre RLS, pero conviene filtrar igual como las demás acciones). T-001 ya cambió el parse a `BudgetSchema.omit({ sent_status: true })`; lo demás lo cubre T-008.
- Carpeta raíz `actions/`: **ya no existe** (la mencionan AGENTS.md y esta sección; aviso al dueño). La deuda que queda son `getUserTexts` mal ubicado y `text_items` incompleto (T-018).
- UI muerta sin handler (auditoría T-002): botón "Emitir presupuesto" y "Vista previa" (`header-status.tsx`), ~~"Usar"/"Guardar"/"Eliminar" de `ServiceCard`~~ (cableados en T-010), los 4 inputs de la pestaña Cliente menos `client_name`, los 3 campos de Textos y los 5 de Configuración, y 4 campos "Mock" + `BankSection` en `/profile`.
- `DeleteAlertDialog` cierra el diálogo siempre que `onConfirm` resuelva, incluso si el borrado falló; el error queda visible solo como aviso efímero en la tarjeta. No se tocó el componente compartido en T-010.
- `editBudgetInfo` acepta `status`, `sent_status`, `public_code` y `settings`: hoy ningún control abusa, pero nada lo impide (el autoguardado escribiría esas columnas).
- Tabla `budget_items` (migración 1): **huérfana** — sin types, sin actions, sin componentes; además en `text_items` se le borró `budget_item_id` en la migración 2, así que nadie la referencia. Decidir si se usa o se elimina (borrar tabla = migración, pedir aprobación).
- No hay tests ni CI. No agregar sin consultar.

## 6. Lecciones aprendidas

- Las URLs de storage se construyen siempre con `getPublicStorageUrl()`; concatenarlas a mano causó un bug.
- Cambiar una columna jsonb de `budgets` exige migración **y** actualizar el schema zod en el mismo cambio. Nuancia (T-002): agregar una clave *dentro* de `settings` no rompe la columna, pero sí hay que tocar el schema zod, porque `z.object` descarta claves desconocidas al parsear.
- Tocar el flujo de cookies o `getClaims()` en `lib/supabase/proxy.ts` puede desloguear usuarios al azar.
- Zod 4 (v4.6.2): `.default()` se ejecuta también dentro de `.optional()` y sobre `.partial()`. Si omitís un campo del payload para "no pisarlo", el default igual lo rellena en el parse. Para excluir una columna de un update, usá `.omit({ campo: true })` en el schema.
- En los `DropdownMenu` de Base UI, `DropdownMenuLabel` y `DropdownMenuRadioGroup` deben ir dentro de un `DropdownMenuGroup` (o el label dentro del propio `DropdownMenuRadioGroup`); sin ese padre falta `MenuGroupContext` y la app se detiene con el error en runtime "MenuGroupContext is missing".
- `revalidatePath(ruta, "page")` en Next 16 se etiqueta contra `definition.page`, que **incluye el route group** (p. ej. `/(budget)/edit/[id]/page`); la URL visible no sirve. Verificado en `node_modules/next/dist/build/templates/app-page-runtime.js` + `shared/lib/router/utils/app-paths.js`. Aun así, cualquier `revalidatePath` desde una server action setea `pathWasRevalidated` y el cliente refresca la ruta actual aunque la etiqueta no matchee.
- `router.refresh()` (Next 16) re-renderiza los Server Components **sin** perder el `useState` de los client components (ver `docs/.../use-router.md`): sirve para refrescar props del servidor —como el catálogo del sidebar— sin reiniciar `useBudget` ni perder ediciones pendientes del editor.
- No existe ningún sistema de toasts/avisos en el proyecto; el "estado de guardado" más cercano es `SaveStatusIndicator` (`status-indicator.tsx`), que lee el `status` del contexto y no sirve para avisos efímeros de otras acciones.

## 7. Notas del historial

- Hubo una versión temprana de la app que ya usaba `@react-pdf/renderer`; está en el historial de git. **No consultar el historial salvo que el dueño lo pida**: la implementación de PDF se hará de nuevo sobre el estado actual.

## 8. Registro

Una línea por tarea terminada: `YYYY-MM-DD · T-XXX · resultado`.

- 2026-09-29 · — · Creación de `AGENTS.md` y `MEMORY.md` iniciales.
- 2026-09-29 · T-001 · `changeSentStatus` + `ChangeStatusMenu` en dashboard y editor; autoguardado deja de escribir `sent_status`. `tsc`, `lint` (línea base) y `build` en verde.
- 2026-09-29 · T-002 · Auditoría en solo lectura de las 5 pestañas del sidebar (tablas por campo, `useBudget`, `BudgetSchema` vs columnas, `/profile`, dominios, checklist) + registro de las decisiones de diseño; cableado derivado a T-010–T-018. Cero cambios de código.
- 2026-09-30 · T-010 · `ServiceCard` cableada (Usar/Guardar/Eliminar) con resultado tipado, confirmación de borrado y `router.refresh()` en `useTransition`; `revalidatePath` → `/(budget)/edit/[id]`. `tsc`, `lint` (línea base) y `build` en verde; sin prueba en navegador.
- 2026-09-30 · — · Se creó T-019 (presupuestos emitidos de solo lectura en el editor, prioridad alta).
