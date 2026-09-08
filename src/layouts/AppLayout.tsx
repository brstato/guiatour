import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { LogOut, Feather, ExternalLink } from "lucide-react";
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
    const userId = localStorage.getItem("id");
    if (userId && !account) {
      loadAccount(userId);
    }
  }, [loadAccount, account]);

  const publicUrl = account?.slug ? `https://${account.slug}.inkers.com.br` : "#";

  return (
    <div className="h-screen bg-[#0f1420] flex flex-col relative overflow-hidden">
      {/* Elementos decorativos de fundo (efeito de brilho) */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F7931E]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#F7931E]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header com Logout */}
      <header className="z-20 flex items-center justify-between px-6 py-4 bg-[#141a2b]/40 backdrop-blur-md border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F7931E]/10 rounded-lg flex items-center justify-center">
            <Feather className="h-5 w-5 text-[#F7931E]" />
          </div>
          <span className="text-white font-bold tracking-tight uppercase text-sm">Inkers</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-[#8a94a6] hover:text-white hover:bg-white/5 h-8 w-8 p-0 sm:w-auto sm:px-3 transition-colors"
            )}
          >
            <ExternalLink className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline text-xs font-medium">Ver página</span>
          </a>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-[#8a94a6] hover:text-white hover:bg-white/5 h-8 w-8 p-0 sm:w-auto sm:px-3 gap-2 transition-colors group"
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
