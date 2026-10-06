import { QrCode, CreditCard, Barcode, Check } from "lucide-react";
import type { FormaPagamento } from "../types";

interface PaymentMethodPickerProps {
  value: FormaPagamento | null;
  onChange: (forma: FormaPagamento) => void;
}

const METHODS: { id: FormaPagamento; label: string; sub: string; icon: any }[] = [
  { id: "PIX", label: "Pix", sub: "Aprovação na hora", icon: QrCode },
  { id: "CREDIT_CARD", label: "Cartão de crédito", sub: "Renova sozinho todo ciclo", icon: CreditCard },
  { id: "BOLETO", label: "Boleto", sub: "Compensa em dias úteis", icon: Barcode },
];

export function PaymentMethodPicker({ value, onChange }: PaymentMethodPickerProps) {
  return (
    <div role="radiogroup" aria-label="Forma de pagamento" className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {METHODS.map((m) => {
        const Icon = m.icon;
        const selected = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(m.id)}
            className={`w-full text-left rounded-2xl p-4 transition-all border bg-white shadow-sm flex flex-col justify-between relative ${
              selected
                ? "border-[#2563eb] ring-2 ring-[#2563eb]/20 shadow-md bg-blue-50/30"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selected ? "bg-[#2563eb] text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selected ? "border-[#2563eb] bg-[#2563eb] text-white" : "border-slate-300 bg-white"
                }`}
              >
                {selected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-900 block">{m.label}</span>
              <span className="text-xs text-slate-500 mt-0.5 block">{m.sub}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
