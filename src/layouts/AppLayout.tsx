import { Outlet } from "react-router-dom";

/**
 * Layout principal da aplicação para usuários autenticados.
 * Define a estrutura base da página, incluindo cores de fundo, elementos decorativos
 * e a área principal de conteúdo onde as rotas internas são renderizadas.
 */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#0f1420] flex flex-col relative overflow-hidden">
      {/* Elementos decorativos de fundo (efeito de brilho) */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F7931E]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#F7931E]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-1 z-10">
        <main className="flex-1 overflow-y-auto">
          {/* Renderiza o conteúdo das rotas filhas */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
