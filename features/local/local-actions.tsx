"use client";

import { createContext, useContext, type PropsWithChildren } from "react";
import { saveService, updateService, deleteService } from "@/features/services-catalog/actions";
import { createTextItem, deleteTextItem } from "@/features/text-item/actions";
import { createClient } from "@/features/clients/actions";
import { changeSentStatus, emitBudget } from "@/features/budget/actions";
import { uploadPublicImage } from "@/lib/storage";
import {
  createLocalClient,
  changeLocalSentStatus,
  deleteLocalService,
  emitLocalBudget,
  saveLocalService,
  updateLocalService,
  createLocalTextItem,
  deleteLocalTextItem,
  uploadLocalImage,
} from "./store";

/**
 * Acciones que el editor comparte entre la versión con login (server
 * actions) y la versión de prueba (T-007, localStorage). Los componentes
 * las consumen con `useBudgetActions()`: por defecto obtienen las del
 * servidor, y dentro de `LocalActionsProvider` las locales.
 */
export interface BudgetActions {
  saveService: typeof saveService;
  updateService: typeof updateService;
  deleteService: typeof deleteService;
  createTextItem: typeof createTextItem;
  deleteTextItem: typeof deleteTextItem;
  createClient: typeof createClient;
  changeSentStatus: typeof changeSentStatus;
  emitBudget: typeof emitBudget;
  uploadImage: typeof uploadPublicImage;
}

const serverActions: BudgetActions = {
  saveService,
  updateService,
  deleteService,
  createTextItem,
  deleteTextItem,
  createClient,
  changeSentStatus,
  emitBudget,
  uploadImage: uploadPublicImage,
};

const localActions: BudgetActions = {
  saveService: saveLocalService,
  updateService: updateLocalService,
  deleteService: deleteLocalService,
  createTextItem: createLocalTextItem,
  deleteTextItem: deleteLocalTextItem,
  createClient: createLocalClient,
  changeSentStatus: changeLocalSentStatus,
  emitBudget: emitLocalBudget,
  uploadImage: uploadLocalImage,
};

const ActionsContext = createContext<BudgetActions>(serverActions);

export function LocalActionsProvider({ children }: PropsWithChildren) {
  return (
    <ActionsContext.Provider value={localActions}>
      {children}
    </ActionsContext.Provider>
  );
}

export function useBudgetActions(): BudgetActions {
  return useContext(ActionsContext);
}
