import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { LogOut, MapPin, ExternalLink } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuthController } from "@/features/auth/hooks/useAuthController";
import { useAccountController } from "@/features/settings/hooks/useAccountController";
import { cn } from "@/lib/utils";

/**
 * Layout principal da aplicação para usuários autenticados.
 * Define a estrutura base da página, incluindo cores de fundo, elementos decorativos
 * e a área principal de conteúdo onde as rotas internas são renderizadas.
 */
export function AppLayout() {
  const { handleLogout } = useAuthController();
  const { data: account, loadData: loadAccount } = useAccountController();

  useEffect(() => {
    const userId = localStorage.getItem("id_loja") || localStorage.getItem("id");
    if (userId && !account) {
      loadAccount();
    }
  }, [loadAccount, account]);

  const publicUrl = account?.slug ? `https://${account.slug}.guiatour.online` : "#";

  return (
    <div className="h-screen bg-slate-50 bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex flex-col relative overflow-hidden text-slate-900">
      {/* Elementos decorativos de fundo (efeito de brilho e degradê suave) */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header com Logout */}
      <header className="z-20 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 border border-blue-100/80 rounded-lg flex items-center justify-center shadow-xs">
            <MapPin className="h-4.5 w-4.5 text-[#2563eb]" />
          </div>
          <span className="text-slate-900 font-extrabold tracking-tight uppercase text-sm">Guia Tour</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 h-8 w-8 p-0 sm:w-auto sm:px-3 transition-colors font-medium"
            )}
          >
            <ExternalLink className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline text-xs font-medium">Ver página</span>
          </a>

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

      <div className="flex flex-1 z-10 overflow-hidden">
        <main className="flex-1 overflow-hidden">
          {/* Renderiza o conteúdo das rotas filhas */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
