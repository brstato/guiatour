import { Store, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function EmptyMerchantsState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl text-center">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <Store className="h-8 w-8 text-blue-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">
        Você ainda não possui comerciantes cadastrados
      </h3>
      <p className="text-slate-500 max-w-sm mb-8">
        Comece cadastrando seu primeiro estabelecimento para gerenciar o portfólio e métricas.
      </p>
      <Button 
        onClick={() => navigate('/vendedor/comerciantes/novo')}
        className="gap-2 bg-blue-600 hover:bg-blue-700 h-11 px-6 shadow-md shadow-blue-200"
      >
        <Plus className="h-4 w-4" />
        Cadastrar Primeiro Comerciante
      </Button>
    </div>
  );
}
