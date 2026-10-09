import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { PERIODOS_METRICAS, useMetricas, type MetricasResponse } from "../hooks/useMetricas";
import { Card } from "@/components/ui/card";
import {
    AlertCircle,
    BarChart3,
    ExternalLink,
    Eye,
    MapPin,
    MessageCircle,
    MousePointerClick,
    Navigation,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const formatNumber = (num: number) => new Intl.NumberFormat("pt-BR").format(num);

// "2026-10-08" no fuso do aparelho (o backend agrupa por dia do servidor, também no Brasil)
function chaveDia(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function rotuloDia(chave: string): string {
    const [, mes, dia] = chave.split("-");
    return `${dia}/${mes}`;
}

interface Barra {
    chave: string;
    rotulo: string;
    total: number;
}

// Completa os dias sem movimento com zero. Em 90 dias, agrupa por semana (13 barras, não 90).
function montarBarras(porDia: MetricasResponse["por_dia"], dias: number): Barra[] {
    const totais = new Map(porDia.map((p) => [p.dia, p.total]));
    const hoje = new Date();
    const lista: { chave: string; total: number }[] = [];
    for (let i = dias - 1; i >= 0; i--) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - i);
        const chave = chaveDia(d);
        lista.push({ chave, total: totais.get(chave) ?? 0 });
    }

    const tamanho = dias > 31 ? 7 : 1;
    const barras: Barra[] = [];
    // agrupa a partir de hoje para trás: a última barra é sempre a semana atual
    for (let fim = lista.length; fim > 0; fim -= tamanho) {
        const grupo = lista.slice(Math.max(0, fim - tamanho), fim);
        const total = grupo.reduce((s, g) => s + g.total, 0);
        const primeiro = grupo[0].chave;
        const ultimo = grupo[grupo.length - 1].chave;
        barras.unshift({
            chave: primeiro,
            rotulo: tamanho === 1 ? rotuloDia(primeiro) : `${rotuloDia(primeiro)} a ${rotuloDia(ultimo)}`,
            total,
        });
    }
    return barras;
}

// Variação em relação ao período anterior. Sem base de comparação, não mostra nada.
function Variacao({ atual, anterior }: { atual: number; anterior: number }) {
    if (anterior === 0) {
        if (atual === 0) return null;
        return (
            <span className="text-[10px] font-bold text-[#2563eb] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                novo
            </span>
        );
    }
    const pct = Math.round(((atual - anterior) / anterior) * 100);
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                pct > 0 && "text-emerald-700 bg-emerald-50 border-emerald-200/70",
                pct < 0 && "text-rose-700 bg-rose-50 border-rose-200/70",
                pct === 0 && "text-slate-600 bg-slate-100 border-slate-200"
            )}
            title="Comparado ao período anterior de mesmo tamanho"
        >
            {pct > 0 && <TrendingUp size={12} />}
            {pct < 0 && <TrendingDown size={12} />}
            {pct > 0 ? "+" : ""}
            {pct}%
        </span>
    );
}

function Indicador({
    icone: Icone,
    rotulo,
    atual,
    anterior,
}: {
    icone: typeof Eye;
    rotulo: string;
    atual: number;
    anterior: number;
}) {
    return (
        <div className="p-4 bg-slate-50/80 rounded-2xl space-y-2 border border-slate-200/70">
            <div className="flex items-center gap-2 text-slate-500">
                <Icone size={14} className="text-[#2563eb]" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{rotulo}</span>
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
                <p className="text-xl font-extrabold text-slate-900">{formatNumber(atual)}</p>
                <Variacao atual={atual} anterior={anterior} />
            </div>
        </div>
    );
}

// Uma série só (interações por dia ou semana): uma cor, sem legenda; o título do card nomeia a série.
function GraficoAtividade({ barras, porSemana }: { barras: Barra[]; porSemana: boolean }) {
    const [ativa, setAtiva] = useState<number | null>(null);
    const max = Math.max(1, ...barras.map((b) => b.total));
    const selecionada = ativa !== null ? barras[ativa] : null;
    const unidade = (n: number) => (n === 1 ? "interação" : "interações");

    return (
        <div className="space-y-3">
            <p className="text-xs text-slate-600 h-4" aria-live="polite">
                {selecionada
                    ? `${selecionada.rotulo}: ${formatNumber(selecionada.total)} ${unidade(selecionada.total)}`
                    : `Toque numa barra para ver ${porSemana ? "a semana" : "o dia"}`}
            </p>
            <div
                className="flex items-end gap-0.5 h-28 border-b border-slate-200"
                onMouseLeave={() => setAtiva(null)}
            >
                {barras.map((b, i) => (
                    <button
                        key={b.chave}
                        type="button"
                        className="flex-1 h-full flex items-end min-w-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2563eb]"
                        aria-label={`${b.rotulo}: ${b.total} ${unidade(b.total)}`}
                        onMouseEnter={() => setAtiva(i)}
                        onFocus={() => setAtiva(i)}
                        onClick={() => setAtiva(i)}
                    >
                        <span
                            className={cn(
                                "w-full rounded-t-[4px] transition-colors",
                                b.total === 0 ? "bg-slate-200" : ativa === i ? "bg-[#1d4ed8]" : "bg-[#2563eb]"
                            )}
                            style={{ height: b.total === 0 ? "2px" : `${Math.max(4, (b.total / max) * 100)}%` }}
                        />
                    </button>
                ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
                <span>{barras[0]?.rotulo}</span>
                <span>{barras[barras.length - 1]?.rotulo}</span>
            </div>
        </div>
    );
}

export function MetricasPage() {
    const { id } = useParams();
    const [dias, setDias] = useState<number>(30);
    const { data, isLoading, isError, isFetching, refetch } = useMetricas(id, dias);

    const barras = useMemo(() => (data ? montarBarras(data.por_dia, data.dias) : []), [data]);

    const seletor = (
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80" role="group" aria-label="Período">
            {PERIODOS_METRICAS.map((p) => (
                <button
                    key={p}
                    type="button"
                    onClick={() => setDias(p)}
                    aria-pressed={dias === p}
                    className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer",
                        dias === p ? "bg-white text-[#2563eb] shadow-sm" : "text-slate-500 hover:text-slate-800"
                    )}
                >
                    {p} dias
                </button>
            ))}
        </div>
    );

    if (isLoading) {
        return (
            <div className="p-6 space-y-6 max-w-2xl mx-auto">
                {seletor}
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="h-40 bg-white border border-slate-200/80 rounded-[2rem] animate-pulse shadow-sm" />
                ))}
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-200/50 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-slate-900 font-bold text-lg">Ops! Algo deu errado</h3>
                    <p className="text-slate-500 text-sm">Não conseguimos carregar suas métricas no momento.</p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="px-6 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    const { atual, anterior } = data;
    const totalAtual = Object.values(atual).reduce((s, n) => s + n, 0);
    const vistosAtual = atual.card + atual.pin;
    const vistosAnterior = anterior.card + anterior.pin;

    return (
        <div className={cn("p-6 space-y-6 max-w-2xl mx-auto pb-10 transition-opacity", isFetching && "opacity-60")}>
            {seletor}

            {totalAtual === 0 ? (
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <BarChart3 className="h-8 w-8 text-[#2563eb]" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-slate-900 font-bold text-lg">Ainda coletando dados</h3>
                        <p className="text-slate-500 text-sm max-w-[280px]">
                            Nenhuma visita ou clique nos últimos {data.dias} dias. Os números aparecem assim que os visitantes
                            encontrarem sua página.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Visitas à página */}
                    <Card className="p-6 bg-white border border-slate-200/80 rounded-[2rem] space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Visitas à sua página</p>
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <h2 className="text-4xl font-black text-slate-900">{formatNumber(atual.visita)}</h2>
                                    <Variacao atual={atual.visita} anterior={anterior.visita} />
                                </div>
                                <p className="text-xs text-slate-500">nos últimos {data.dias} dias, comparado aos {data.dias} anteriores</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563eb]">
                                <Eye size={24} />
                            </div>
                        </div>
                    </Card>

                    {/* Contatos */}
                    <Card className="p-6 bg-white border border-slate-200/80 rounded-[2rem] space-y-4 shadow-sm">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Contatos gerados</p>
                            <h3 className="text-xl font-bold text-slate-900">Quem quis falar com você</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Indicador icone={MessageCircle} rotulo="WhatsApp" atual={atual.whats} anterior={anterior.whats} />
                            <Indicador icone={Navigation} rotulo="Rotas" atual={atual.rota} anterior={anterior.rota} />
                        </div>
                    </Card>

                    {/* Pontos turísticos */}
                    <Card className="p-6 bg-white border border-slate-200/80 rounded-[2rem] space-y-4 shadow-sm">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Nos pontos turísticos</p>
                            <h3 className="text-xl font-bold text-slate-900">Como te encontram</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Indicador icone={MousePointerClick} rotulo="Viram seu card" atual={vistosAtual} anterior={vistosAnterior} />
                            <Indicador icone={ExternalLink} rotulo="Abriram a página" atual={atual.ver} anterior={anterior.ver} />
                        </div>
                        {data.pontos.length > 0 && (
                            <div className="space-y-2">
                                {data.pontos.map((p) => (
                                    <div
                                        key={p.slug}
                                        className="flex items-center justify-between gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200/70"
                                    >
                                        <span className="flex items-center gap-2 min-w-0 text-sm font-semibold text-slate-800">
                                            <MapPin size={14} className="text-[#2563eb] shrink-0" />
                                            <span className="truncate">{p.nome}</span>
                                        </span>
                                        <span className="text-xs font-bold text-slate-600 shrink-0">
                                            {formatNumber(p.total)} {p.total === 1 ? "clique" : "cliques"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Atividade */}
                    <Card className="p-6 bg-white border border-slate-200/80 rounded-[2rem] space-y-4 shadow-sm">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Atividade</p>
                            <h3 className="text-xl font-bold text-slate-900">
                                Interações por {data.dias > 31 ? "semana" : "dia"}
                            </h3>
                        </div>
                        <GraficoAtividade barras={barras} porSemana={data.dias > 31} />
                    </Card>
                </>
            )}

            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                Cada visitante conta no máximo uma vez a cada 30 segundos por tipo de ação. Robôs e prévias de link não entram na conta.
            </p>
        </div>
    );
}
