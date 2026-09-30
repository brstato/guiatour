import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SpotEditableFieldProps {
  label: string;
  value: string | undefined;
  onSave: (val: string) => void;
  multiline?: boolean;
  decimal?: boolean;
  uppercase?: boolean;
  maxLength?: number;
  placeholder?: string;
  error?: string | null;
}

export function SpotEditableField({
  label,
  value,
  onSave,
  multiline = false,
  decimal = false,
  uppercase = false,
  maxLength,
  placeholder,
  error
}: SpotEditableFieldProps) {
  const [localValue, setLocalValue] = useState(value || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  useLayoutEffect(() => {
    if (multiline && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localValue, multiline]);

  const handleBlur = () => {
    if (localValue !== (value || '')) {
      onSave(localValue);
    }
  };

  return (
    <div className="mb-3.5 last:mb-0">
      <div className="flex justify-between items-center mb-1">
        <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">
          {label}
        </p>
        {maxLength && (
          <span className="text-[10px] font-medium text-slate-400">
            {Math.max(0, maxLength - localValue.length)} restantes
          </span>
        )}
      </div>
      {multiline ? (
        <textarea
          ref={textareaRef}
          value={localValue}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          className={cn(
            "w-full bg-transparent border-none p-0 text-sm font-medium focus:outline-none focus:border-b-2 focus:border-[#2563eb] transition-none resize-none overflow-hidden text-slate-900 placeholder:text-slate-400",
            error && "text-red-500"
          )}
        />
      ) : (
        <Input
          inputMode={decimal ? "decimal" : undefined}
          value={localValue}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => {
            let val = e.target.value;
            if (decimal) {
              val = val.replace(/[^0-9.,-]/g, '');
            }
            if (uppercase) {
              val = val.toUpperCase();
            }
            setLocalValue(val);
          }}
          onBlur={handleBlur}
          className={cn(
            "bg-transparent border-none p-0 h-auto text-sm font-semibold focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-[#2563eb] rounded-none transition-none shadow-none text-slate-900 placeholder:text-slate-400",
            error && "text-red-500 border-b-2 border-red-500"
          )}
        />
      )}
      {error && (
        <p className="text-[10px] text-red-500 font-bold mt-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
