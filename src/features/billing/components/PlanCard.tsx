import { Check } from "lucide-react";
import type { Plano } from "../types";
import { cycleSuffix, formatMoney } from "../lib/format";

interface PlanCardProps {
  plano: Plano;
  selected: boolean;
  onSelect: (codigo: string) => void;
}

export function PlanCard({ plano, selected, onSelect }: PlanCardProps) {
  const itens = plano.descricao ? plano.descricao.split("|").filter(Boolean) : [];

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(plano.codigo)}
      className={`w-full text-left rounded-2xl p-5 transition-all border bg-white shadow-sm flex flex-col justify-between ${
        selected
          ? "border-[#2563eb] ring-2 ring-[#2563eb]/20 shadow-md"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Plano
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-0.5">{plano.nome}</h3>
        </div>
        <div
          className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
            selected ? "border-[#2563eb] bg-[#2563eb] text-white" : "border-slate-300 bg-white"
          }`}
        >
          {selected && <Check className="w-4 h-4 stroke-[3]" />}
        </div>
      </div>

      <div className="mb-4">
        <span className="text-2xl font-extrabold text-slate-900">{formatMoney(plano.valor)}</span>
        <span className="text-sm font-medium text-slate-500 ml-1">{cycleSuffix(plano.ciclo)}</span>
      </div>

      <ul className="space-y-2 pt-3 border-t border-slate-100 text-sm text-slate-600">
        {itens.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}
