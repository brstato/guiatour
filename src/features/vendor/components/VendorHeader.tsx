import { LogOut, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthController } from "@/features/auth/hooks/useAuthController";

export function VendorHeader() {
  const { handleLogout } = useAuthController();

  return (
    <header className="z-20 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-blue-50 border border-blue-100/80 rounded-lg flex items-center justify-center shadow-xs">
          <MapPin className="h-4.5 w-4.5 text-[#2563eb]" />
        </div>
        <span className="text-slate-900 font-extrabold tracking-tight uppercase text-sm">Guia Tour</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-600">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium hidden sm:inline">Vendedor</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 h-8 w-8 p-0 sm:w-auto sm:px-3 gap-2 transition-colors group font-medium"
        >
          <span className="hidden sm:inline text-xs font-medium">Sair</span>
          <LogOut className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </header>
  );
}
