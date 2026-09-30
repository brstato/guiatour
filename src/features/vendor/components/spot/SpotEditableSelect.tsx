import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SpotEditableSelectProps {
  label: string;
  value: string | number | undefined;
  options: Array<{ id: string | number; name: string }>;
  onSave: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string | null;
}

export function SpotEditableSelect({
  label,
  value,
  options,
  onSave,
  placeholder = "Selecione uma categoria",
  disabled = false,
  error
}: SpotEditableSelectProps) {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleBlur = () => {
    if (localValue !== (value || '')) {
      onSave(localValue.toString());
    }
  };

  return (
    <div className="mb-3.5 last:mb-0">
      <div className="flex justify-between items-center mb-1">
        <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">
          {label}
        </p>
      </div>
      <div className="relative">
        <select
          value={localValue}
          disabled={disabled || options.length === 0}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          className={cn(
            "w-full bg-transparent border-none p-0 h-auto text-sm font-semibold focus:outline-none focus:border-b-2 focus:border-[#2563eb] rounded-none transition-none shadow-none appearance-none cursor-pointer text-slate-900",
            error && "text-red-500 border-b-2 border-red-500",
            (disabled || options.length === 0) && "opacity-50 cursor-not-allowed"
          )}
        >
          <option value="" disabled className="bg-white">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.id} value={opt.id} className="bg-white text-slate-900">
              {opt.name}
            </option>
          ))}
        </select>
        {options.length === 0 && !disabled && (
          <p className="text-[10px] text-slate-400 mt-1">Nenhuma categoria disponível</p>
        )}
      </div>
      {error && (
        <p className="text-[10px] text-red-500 font-bold mt-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
