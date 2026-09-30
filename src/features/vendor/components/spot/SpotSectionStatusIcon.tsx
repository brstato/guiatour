import { Check, Circle } from "lucide-react";

interface SpotSectionStatusIconProps {
  status: "complete" | "pending";
}

export function SpotSectionStatusIcon({ status }: SpotSectionStatusIconProps) {
  if (status === "complete") {
    return <Check className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />;
  }
  return <Circle className="h-4 w-4 text-slate-300" strokeWidth={2} />;
}
