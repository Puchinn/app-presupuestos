import type { TextItem } from "@/types/resources";
import { TextItem as TextItemComponent } from "../ui/textitem";
import { CreateTextItem } from "./createtextitem";

export function TextsList({ texts }: { texts: TextItem[] }) {
  return (
    <div>
      <h2>Textos guardados</h2>
      {!texts.length && "Sin textos guardados. Comienze a crear aqui"}
      <CreateTextItem />
      <div className="space-y-2 mt-2">
        {texts.map((text) => (
          <TextItemComponent key={text.id} text={text} />
        ))}
      </div>
    </div>
  );
}
