"use client";

import { useEffect, useState, useRef } from "react";
import { DEFAULT_BUDGET } from "@/lib/default_budget";
import { v4 as uuid } from "uuid";
import type { Client } from "@/features/clients/types";
import { useDebouncedCallback } from "use-debounce";
import { Budget, CheckEmpty, type SentStatus } from "@/features/budget/types";
import { updateBudget } from "../actions";

type BudgetInfo = Omit<Budget, "services" | "participants" | "dates">;
type Service = Budget["services"][number];
type Participant = Budget["participants"][number];
type Dates = Budget["dates"];
type AutoSavePayload = Omit<Budget, "sent_status">;
export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

// sent_status se cambia únicamente con la action changeSentStatus: el autoguardado
// nunca lo escribe, así un guardado pendiente no puede pisar el estado recién cambiado.
function toAutoSavePayload(
  state: BudgetInfo,
  services: Service[],
  participants: Participant[],
  dates: Dates,
  totalPrice: number,
): AutoSavePayload {
  const payload = {
    ...state,
    services,
    participants,
    dates,
    total_price_services: totalPrice,
  } as AutoSavePayload & { sent_status?: SentStatus };

  delete payload.sent_status;

  return payload;
}

export function useBudget(initialBudget?: Budget) {
  const budgetData = initialBudget || DEFAULT_BUDGET;
  const firstRender = useRef(true);

  const {
    services: initialServices,
    participants: initialParticipants,
    dates: initialDates,
    ...initialBudgetData
  } = budgetData;

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [services, setServices] = useState<Service[]>(initialServices);
  const [participants, setParticipants] =
    useState<Participant[]>(initialParticipants);
  const [dates, setDates] = useState<Dates>(initialDates);
  const [budgetState, setBudgetState] = useState<BudgetInfo>(initialBudgetData);
  const total_price_services = services.reduce(
    (acumulator, current) => acumulator + current.price * current.quantity,
    0,
  );

  const saveChanges = async (dataToSave: AutoSavePayload) => {
    setSaveStatus("saving");
    try {
      const result = await updateBudget(dataToSave);
      setSaveStatus(result.ok ? "saved" : "error");
    } catch (error) {
      // Fallo de red: la action devuelve resultado tipado, esto cubre lo inesperado.
      console.error("Error al autoguardar:", error);
      setSaveStatus("error");
    }
  };

  const debouncedSave = useDebouncedCallback(
    (updatedBudget: AutoSavePayload) => {
      saveChanges(updatedBudget);
    },
    800,
  );

  const createBlankService = () => {
    setServices((p) =>
      p.concat({
        id: uuid(),
        name: "Nuevo Servicio",
        details: ["Agrega detalles"],
        quantity: 1,
        price: 0,
      }),
    );
  };

  const removeService = (id: string) => {
    setServices((p) => p.filter((s) => s.id !== id));
  };

  const editService = (id: string, proper: Partial<Service>) => {
    setServices((p) => p.map((p) => (p.id === id ? { ...p, ...proper } : p)));
  };

  const createBlankParticipant = () => {
    setParticipants((p) =>
      p.concat({
        id: uuid(),
        name: "Noombre",
        role: "Rol",
      }),
    );
  };

  const removeParticipant = (id: string) => {
    setParticipants((p) => p.filter((p) => p.id !== id));
  };

  const editParticipant = (id: string, proper: Partial<Participant>) => {
    setParticipants((p) =>
      p.map((p) => (p.id === id ? { ...p, ...proper } : p)),
    );
  };

  const editDates = (date: keyof Dates, value: string) => {
    setDates((p) => ({ ...p, [date]: value }));
  };

  const editBudgetInfo = (proper: Partial<BudgetInfo>) => {
    setBudgetState((p) => ({ ...p, ...proper }));
  };

  // Merge anidado: editBudgetInfo haría un merge shallow y pisaría el objeto
  // settings completo, perdiendo los otros toggles.
  const editSetting = (key: keyof BudgetInfo["settings"], value: boolean) => {
    setBudgetState((p) => ({
      ...p,
      settings: { ...p.settings, [key]: value },
    }));
  };

  // Solo se llama después de que changeSentStatus devuelve ok: true.
  const setSentStatus = (sentStatus: SentStatus) => {
    setBudgetState((p) => ({ ...p, sent_status: sentStatus }));
  };

  // El id lo genera acá: "Usar" del catálogo arma el ítem sin id para no
  // arrastrar el id del catálogo al presupuesto.
  const addService = (service: Omit<Service, "id">) => {
    setServices((prev) => [
      ...prev,
      {
        ...service,
        id: uuid(),
      },
    ]);
  };

  const setBudget = (budget: Budget) => {
    const { services, participants, dates, ...data } = budget;
    setServices(services);
    setDates(dates);
    setParticipants(participants);
    setBudgetState(data);
  };

  const addDetailText = (text: string) => {
    setBudgetState((prev) => ({
      ...prev,
      budget_details: text,
    }));
  };

  const addConditions = (text: string) => {
    setBudgetState((prev) => ({
      ...prev,
      conditions: text,
    }));
  };

  const checkEmpty = () => {
    const data = CheckEmpty.safeParse({
      ...budgetState,
      services,
      participants,
      dates,
    });

    return data;
  };

  const selectClient = (client: Client) => {
    setBudgetState((prev) => ({
      ...prev,
      client_id: client.id,
      client_name: client.name,
    }));
  };

  const cleanBudget = () => {
    setBudgetState(initialBudgetData);
    setServices(initialServices);
    setParticipants(initialParticipants);
    setDates(initialDates);
  };

  useEffect(() => {
    // 1. Ignorar el render inicial
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const executeSave = () => {
      debouncedSave(
        toAutoSavePayload(
          budgetState,
          services,
          participants,
          dates,
          total_price_services,
        ),
      );
    };

    executeSave();
  }, [
    budgetState,
    services,
    participants,
    dates,
    total_price_services,
    debouncedSave,
  ]);

  return {
    budget: {
      ...budgetState,
      services,
      participants,
      dates,
      total_price_services,
    },
    methods: {
      createBlankService,
      createBlankParticipant,
      editParticipant,
      editService,
      editDates,
      editBudgetInfo,
      editSetting,
      setSentStatus,
      removeParticipant,
      removeService,
      cleanBudget,
      addService,
      setBudget,
      addConditions,
      addDetailText,
      selectClient,
      checkEmpty,
    },
    status: saveStatus,
  };
}

export type HookReturn = ReturnType<typeof useBudget>;
