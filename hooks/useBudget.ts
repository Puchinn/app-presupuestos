"use client";

import { useEffect, useState, useRef } from "react";
import type { Budget } from "@/types/budget";
import { DEFAULT_BUDGET } from "@/lib/default_budget";
import { v4 as uuid } from "uuid";
import type { Client } from "@/types/user";
import { updateBudget } from "@/actions/budget.actions";
import { useDebouncedCallback } from "use-debounce";
import { CheckEmpty } from "@/types/budget";

type BudgetInfo = Omit<Budget, "services" | "participants" | "dates">;
type Service = Budget["services"][number];
type Participant = Budget["participants"][number];
type Dates = Budget["dates"];
export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

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

  const saveChanges = async (dataToSave: Budget) => {
    setSaveStatus("saving");
    try {
      const result = await updateBudget(dataToSave);
      if (result.success) {
        setSaveStatus("saved");
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Error al autoguardar:", error);
      setSaveStatus("error");
    }
  };

  const debouncedSave = useDebouncedCallback((updatedBudget: Budget) => {
    saveChanges(updatedBudget);
  }, 800);

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

  const addService = (service: Service) => {
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
      debouncedSave({
        ...budgetState,
        services,
        participants,
        dates,
        total_price_services,
      });
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
