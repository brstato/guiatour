import { useParams } from "react-router-dom";
import { useMetricas } from "../hooks/useMetricas";
import { Card } from "@/components/ui/card";
import {
    Search,
    MapPin,
    Globe,
    Phone,
    Navigation,
    TrendingUp,
    BarChart3,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricasPage() {
    const { id } = useParams();
    const { data, isLoading, isError, refetch } = useMetricas(id);

    if (isLoading) {
        return (
            <div className="p-6 space-y-6 max-w-2xl mx-auto">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="h-48 bg-[#141a2b] border-none rounded-[2rem] animate-pulse" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-white font-bold text-lg">Ops! Algo deu errado</h3>
                    <p className="text-slate-400 text-sm">Não conseguimos carregar suas métricas no momento.</p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold rounded-xl transition-colors"
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    const hasData = data && (data.visibilidade.total > 0 || data.acoes.cliques_site > 0);

    if (!hasData) {
        return (
            <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-orange-500" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-white font-bold text-lg">Ainda coletando dados</h3>
                    <p className="text-slate-400 text-sm max-w-[280px]">
                        Normalmente os primeiros números aparecem em alguns dias após a publicação da sua página.
                    </p>
                </div>
            </div>
        );
    }

    const formatNumber = (num: number) => new Intl.NumberFormat("pt-BR").format(num);

    return (
        <div className="p-6 space-y-6 max-w-2xl mx-auto pb-10">

            {/* Resumo de Visibilidade */}
            <Card className="p-6 bg-[#141a2b] border-none rounded-[2rem] space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Visibilidade Total</p>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-4xl font-black text-white">{formatNumber(data.visibilidade.total)}</h2>
                            <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full">
                                <TrendingUp size={12} />
                                {data.visibilidade.variacao_pct}%
                            </div>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <Search size={24} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#0f1428] rounded-2xl space-y-2 border border-slate-800/50">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Search size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Busca</span>
                        </div>
                        <p className="text-xl font-bold text-white">{formatNumber(data.visibilidade.busca)}</p>
                    </div>
                    <div className="p-4 bg-[#0f1428] rounded-2xl space-y-2 border border-slate-800/50">
                        <div className="flex items-center gap-2 text-slate-400">
                            <MapPin size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Maps</span>
                        </div>
                        <p className="text-xl font-bold text-white">{formatNumber(data.visibilidade.perfil_maps)}</p>
                    </div>
                </div>
            </Card>

            {/* Ações Geradas */}
            <Card className="p-6 bg-[#141a2b] border-none rounded-[2rem] space-y-6">
                <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Ações Geradas</p>
                    <h3 className="text-xl font-bold text-white text-orange-500">Conversões</h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center p-4 bg-[#0f1428] rounded-2xl space-y-2 border border-slate-800/50">
                        <Globe size={18} className="text-slate-500" />
                        <span className="text-lg font-bold text-white">{formatNumber(data.acoes.cliques_site)}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Site</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-[#0f1428] rounded-2xl space-y-2 border border-slate-800/50">
                        <Phone size={18} className="text-slate-500" />
                        <span className="text-lg font-bold text-white">{formatNumber(data.acoes.ligacoes)}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Ligações</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-[#0f1428] rounded-2xl space-y-2 border border-slate-800/50">
                        <Navigation size={18} className="text-slate-500" />
                        <span className="text-lg font-bold text-white">{formatNumber(data.acoes.pedidos_rota)}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Rotas</span>
                    </div>
                </div>
            </Card>

            {/* Termos de Pesquisa */}
            <Card className="p-6 bg-[#141a2b] border-none rounded-[2rem] space-y-6">
                <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Principais Termos</p>
                    <h3 className="text-xl font-bold text-white">Como te encontram</h3>
                </div>

                <div className="space-y-2">
                    {data.termos.map((termo, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-[#0f1428] rounded-xl border border-slate-800/50">
                            <span className="text-sm font-medium text-slate-300">{termo.consulta}</span>
                            <div className={cn(
                                "px-2.5 py-1 rounded-lg text-[11px] font-black",
                                termo.posicao <= 5 ? "bg-emerald-400/10 text-emerald-400" :
                                    termo.posicao <= 10 ? "bg-orange-400/10 text-orange-400" :
                                        "bg-slate-800 text-slate-400"
                            )}>
                                #{termo.posicao}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

        </div>
    );
}
