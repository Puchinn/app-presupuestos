import { Budget } from "@/types/budget";
import { format } from "date-fns";

export function BudgetPreview({ budget }: { budget: Budget }) {
  const formatDate = (date: string | null) =>
    date ? format(date, "PP") : "fin formato";

  return (
    <div className="max-w-[900px] break-inside-avoid w-full mx-auto my-10 print:my-0 print:max-w-none">
      <div className="shadow-sm print:shadow-none">
        {/* HEADER  */}
        <header className="bg-black text-white px-12 py-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
            <div className="flex items-center">
              {budget.logo_url ? (
                <img
                  src={budget.logo_url}
                  alt="Logo"
                  style={{ width: 140, height: 140, objectFit: "contain" }}
                />
              ) : (
                <div
                  style={{ width: 140, height: 140 }}
                  className="bg-white/10 rounded flex items-center justify-center text-xs text-background/50"
                >
                  Sin Logo
                </div>
              )}
            </div>
            <h1 className="text-xl font-semibold tracking-[0.3em] uppercase text-background text-center">
              Presupuesto
            </h1>
            <div>
              <div className="flex items-center justify-end gap-8">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-background/30 mb-0.5">
                    Enviado
                  </p>
                  <p className="text-sm text-background/80">
                    {formatDate(budget.dates.sent)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-background/30 mb-0.5">
                    Plazo
                  </p>
                  <p className="text-sm text-background/80">
                    {formatDate(budget.dates.estimated)}
                  </p>
                </div>
              </div>
              <div className="text-right mt-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-background/30 mb-0.5">
                  ID:
                </p>
                <span className="text-sm text-background/80">
                  {budget.public_code}
                </span>
              </div>
            </div>
          </div>
          <div className="h-px bg-background/10 my-5" />
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-background/30">
              Cliente
            </p>
            <span className="text-sm font-medium text-background tracking-wide">
              {budget.client_name}
            </span>
          </div>
        </header>
        {/* FIN HEADER */}

        <main className="px-12 py-12">
          {/* SERVICIOS */}
          <section className="mb-12">
            <div className="grid grid-cols-[1fr_80px_120px_120px] gap-4 pb-3 border-b-2 border-foreground">
              <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Servicio
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground text-center">
                Cant.
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground text-right">
                P. Unitario
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground text-right">
                Total
              </span>
            </div>

            {budget.services.map((service, idx) => {
              const rowTotal = service.quantity * service.price;
              return (
                <div
                  key={service.id}
                  className={`grid grid-cols-[1fr_80px_120px_120px] gap-4 py-6 items-start ${
                    idx < budget.services.length - 1
                      ? "border-b border-border"
                      : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-base font-semibold text-foreground tracking-tight">
                        {service.name}
                      </h4>
                    </div>
                    {/* Lista estática de detalles */}
                    <ul className="space-y-1">
                      {service.details.map((detail, dIdx) => (
                        <li
                          key={dIdx}
                          className="text-sm text-muted-foreground"
                        >
                          • {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-center pt-0.5">
                    <span className="text-[15px] text-foreground">
                      {service.quantity}
                    </span>
                  </div>

                  <div className="flex justify-end pt-0.5">
                    <span className="text-[15px] text-foreground">
                      $ {service.price}
                    </span>
                  </div>

                  <div className="flex justify-end pt-0.5">
                    <span
                      className="text-[15px] font-semibold tabular-nums text-foreground"
                      title="Cantidad x Precio Unitario"
                    >
                      $ {rowTotal}
                    </span>
                  </div>
                </div>
              );
            })}
          </section>
          {/* FIN SERVICIOS */}

          {/* TOTAL */}
          <section className="border-t-2 border-foreground pt-6 mb-12">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold uppercase tracking-[0.15em]">
                total
              </span>
              <span className="text-3xl font-bold tabular-nums tracking-tight">
                ${" "}
                {budget.services.reduce(
                  (acu, cur) => acu + cur.price * cur.quantity,
                  0,
                )}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5 text-right uppercase tracking-[0.2em]">
              Pesos Argentinos (ARS)
            </p>
          </section>
          {/* FIN TOTAL */}

          {/* CONDICIONES */}
          <section className="border border-border rounded-md p-8 mb-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Condiciones de pago
              </h3>
            </div>
            <p className="text-[15px] leading-relaxed text-muted-foreground w-full whitespace-pre-wrap">
              {budget.conditions}
            </p>
          </section>
          {/* FIN CONDICIONES */}

          {/* DESCRIPTION */}
          <section className="border border-border rounded-md p-8 mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Detalle del presupuesto
              </h2>
            </div>
            <p className="text-[15px] leading-relaxed text-muted-foreground w-full whitespace-pre-wrap">
              {budget.budget_details}
            </p>
          </section>
          {/* FIN DESCRIPTION  */}
        </main>

        <footer className="border-t border-border px-12 py-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div
                style={{ width: 80, height: 80 }}
                className="bg-muted rounded flex items-center justify-center text-[10px] text-muted-foreground"
              >
                QR Code
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Conoce mis trabajos
                </p>
                <span className="text-sm font-medium text-foreground">
                  {budget.website}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="space-y-4">
                {budget.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-end gap-2"
                  >
                    <div className="text-right">
                      <span className="text-[15px] font-semibold text-foreground">
                        {participant.name}
                      </span>
                      <br />
                      <span className="text-sm text-muted-foreground">
                        {participant.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-border flex items-center justify-center gap-6">
            <span className="text-sm text-muted-foreground">
              {budget.contact_number}
            </span>
            <span className="text-foreground/10">|</span>
            <span className="text-sm text-muted-foreground">
              {budget.website}
            </span>
          </div>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground italic">
              ¿Querés presentar tus presupuestos así? Diseñamos tu sistema de
              presupuestos automatizado para tu marca. Consultanos
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
