import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Loader2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VendorHeader } from "../components/VendorHeader";
import { MetricasView } from "@/features/portfolio/components/MetricasView";
import { useMetricasRede, type EscopoRede, type LojaRanking } from "@/features/portfolio/hooks/useMetricas";
import { useAdminAcesso } from "@/features/admin/hooks/useAdminAcesso";

const formatNumber = (num: number) => new Intl.NumberFormat("pt-BR").format(num);

function RankingLojas({ lojas, onAbrir }: { lojas: LojaRanking[]; onAbrir: (loja: LojaRanking) => void }) {
    return (
        <Card className="p-6 bg-white border border-slate-200/80 rounded-[2rem] space-y-4 shadow-sm">
            <div className="space-y-1">
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Ranking</p>
                <h3 className="text-xl font-bold text-slate-900">Lojas com mais interações</h3>
            </div>
            {lojas.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhuma loja teve movimento neste período.</p>
            ) : (
                <div className="space-y-2">
                    {lojas.map((loja, i) => (
                        <button
                            key={loja.uuid}
                            type="button"
                            onClick={() => onAbrir(loja)}
                            className="w-full flex items-center gap-3 p-4 bg-slate-50/80 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 text-left transition-colors cursor-pointer"
                        >
                            <span className="w-6 text-sm font-black text-slate-400 shrink-0">{i + 1}</span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-bold text-slate-900">{loja.nome}</span>
                                <span className="block truncate text-xs text-slate-500">
                                    {formatNumber(loja.visitas)} {loja.visitas === 1 ? "visita" : "visitas"} ·{" "}
                                    {formatNumber(loja.whats)} WhatsApp · {formatNumber(loja.rotas)}{" "}
                                    {loja.rotas === 1 ? "rota" : "rotas"}
                                </span>
                            </span>
                            <span className="text-xs font-bold text-slate-600 shrink-0">
                                {formatNumber(loja.total)} {loja.total === 1 ? "interação" : "interações"}
                            </span>
                            <ChevronRight size={16} className="text-slate-400 shrink-0" />
                        </button>
                    ))}
                </div>
            )}
        </Card>
    );
}

/**
 * Métricas somadas de várias lojas.
 * - escopo "vendedor": as lojas do vendedor logado (qualquer vendedor ativo).
 * - escopo "admin": a rede inteira (só administrador; o servidor confere de novo).
 */
export default function MetricasRedePage({ escopo }: { escopo: EscopoRede }) {
    const navigate = useNavigate();
    const [dias, setDias] = useState<number>(30);
    const { data: acesso, isLoading: carregandoAcesso, isError: erroAcesso } = useAdminAcesso();

    const exigeAdmin = escopo === "admin";
    const liberado = !exigeAdmin || acesso?.adm === true;
    const consulta = useMetricasRede(escopo, dias, liberado);

    if (exigeAdmin && carregandoAcesso) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (exigeAdmin && (erroAcesso || acesso?.adm !== true)) {
        return <Navigate to="/vendedor" replace />;
    }

    const totalLojas = consulta.data?.total_lojas;
    const abrirLoja = (loja: LojaRanking) =>
        navigate(`/vendedor/metricas/${encodeURIComponent(loja.uuid)}`, { state: { nome: loja.nome } });

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <VendorHeader />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-6 pt-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(exigeAdmin ? "/vendedor/admin" : "/vendedor")}
                        className="mb-2 gap-2 pl-0 text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="h-4 w-4" /> {exigeAdmin ? "Voltar à administração" : "Voltar ao painel"}
                    </Button>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        {exigeAdmin ? "Métricas da rede" : "Métricas das minhas lojas"}
                    </h1>
                    <p className="mt-1 flex items-center gap-1.5 text-slate-500">
                        <Store className="h-4 w-4" />
                        {totalLojas === undefined
                            ? "Carregando..."
                            : `${formatNumber(totalLojas)} ${totalLojas === 1 ? "loja somada" : "lojas somadas"}`}
                    </p>
                </div>

                <MetricasView consulta={consulta} dias={dias} onDias={setDias} rede>
                    <RankingLojas lojas={consulta.data?.lojas ?? []} onAbrir={abrirLoja} />
                </MetricasView>
            </main>
        </div>
    );
}
