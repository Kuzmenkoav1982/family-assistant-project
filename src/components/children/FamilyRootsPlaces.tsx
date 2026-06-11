import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import {
  SectionCard,
  InlineEmpty,
  AdaptiveDialog,
  DialogSubmit,
  FormField,
  FormInput,
  EmojiPicker,
} from "@/components/children/ui";

// ─── Типы ─────────────────────────────────────────────────────────────────────

export interface LocalPlace {
  id: string;
  name: string;
  note: string;
  emoji: string;
}

// ─── Диалог добавления места ──────────────────────────────────────────────────

const PLACE_EMOJIS = ["🏡", "🌲", "🏖️", "🏔️", "🌊", "🌸", "🏙️", "🛖", "⛺", "🌾", "🏛️", "🎡"];

export function AddPlaceDialog({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (p: LocalPlace) => void;
}) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [emoji, setEmoji] = useState("🏡");

  const canSubmit = name.trim().length >= 1;

  const handleSave = () => {
    if (!canSubmit) return;
    onSave({ id: Date.now().toString(), name: name.trim(), note: note.trim(), emoji });
    onClose();
  };

  return (
    <AdaptiveDialog
      title="Добавить место"
      onClose={onClose}
      footer={
        <DialogSubmit
          label="Сохранить место"
          disabled={!canSubmit}
          onClick={handleSave}
          variant="teal"
        />
      }
    >
      <FormField label="Значок">
        <EmojiPicker
          options={PLACE_EMOJIS}
          value={emoji}
          onChange={setEmoji}
          activeClass="border-teal-300 bg-teal-50"
        />
      </FormField>

      <FormField label="Название" required>
        <FormInput
          value={name}
          onChange={setName}
          placeholder="Например: Дача у бабушки"
          focusColor="focus:border-teal-300"
        />
      </FormField>

      <FormField label="Почему это место важно">
        <FormInput
          value={note}
          onChange={setNote}
          placeholder="Там всегда пахнет пирогами и летом"
          focusColor="focus:border-teal-300"
        />
      </FormField>
    </AdaptiveDialog>
  );
}

// ─── Секция «Наши места» ──────────────────────────────────────────────────────

export function PlacesSection({
  localPlaces,
  apiPlaces,
  onAddPlace,
}: {
  localPlaces: LocalPlace[];
  apiPlaces: string[];
  onAddPlace: () => void;
}) {
  const hasPlaces = localPlaces.length > 0 || apiPlaces.length > 0;

  return (
    <SectionCard
      title="Наши места"
      icon="MapPin"
      iconBg="bg-teal-50"
      action={
        <button
          onClick={onAddPlace}
          className="text-xs text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-0.5"
        >
          <Plus size={11} /> Добавить
        </button>
      }
    >
      {!hasPlaces ? (
        <InlineEmpty
          emoji="🗺️"
          text="Добавьте любимые места семьи"
          action="Добавить место"
          onAction={onAddPlace}
        />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {localPlaces.map(p => (
            <div key={p.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start gap-2">
              <span className="text-xl flex-shrink-0">{p.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{p.name}</p>
                {p.note && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-snug">{p.note}</p>}
              </div>
            </div>
          ))}
          {apiPlaces.map((loc, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start gap-2">
              <MapPin size={16} className="text-teal-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{loc}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Место из воспоминаний</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
