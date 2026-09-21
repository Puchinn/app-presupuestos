# Guía de Diseño: Identificadores y Nomenclatura para Presupuestos

Al diseñar una aplicación de presupuestos o facturación, es fundamental separar la **identificación técnica interna** de la **identificación comercial/visible**. A continuación se detallan los formatos recomendados para IDs del sistema, códigos comerciales y archivos exportados.

---

## 1. ID Interno de Base de Datos (Sistema)

El ID interno se utiliza para relaciones de base de datos, API endpoints y control de estado en la aplicación.

### Buenas Prácticas

- **Nunca exponer IDs secuenciales simples (`1`, `2`, `3`)**: Revelan el volumen de ventas y permiten inferir datos de competencia.
- **Soporte Offline/Cliente**: Utilizar identificadores que se puedan generar en el frontend sin colisiones antes de sincronizar con el backend.

### Formatos Recomendados

- **UUID v4**: Estándar para identificadores unívocos globales (`e7b8a109-9f12-4f3b-8321-823901bc93f2`).
- **NanoID / CUID**: Alternativas más compactas y optimizadas para ordenamiento temporal.

---

## 2. Código Comercial / Número de Documento (Visible)

Es el código que leen el usuario y su cliente final en el documento, emails o impresiones.

### Formato Recomendado

```
PRES-[AÑO][MES]-[SECUENCIAL]
```

### Ejemplos

- `PRES-202609-001`
- `PR-2026-0042`

### Ventajas de este Formato

- **Orden Cronológico Natural**: Al ordenar alfabéticamente por código, los documentos se organizan por fecha de forma automática (`YYYYMM`).
- **Claridad Operativa**: Permite identificar de un vistazo en qué periodo se emitió la cotización.
- **Control de Secuencia**: El contador (`001`, `002`) se puede reiniciar mensualmente o anualmente según la configuración de la app.

---

## 3. Estructura para URLs (Ruteo Web)

Para el acceso web o enlaces compartibles del presupuesto, se recomienda combinar el código comercial con un hash de seguridad corto.

```
/presupuestos/PRES-202609-001-a8f9d
```

- **Seguridad**: Evita que un cliente altere el ID en la URL para ver presupuestos de otros clientes.
- **Legibilidad**: Permite al usuario identificar el recurso navegando el historial.

---

## 4. Nomenclatura de Archivos Exportados (PDF)

El nombre del archivo exportado debe aportar contexto tanto a la persona que emite el presupuesto como al cliente que lo recibe.

### Formato Ideal

```
[TuEmpresa] - Presupuesto [CodigoComercial] - [NombreCliente].pdf
```

### Ejemplos

- `EstudioDesign - Presupuesto PRES-202609-001 - Juan Perez.pdf`
- `AcroServicios - Presupuesto PR-2026-0042 - Constructora S.A..pdf`

### Malas Prácticas a Evitar

- `presupuesto_1.pdf` (Genera confusión y pérdida del archivo en carpetas de descargas).
- `documento_descarga_final_v2.pdf` (Falta de profesionalismo).

---

## Resumen de Arquitectura

| Nivel              | Formato / Patrón                      | Propósito                                                    |
| :----------------- | :------------------------------------ | :----------------------------------------------------------- |
| **Base de Datos**  | `UUID v4` / `NanoID`                  | Unicidad técnica, integridad referencial y soporte offline.  |
| **Interfaz / UI**  | `PRES-YYYYMM-001`                     | Identificación clara, ordenable e inmutable para el cliente. |
| **URL Publica**    | `/presupuestos/[Código]-[Hash]`       | Seguridad por oscuridad + legibilidad.                       |
| **PDF / Descarga** | `Empresa - PRES-Código - Cliente.pdf` | Organización clara en el sistema de archivos del usuario.    |

# Arquitectura Multi-Tenant en Supabase / PostgreSQL

Este documento resume las decisiones de diseño y arquitectura para estructurar la base de datos y los tipos de datos en la aplicación, garantizando el aislamiento de información entre usuarios mediante **Multi-Tenant con `user_id`** y **Row Level Security (RLS)**.

---

## 1. Concepto Fundamental: Multi-Tenant con `user_id`

En lugar de crear esquemas o tablas separadas por cada usuario (ej. `clientes_usuario_1`), todos los datos de todos los usuarios residen en las mismas tablas principales (`clients`, `documents`, `services`, `quotations`).

Cada registro se asocia directamente a su propietario mediante una columna de clave foránea `user_id` que apunta a `auth.users(id)`.

```
                    [ auth.users ]  (Nativo de Supabase)
                          |
            +-------------+-------------+
            | 1:1                       | 1:N
            v                           v
      [ profiles ]               [ clients ]
            |                           |
            +------------+--------------+
                         |
                         v 1:N
                   [ quotations ]
                         |
                         v 1:N
                 [ quotation_items ]
```

---

## 2. Seguridad a Nivel de Fila (Row Level Security - RLS)

PostgreSQL y Supabase se encargan de aislar la información de manera transparente. Mediante RLS, las consultas ejecutadas desde el cliente filtran automáticamente los datos sin depender exclusivamente de un `WHERE user_id = ...` en la aplicación.

### Ejemplo de Configuración SQL:

```sql
-- 1. Habilitar RLS en la tabla
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 2. Política para SELECT, INSERT, UPDATE, DELETE
CREATE POLICY "Los usuarios solo gestionan sus propios clientes"
ON clients
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

## 3. Principio de Inmutabilidad de Datos (Snapshot Paradigm)

En aplicaciones de facturación o presupuestos, los datos históricos (precios, descripciones, datos del cliente) **no deben cambiar** retroactivamente si el catálogo o perfil del cliente se modifica en el futuro.

- **Catálogo (`services`):** Funciona como plantilla/librería reusable.
- **Items del Presupuesto (`quotation_items`):** Al agregar un servicio a un presupuesto, se **clonan** los valores de `title`, `description` y `unit_price`.

---

## 4. Tipado e Interfaces (TypeScript)

Estructura modular recomendada para el código frontend/backend:

```typescript
// --- PERFIL DE USUARIO ---
export interface Profile {
  id: string; // auth.uid()
  updatedAt: string;
  fullName: string;
  companyName?: string;
  logoUrl?: string;
  defaultNotes?: string;
}

// --- CLIENTES ---
export interface Client {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

// --- CATÁLOGO DE SERVICIOS ---
export interface Service {
  id: string;
  userId: string;
  title: string;
  description?: string;
  defaultPrice: number;
}

// --- PRESUPUESTO / DOCUMENTO ---
export interface QuotationItem {
  id: string;
  quotationId: string;
  serviceId?: string; // Referencia opcional al catálogo
  title: string; // Copia/Snapshot
  description?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Quotation {
  id: string;
  userId: string;
  clientId: string;
  clientSnapshot: Client; // Copia de datos del cliente al emitir
  items: QuotationItem[];
  totalAmount: number;
  status: "draft" | "sent" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}
```

---

## 5. Escalabilidad Futura (Cuentas Organizacionales / Equipos)

Si en el futuro la aplicación evoluciona para soportar equipos de trabajo donde varios usuarios comparten información:

1. Se introduce la entidad `organizations` y `organization_members`.
2. La columna `user_id` en tablas compartidas se reemplaza o complementa con `organization_id`.
3. La política RLS verifica pertenencia:

```sql
CREATE POLICY "Acceso por organización"
ON clients
FOR ALL
USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
  )
);
```

Si el presupuesto sigue en Borrador: El archivo debería llamarse algo como Presupuesto-Borrador-${budget.public_code || 'temp'}.pdf o simplemente Borrador-${budget.client_name}.pdf. Así de entrada cualquiera que lo vea (incluyendo vos) entiende que ese PDF no es un documento fiscal o formal definitivo.

Si el presupuesto ya está Emitido: Acá sí se usa el identificador definitivo, por ejemplo Presupuesto-${budget.public_code}.pdf (ej. Presupuesto-001.pdf).
