import { cn } from "@/lib/utils";

interface SpotVisibilityToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function SpotVisibilityToggle({
  checked,
  onChange,
  label,
  disabled = false
}: SpotVisibilityToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 shadow-xs">
      <span className={cn(
        "text-sm font-bold tracking-tight transition-colors",
        checked ? "text-slate-900" : "text-slate-500"
      )}>
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "w-12 h-6 rounded-full relative transition-all duration-300 p-1 outline-none focus:ring-2 focus:ring-blue-500/20",
          checked ? "bg-[#2563eb]" : "bg-slate-300",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        )}
      >
        <div className={cn(
          "w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
          checked ? "translate-x-6" : "translate-x-0"
        )} />
      </button>
    </div>
  );
}
