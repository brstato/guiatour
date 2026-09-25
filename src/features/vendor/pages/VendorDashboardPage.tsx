import { Plus, Search, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVendorController } from "../hooks/useVendorController";
import { MerchantList } from "../components/MerchantList";
import { EmptyMerchantsState } from "../components/EmptyMerchantsState";
import { VendorHeader } from "../components/VendorHeader";
import { useNavigate } from "react-router-dom";

export default function VendorDashboardPage() {
  const { 
    merchants, 
    isLoading, 
    error, 
    selectMerchant, 
    reload 
  } = useVendorController();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <VendorHeader />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Painel do Vendedor
              </h1>
              <p className="text-slate-500 mt-1">
                Gerencie seus comerciantes e acompanhe o crescimento da rede.
              </p>
            </div>

            <Button 
              onClick={() => navigate('/vendedor/comerciantes/novo')}
              className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 h-11 px-6"
            >
              <Plus className="h-4.5 w-4.5" />
              Novo Comerciante
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-slate-800 self-start sm:self-center">
                Seus Comerciantes
                {merchants.length > 0 && (
                  <span className="ml-2 text-sm font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {merchants.length}
                  </span>
                )}
              </h2>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Buscar comércio..." 
                  className="pl-10 h-10 border-slate-200 focus-visible:ring-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Carregando comerciantes...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 border-2 border-red-50 bg-red-50/20 rounded-2xl text-center">
                <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                <h3 className="text-lg font-bold text-red-900 mb-1">
                  Erro ao carregar comerciantes
                </h3>
                <p className="text-red-600/80 mb-6 max-w-xs">
                  Não foi possível conectar ao servidor. Verifique sua conexão.
                </p>
                <Button variant="outline" onClick={() => reload()} className="border-red-200 text-red-700 hover:bg-red-50">
                  Tentar Novamente
                </Button>
              </div>
            ) : merchants.length > 0 ? (
              <MerchantList 
                merchants={merchants} 
                onEdit={selectMerchant} 
              />
            ) : (
              <EmptyMerchantsState />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
