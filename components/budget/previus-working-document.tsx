"use client";

import {
  ChevronDown,
  FileText,
  ListPlus,
  Plus,
  Save,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { EditableField } from "../editable-field";
import { DatePicker } from "../ui/date-picker";
import { useState } from "react";
import { EditableBulletList } from "../editable-bullet-list";
import { EditableQuantity } from "../editable-quantity";
import { EditablePrice } from "../editable-price";
import { ImageUpload } from "../image-upload";
import { BudgetToolbar } from "./budget-toolbar";
import { v4 as uuidv4 } from "uuid";

interface ServiceBlock {
  id: string;
  title: string;
  details: string[];
  quantity: number;
  unitPrice: number;
}

interface Details {
  id: string;
  title: string;
  details: string[];
}

interface Participant {
  id: string;
  name: string;
  role: string;
}

interface BudgetSection {
  id: string;
  text: string;
}

interface UserProfile {
  fullName: string;
  role: string;
  contactNumber: string;
  website: string;
  logo: string;
  qr: string;
}

interface Budget {
  id: string;
  client_id: string;
  comercial_id: string;
  client_name: string;
  dates: {
    sent: string;
    estimated: string;
  };
  services: ServiceBlock[];
  total_price: number;
  details: string;
  conditions: string;
  participants: Participant[];
  web_site: string;
  contact_number: string;
}

interface Client {
  full_name: string;
  id: string;
  budgets: Budget[];
}

function ClientsForm({
  createClient,
}: {
  createClient: (name: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  const switchModal = () => {
    setShowForm(!showForm);
  };

  const onCreate = () => {
    createClient(name);
    setShowForm(false);
    setName("");
  };

  return (
    <div>
      <button onClick={switchModal} className="border p-2 m-2">
        Crear Cliente
      </button>

      {showForm && (
        <div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            name="full_name"
            id="full_name"
            placeholder="Productora Audiovisual"
            className="border p-2"
          />
          <button className="border p-2" onClick={onCreate}>
            Crear
          </button>
        </div>
      )}
    </div>
  );
}

export function BudgetDocument() {
  const next15Days = new Date();
  next15Days.setDate(next15Days.getDate() + 15);

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currentBudgetId, setCurrentBudgetId] = useState("");
  const [autoComplete, setAutoComplete] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: "Esteban Sayago",
    role: "Desarrollador Web",
    contactNumber: "3572616936",
    website: "dymanstudio.com",
    logo: "/logo.webp",
    qr: "",
  });

  const autoCompleteData = (field: keyof UserProfile) => {
    if (autoComplete) return userProfile[field];
    return "";
  };

  const [sentDate, setSentDate] = useState<Date>(new Date());
  const [estimatedTime, setEstimatedTime] = useState<Date>(next15Days);
  const [budgetID, setBudgetID] = useState("PRDY-2026-001");
  const [clientName, setClientName] = useState("");
  const [services, setServices] = useState<ServiceBlock[]>([]);
  const [activeDetailsMenu, setActiveDetailsMenu] = useState<null | string>("");
  const [savedDetails, setSavedDetails] = useState<Details[]>([]);
  const [conditions, setConditions] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState(autoCompleteData("website"));
  const [phone, setPhone] = useState(autoCompleteData("contactNumber"));
  const [participants, setParticipants] = useState<Participant[]>([
    {
      name: autoCompleteData("fullName"),
      id: uuidv4(),
      role: autoCompleteData("role"),
    },
  ]);

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client>();

  const onAutoCompleteSwitch = () => setAutoComplete(!autoComplete);

  const [showCreateServiceForm, setShowCreateServiceForm] = useState(false);

  const [savedDescriptions, setSavedDescriptions] = useState<BudgetSection[]>(
    [],
  );
  const [savedConditions, setSavedConditions] = useState<BudgetSection[]>([]);

  const onChangeUserProfile = (field: keyof UserProfile, value: string) => {
    setUserProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveDescriptionFromBudget = (text: string) => {
    setSavedDescriptions((prev) =>
      prev.concat({
        id: uuidv4(),
        text,
      }),
    );
  };

  const saveConditionsFromBudget = (text: string) => {
    setSavedConditions((prev) =>
      prev.concat({
        id: uuidv4(),
        text,
      }),
    );
  };

  const addBlankService = () => {
    setServices((prev) => [
      ...prev,
      {
        id: uuidv4(),
        title: "Nuevo servicio",
        unitPrice: 0,
        quantity: 1,
        details: ["Detalle del servicio"],
      },
    ]);
  };

  const addService = (service: ServiceBlock) => {
    setServices((prev) =>
      prev.concat({
        ...service,
        id: uuidv4(),
      }),
    );
  };

  const updateService = <K extends keyof ServiceBlock>(
    id: string,
    field: Record<K, ServiceBlock[K]>,
  ) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...field } : s)),
    );
  };

  const removeService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const saveServiceDetails = (details: Details) => {
    setSavedDetails((prev) => [...prev, details]);
  };

  const loadDetailsToService = (serviceId: string, savedDetails: Details) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId ? { ...s, details: savedDetails.details } : s,
      ),
    );
  };

  const addParticipant = () => {
    setParticipants((p) => [
      ...p,
      {
        name: "Nuevo participante",
        role: "Sin rol",
        id: String(p.length + 1),
      },
    ]);
  };

  const grandTotal = services.reduce((acumulator, current) => {
    return acumulator + current.quantity * current.unitPrice;
  }, 0);

  const updateParticipant = <K extends keyof Participant>(
    id: string,
    field: Record<K, Participant[K]>,
  ) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...field } : p)),
    );
  };

  const removeParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const [savedServices, setSavedServices] = useState<ServiceBlock[]>([]);

  const addToSavedServices = (service: ServiceBlock) => {
    if (savedServices.some((s) => s.id === service.id)) return;

    setSavedServices((prev) =>
      prev.concat({
        ...service,
        id: uuidv4(),
      }),
    );
  };

  const onSaveBudget = () => {
    const newBudgetId = uuidv4();
    setCurrentBudgetId(newBudgetId);
    const budget = {
      id: newBudgetId,
      client_id: selectedClient?.id || "",
      client_name: clientName,
      comercial_id: budgetID,
      dates: {
        sent: sentDate.toString(),
        estimated: estimatedTime.toString(),
      },
      services,
      conditions,
      details: description,
      participants,
      contact_number: userProfile.contactNumber,
      web_site: userProfile.website,
      total_price: grandTotal,
    };
    setBudgets((prev) => prev.concat(budget));

    setClients((prev) =>
      prev.map((p) =>
        p.id === selectedClient?.id
          ? {
              ...p,
              budgets: p.budgets.concat(budget),
            }
          : p,
      ),
    );
  };

  const selectBudget = (id: Budget["id"]) => {
    const findedBudget = budgets.find((b) => b.id === id);
    if (!findedBudget) return;

    setClientName(findedBudget.client_name);
    setSentDate(new Date(findedBudget.dates.sent));
    setEstimatedTime(new Date(findedBudget.dates.estimated));
    setBudgetID(findedBudget.comercial_id);
    setServices(findedBudget.services);
    setDescription(findedBudget.details);
    setConditions(findedBudget.conditions);
    setParticipants(findedBudget.participants);
    setPhone(findedBudget.contact_number);
    setWebsite(findedBudget.web_site);
    setCurrentBudgetId(findedBudget.id);
  };

  const deleteBudget = (id: Budget["id"]) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const cleanBudget = () => {
    setClientName("");
    setSentDate(new Date());
    setEstimatedTime(new Date());
    setBudgetID("");
    setServices([]);
    setDescription("");
    setConditions("");
    setParticipants([]);
    setPhone("");
    setWebsite("");
    setCurrentBudgetId("");
  };

  const updateCurrentBudget = () => {
    if (!currentBudgetId) return;
    const updatedBudget: Budget = {
      id: currentBudgetId,
      client_id: selectedClient?.id || "",
      client_name: clientName,
      comercial_id: budgetID,
      conditions,
      details: description,
      contact_number: phone,
      dates: {
        sent: sentDate.toString(),
        estimated: estimatedTime.toString(),
      },
      participants,
      services,
      total_price: grandTotal,
      web_site: website,
    };

    setBudgets((prev) =>
      prev.map((budget) =>
        budget.id === currentBudgetId ? updatedBudget : budget,
      ),
    );
  };

  const createClient = (name: string) => {
    setClients((prev) =>
      prev.concat({
        id: uuidv4(),
        budgets: [],
        full_name: name,
      }),
    );
  };

  return (
    <div className="min-h-screen w-full">
      {/* <BudgetToolbar /> */}
      <BudgetToolbar
        onUpdateBudget={updateCurrentBudget}
        onClean={cleanBudget}
        onSave={onSaveBudget}
      />

      <ClientsForm createClient={createClient} />

      <h2>Clientes para trabajar:</h2>

      <div>
        {clients.length > 0 ? (
          <select
            onChange={(e) => {
              const clientSelected = clients.find(
                (c) => c.id === e.target.value,
              );
              if (clientSelected) {
                setSelectedClient(clientSelected);
                setClientName(clientSelected.full_name);
              }
            }}
            value={selectedClient?.id}
            name="clients"
            id="clients"
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.full_name}
              </option>
            ))}
          </select>
        ) : (
          <p>No hay clientes, comienza a crear uno.</p>
        )}
      </div>

      <div className="flex">
        <div className="flex w-full justify-center">
          {/* <BudgetSidebar /> */}

          <div className="max-w-[900px] break-inside-avoid w-full mx-auto my-10 print:my-0 print:max-w-none">
            <div className="bg-background shadow-sm print:shadow-none">
              {/* HEADER  */}
              <header className="bg-black text-white px-12 py-8">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
                  <div className="flex items-center">
                    <ImageUpload
                      defaultSrc="/logo.webp"
                      label="Cambiar logo"
                      size={140}
                      imageClassName="brightness-0 invert object-contain"
                    />
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
                        <DatePicker date={sentDate} setDate={setSentDate} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-background/30 mb-0.5">
                          Plazo
                        </p>
                        <DatePicker
                          date={estimatedTime}
                          setDate={setEstimatedTime}
                        />
                        {/* <EditableField
                          value={estimatedTime}
                          onChange={setEstimatedTime}
                          className="text-sm text-background/80"
                        /> */}
                      </div>
                    </div>
                    <div className="text-right mt-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-background/30 mb-0.5">
                        ID:
                      </p>
                      <EditableField
                        value={budgetID}
                        onChange={setBudgetID}
                        className="text-sm text-background/80"
                      />
                    </div>
                  </div>
                </div>
                <div className="h-px bg-background/10 my-5" />
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-background/30">
                    Cliente
                  </p>
                  <EditableField
                    value={clientName}
                    onChange={setClientName}
                    className="text-sm font-medium text-background tracking-wide"
                  />
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

                  {services.map((service, idx) => {
                    const rowTotal = service.quantity * service.unitPrice;
                    return (
                      <div
                        key={service.id}
                        className={`group grid grid-cols-[1fr_80px_120px_120px] gap-4 py-6 items-start ${
                          idx < services.length - 1
                            ? "border-b border-border"
                            : ""
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <EditableField
                              value={service.title}
                              onChange={(v) =>
                                updateService(service.id, { title: v })
                              }
                              className="text-base font-semibold text-foreground tracking-tight"
                            />
                            {services.length > 1 && (
                              <button
                                onClick={() => removeService(service.id)}
                                className="print:hidden opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground"
                                aria-label="Eliminar servicio"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <EditableBulletList
                            items={service.details}
                            onChange={(items) =>
                              updateService(service.id, { details: items })
                            }
                          />
                          <div className="print:hidden flex gap-3 relative mt-2">
                            <button
                              onClick={() =>
                                setActiveDetailsMenu(
                                  activeDetailsMenu === service.id
                                    ? null
                                    : service.id,
                                )
                              }
                              className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                            >
                              <ListPlus className="h-3 w-3" />
                              Detalles
                              <ChevronDown className="h-3 w-3" />
                            </button>

                            <button
                              onClick={() => addToSavedServices(service)}
                              className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                            >
                              <Save className="h-3 w-3" />
                              Guardar este servicio{" "}
                            </button>
                            {activeDetailsMenu === service.id && (
                              <div
                                onMouseLeave={() => setActiveDetailsMenu(null)}
                                className="absolute left-0 top-full mt-1 z-20 w-64 bg-white border border-border rounded-lg shadow-lg py-2"
                              >
                                <button
                                  onClick={() =>
                                    saveServiceDetails({
                                      title: service.title,
                                      details: service.details,
                                      id: service.id,
                                    })
                                  }
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-muted transition-colors"
                                >
                                  <Save className="h-3.5 w-3.5 text-muted-foreground" />
                                  Guardar estos detalles
                                </button>
                                {savedDetails.length > 0 && (
                                  <>
                                    <div className="h-px bg-border my-2" />
                                    <p className="px-4 py-1 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">
                                      Cargar detalles guardados
                                    </p>
                                    {savedDetails.map((detail) => (
                                      <button
                                        key={detail.id}
                                        onClick={() =>
                                          loadDetailsToService(
                                            service.id,
                                            detail,
                                          )
                                        }
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-muted transition-colors"
                                      >
                                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="truncate">
                                          {detail.title}
                                        </span>
                                      </button>
                                    ))}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-center pt-0.5">
                          <EditableQuantity
                            value={service.quantity}
                            onChange={(v) =>
                              updateService(service.id, { quantity: v })
                            }
                            className="text-[15px] text-foreground"
                          />
                        </div>

                        <div className="flex justify-end pt-0.5">
                          <EditablePrice
                            value={service.unitPrice}
                            onChange={(v) =>
                              updateService(service.id, { unitPrice: v })
                            }
                            className="text-[15px] text-foreground"
                          />
                        </div>

                        <div className="flex justify-end pt-0.5">
                          <span
                            className="text-[15px] font-semibold tabular-nums text-foreground"
                            title="Cantidad x Precio Unitario"
                          >
                            {/* $ {formatPrice(rowTotal)} */}$ {rowTotal}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    //   onClick={() => setSidebarTab("services")}
                    onClick={addBlankService}
                    className="print:hidden flex items-center gap-2 mt-5 text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar servicio
                  </button>
                </section>
                {/* FIN SERVICIOS */}

                {/* TOTAL */}
                <section className="border-t-2 border-foreground pt-6 mb-12">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold uppercase tracking-[0.15em]">
                      total
                    </span>
                    <span className="text-3xl font-bold tabular-nums tracking-tight">
                      {/* $ {formatPrice(grandTotal)} */}$ {grandTotal}
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
                    <button
                      onClick={() => saveConditionsFromBudget(conditions)}
                      className="print:hidden flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors"
                      title="Guardar esta condicion para reutilizarla"
                    >
                      <Save className="h-3 w-3" />
                      Guardar
                    </button>
                  </div>
                  <EditableField
                    value={conditions}
                    onChange={setConditions}
                    multiline
                    className="text-[15px] leading-relaxed text-muted-foreground w-full"
                  />
                </section>
                {/* FIN CONDICIONES */}

                {/* DESCRIPTION */}
                <section className="border border-border rounded-md p-8 mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                      Detalle del presupuesto
                    </h2>
                    <button
                      onClick={() => saveDescriptionFromBudget(description)}
                      className="print:hidden flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors"
                      title="Guardar este detalle para reutilizarlo"
                    >
                      <Save className="h-3 w-3" />
                      Guardar
                    </button>
                  </div>
                  <EditableField
                    value={description}
                    onChange={setDescription}
                    multiline
                    className="text-[15px] leading-relaxed text-muted-foreground w-full"
                  />
                </section>
                {/* FIN DESCRIPTION  */}

                {/* <BudgetDescription />
              <BudgetServicesTable />
              <BudgetServicesTotal />
              <BudgetConditions /> */}
              </main>
              {/* <BudgetFooter /> */}

              <footer className="border-t border-border px-12 py-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-5">
                    <ImageUpload label="QR Code" size={80} />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Conoce mis trabajos
                      </p>
                      <EditableField
                        value={website}
                        onChange={setWebsite}
                        className="text-sm font-medium text-foreground"
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="space-y-4">
                      {participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="group flex items-center justify-end gap-2"
                        >
                          {participants.length > 1 && (
                            <button
                              onClick={() => removeParticipant(participant.id)}
                              className="print:hidden opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground"
                              aria-label="Eliminar participante"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                          <div className="text-right">
                            <EditableField
                              value={participant.name}
                              onChange={(v) =>
                                updateParticipant(participant.id, { name: v })
                              }
                              className="text-[15px] font-semibold text-foreground"
                            />
                            <br />
                            <EditableField
                              value={participant.role}
                              onChange={(v) =>
                                updateParticipant(participant.id, { role: v })
                              }
                              className="text-sm text-muted-foreground"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addParticipant}
                      className="print:hidden inline-flex items-center gap-1.5 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide"
                    >
                      <UserPlus className="h-4 w-4" />
                      Agregar participante
                    </button>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-border flex items-center justify-center gap-6">
                  <EditableField
                    value={phone}
                    onChange={setPhone}
                    className="text-sm text-muted-foreground"
                  />
                  <span className="text-foreground/10">|</span>
                  <EditableField
                    value={website}
                    onChange={setWebsite}
                    className="text-sm text-muted-foreground"
                  />
                </div>

                <div className="mt-6 pt-4 border-t border-border text-center">
                  <p className="text-xs text-muted-foreground italic">
                    ¿Querés presentar tus presupuestos así? Diseñamos tu sistema
                    de presupuestos automatizado para tu marca. Consultanos
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </div>

        <div className="w-full relative p-2 border">
          <div className="sticky top-20">
            <h2>Presupuestos Guardados:</h2>

            <div className="m-2 p-1 border">
              {budgets
                .filter((b) => b.client_id === selectedClient?.id)
                .map((budget) => (
                  <div className="border p-2" key={budget.id}>
                    <p className="text-2xl">{budget.client_name}</p>
                    <p>${budget.total_price}</p>

                    <button
                      onClick={() => selectBudget(budget.id)}
                      className="border p-1"
                    >
                      Usar este presupuesto
                    </button>

                    <button
                      onClick={() => deleteBudget(budget.id)}
                      className="border p-1"
                    >
                      Eliminar este presupuesto
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="w-[50%] hidden print:hidden">
          <div className="p-2 fixed w-full max-w-max border">
            <label htmlFor="autocomplete">
              <input
                type="checkbox"
                defaultChecked={autoComplete}
                onChange={onAutoCompleteSwitch}
                name="autocomplete"
                id="autocomplete"
              />
              Autorrellenar datos de perfil
            </label>
            <div>
              <h2 className="text-2xl">Servicios Guardados</h2>
              <button
                onClick={() => setShowCreateServiceForm(!showCreateServiceForm)}
                className="border p-2 cursor-pointer"
              >
                {showCreateServiceForm ? "Cancelar" : "Crear nuevo servicio"}
              </button>
              {showCreateServiceForm && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const title = formData.get("title")?.toString() || "";
                    const details =
                      formData.get("details")?.toString().split("\n") || [];
                    const price =
                      Number(formData.get("price")?.toString()) || 0;

                    addToSavedServices({
                      title,
                      details,
                      unitPrice: price,
                      quantity: 1,
                      id: "",
                    });
                    setShowCreateServiceForm(false);
                  }}
                  className="w-full py-1 flex-col flex gap-2"
                >
                  <input
                    placeholder="titulo"
                    type="text"
                    name="title"
                    id="title"
                    className="border"
                  />
                  <textarea
                    name="details"
                    id="details"
                    placeholder="Detalles separados por salto de linea"
                    className="border"
                  ></textarea>
                  <input
                    className="border"
                    type="number"
                    placeholder="precio"
                    name="price"
                    id="price"
                  />

                  <button type="submit" className="border p-2">
                    Crear
                  </button>
                </form>
              )}

              <ul>
                {savedServices.map((service) => (
                  <li
                    className="border w-full  border-gray-200 rounded-md p-2"
                    key={service.id}
                  >
                    <div className="flex justify-between">
                      <h2 className="font-bold text-xl">{service.title}</h2>
                      <div>
                        <button
                          className="cursor-pointer"
                          title="Eliminar servicio"
                          onClick={() => {
                            setSavedServices((prev) =>
                              prev.filter((s) => s.id !== service.id),
                            );
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <button
                          className="cursor-pointer"
                          title="Agregar al presupuesto"
                          onClick={() => addService(service)}
                        >
                          <Plus className="h-3 w-3" />{" "}
                        </button>
                      </div>
                    </div>
                    {service.details.map((detail) => (
                      <p className="text-gray-700" key={detail}>
                        ● {detail}
                      </p>
                    ))}

                    <p>$ {service.unitPrice} </p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl">DETALLES Y CONDICIONES</h2>

              <div className="border p-2">
                <p>Detalles:</p>
                <div className="pl-1 flex flex-col">
                  {savedDescriptions.map(({ id, text }) => (
                    <div className="max-w-[300px]" key={id}>
                      <EditableField
                        className="border border-gray-200 p-2"
                        value={text}
                        onChange={(value) => {
                          setSavedDescriptions((prev) =>
                            prev.map((desc) =>
                              desc.id === id ? { ...desc, text: value } : desc,
                            ),
                          );
                        }}
                      ></EditableField>

                      <button
                        onClick={() => {
                          setSavedDescriptions((prev) =>
                            prev.filter((d) => d.id !== id),
                          );
                        }}
                        className="border cursor-pointer p-1"
                      >
                        ELIMINAR
                      </button>
                      <button
                        onClick={() => setDescription(text)}
                        className="border cursor-pointer p-1"
                      >
                        USAR
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border p-2">
                <p>Condiciones de pago:</p>

                <div className="pl-1 flex flex-col">
                  {savedConditions.map(({ id, text }) => (
                    <div className="max-w-[300px]" key={id}>
                      <EditableField
                        className="border border-gray-200 p-2"
                        value={text}
                        onChange={(value) => {
                          setSavedConditions((prev) =>
                            prev.map((desc) =>
                              desc.id === id ? { ...desc, text: value } : desc,
                            ),
                          );
                        }}
                      ></EditableField>

                      <button
                        onClick={() => {
                          setSavedConditions((prev) =>
                            prev.filter((d) => d.id !== id),
                          );
                        }}
                        className="border cursor-pointer p-1"
                      >
                        ELIMINAR
                      </button>
                      <button
                        onClick={() => setConditions(text)}
                        className="border cursor-pointer p-1"
                      >
                        USAR
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl">Informacion de perfil</h2>
              <div>
                <p>Nombre completo:</p>
                <EditableField
                  value={userProfile.fullName}
                  onChange={(value) => onChangeUserProfile("fullName", value)}
                ></EditableField>
              </div>
              <div>
                <p>Rol empleado:</p>
                <EditableField
                  value={userProfile.role}
                  onChange={(value) => onChangeUserProfile("role", value)}
                ></EditableField>
              </div>
              <div>
                <p>Numero de contacto:</p>
                <EditableField
                  value={userProfile.contactNumber}
                  onChange={(value) =>
                    onChangeUserProfile("contactNumber", value)
                  }
                ></EditableField>
              </div>

              <div>
                <p>Sitio web a mostrar:</p>
                <EditableField
                  value={userProfile.website}
                  onChange={(value) => onChangeUserProfile("website", value)}
                ></EditableField>
              </div>

              <div>
                <p>Logo guardado:</p>
                <EditableField
                  value={userProfile.logo}
                  onChange={(value) => onChangeUserProfile("logo", value)}
                ></EditableField>
                <ImageUpload
                  defaultSrc={userProfile.logo}
                  onUpload={(url) => onChangeUserProfile("logo", url)}
                  onRemove={() => onChangeUserProfile("logo", "")}
                />
              </div>

              <div>
                <p>QR GUARDADO</p>
                <EditableField
                  value={userProfile.qr}
                  onChange={(value) => onChangeUserProfile("qr", value)}
                ></EditableField>
                <ImageUpload
                  defaultSrc={userProfile.qr}
                  onUpload={(url) => onChangeUserProfile("qr", url)}
                  onRemove={() => onChangeUserProfile("qr", "")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
