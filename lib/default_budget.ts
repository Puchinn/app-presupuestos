import type { Budget } from "@/features/budget/types";

export const DEFAULT_BUDGET: Budget = {
  id: "",
  user_id: "",
  client_id: null,
  public_code: "BORRADOR#",
  dates: {
    sent: "",
    estimated: "",
  },
  client_name: "",
  logo_url: "",
  services: [],
  conditions: "",
  budget_details: "",
  participants: [
    {
      id: "",
      name: "Tu Nombre",
      role: "Rol desempeñado",
    },
  ],
  website: "misitioweb.com",
  contact_number: "+11 11 111111",
  footer_img_url: "",
  status: "draft",
  settings: {
    show_budget_conditions: true,
    show_budget_details: true,
    show_footer_url: true,
    show_logo_url: true,
  },
  sent_status: "draft",
  total_price_services: 0,
};
