import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VendorHeader } from "../components/VendorHeader";
import { MetricasView } from "@/features/portfolio/components/MetricasView";
import { useMetricas } from "@/features/portfolio/hooks/useMetricas";

/**
 * Métricas de UMA loja, vistas pelo vendedor dono dela ou por um administrador.
 * O servidor confere o acesso (GET account/metricas): outra loja devolve 403 e a tela mostra o erro.
 */
export default function MetricasLojaPage() {
    const { uuid } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [dias, setDias] = useState<number>(30);
    const consulta = useMetricas(uuid, dias);

    // O nome vem da tela anterior (ranking ou lista de lojas); sem ele, usa um título genérico.
    const nome = (location.state as { nome?: string } | null)?.nome;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <VendorHeader />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-6 pt-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="mb-2 gap-2 pl-0 text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="h-4 w-4" /> Voltar
                    </Button>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Métricas</h1>
                    <p className="mt-1 text-slate-500 truncate">{nome || "Loja"}</p>
                </div>

                <MetricasView consulta={consulta} dias={dias} onDias={setDias} />
            </main>
        </div>
    );
}
