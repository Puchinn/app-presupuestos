import { createNewBudget } from "@/actions/budget.actions";
import { redirect } from "next/navigation";

export default async function Page() {
  const id = await createNewBudget();
  redirect(`/edit/${id}`);
}
