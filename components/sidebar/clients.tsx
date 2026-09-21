import { CircleAlert, Ellipsis } from "lucide-react";
import type { Client } from "@/types/user";
import { useAppContext } from "@/app/edit/[id]/provider";
import {
  createClient,
  deleteClient,
  updateClient,
} from "@/actions/user.actions";
import { useActionState, startTransition, SubmitEvent, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface Params {
  clientsList: Client[];
}

export function ClientsList({ clientsList }: Params) {
  const myAction = async (prevState: unknown, payload: string) => {
    await createClient(payload);
  };

  const [, action, pendit] = useActionState(myAction, null);

  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    startTransition(() => {
      e.preventDefault();
      const name = e.target.querySelector("input");
      if (!name) return;
      action(name.value);
      name.value = "";
    });
  };

  return (
    <div>
      <h2>Lista de clientes</h2>

      <div className="flex gap-x-1">
        <CircleAlert className="w-4 h-4 mt-0.5" />
        <p className="text-sm text-gray-700">
          Para no perder la trazabilidad de este presupuesto, asocialo a un
          cliente o crea uno nuevo{" "}
          <span className="font-bold text-black">aqui</span>.
        </p>
      </div>

      <div>
        <form onSubmit={onSubmit} className="flex items-center my-3 gap-1">
          <input
            type="text"
            placeholder="Nombre..."
            className="border p-2 rounded-md w-full "
            name="name"
            id="name"
          />
          <button type="submit" className="border p-2 rounded-md">
            {" "}
            Crear
          </button>

          {pendit && "Creando...."}
        </form>
        {clientsList.map((client) => (
          <ClientItem key={client.id} {...client} />
        ))}
      </div>
    </div>
  );
}

function ClientItem(client: Client) {
  const { methods } = useAppContext();
  const [editing, setEditing] = useState(false);
  const [, deleteClientAction, deleteLoading] = useActionState(
    (state: unknown, payload: string) => deleteClient(payload),
    null,
  );

  const [, updateClientAction, updateLoading] = useActionState(
    (state: unknown, payload: Client) => updateClient(payload),
    null,
  );

  const onDelete = () => {
    startTransition(() => {
      deleteClientAction(client.id);
    });
  };

  const openEdit = () => setEditing(true);
  const closeEdit = () => setEditing(false);

  const onSubmitEdit = async (e: SubmitEvent<HTMLFormElement>) => {
    startTransition(async () => {
      e.preventDefault();
      const name = e.target.querySelector("input");
      if (!name) return;
      await updateClientAction({
        ...client,
        name: name.value,
      });
      closeEdit();
    });
  };

  const splitedName = client.name.trimEnd().trimStart().split(" ");
  const lettersName =
    splitedName.length > 1
      ? `${splitedName[0][0] + splitedName[1][0]}`
      : client.name.slice(0, 2);

  const onSelectClient = () => {
    methods.selectClient(client);
  };

  return (
    <div className="rounded-md hover:bg-purple-200 flex items-center gap-5 p-2">
      {editing ? (
        <form onSubmit={onSubmitEdit}>
          <input
            type="text"
            name="name"
            id="name"
            defaultValue={client.name}
            className="w-full border p-2 rounded-md"
          />
          <div className="space-x-2">
            <button onClick={closeEdit} className="border p-2 rounded-md">
              Cancelar
            </button>
            <button type="submit" className="border p-2 rounded-md">
              Guardar
            </button>
          </div>
        </form>
      ) : (
        <>
          <span className="text-gray-900 p-2 text-center max-w-[40px] block w-full rounded-md bg-slate-200">
            {lettersName}
          </span>

          <p className="text-xl font-semibold">{client.name}</p>
        </>
      )}
      {deleteLoading && "eliminando..."}
      {updateLoading && "actualizando..."}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Ellipsis />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onSelectClient}>Usar</DropdownMenuItem>
            <DropdownMenuItem onClick={openEdit}>Editar</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onDelete}>Eliminar</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
