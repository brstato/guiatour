import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

// Tipos de evento contados pelo backend (POST api/v1/evento)
export type TipoEvento = "visita" | "whats" | "rota" | "ver" | "card" | "pin";

export type ContagemEventos = Record<TipoEvento, number>;

export interface MetricasResponse {
    dias: number;
    atual: ContagemEventos;
    anterior: ContagemEventos;
    por_dia: { dia: string; total: number }[];
    pontos: { nome: string; slug: string; total: number }[];
}

/** Uma loja no ranking das métricas somadas. */
export interface LojaRanking {
    uuid: string;
    nome: string;
    slug: string;
    /** Todas as interações no período. */
    total: number;
    visitas: number;
    whats: number;
    rotas: number;
}

/** Métricas somadas de várias lojas (GET vendedor/metricas e GET admin/metricas). */
export interface MetricasRedeResponse extends MetricasResponse {
    /** Quantas lojas entram na soma. */
    total_lojas: number;
    /** As 10 lojas com mais interações no período. */
    lojas: LojaRanking[];
}

/** "vendedor" = só as lojas do vendedor logado; "admin" = a rede inteira (só administrador). */
export type EscopoRede = "vendedor" | "admin";

export const PERIODOS_METRICAS = [7, 30, 90] as const;

/**
 * Métricas da loja (GET account/metricas).
 * @param lojaId "me" para a loja logada, ou o UUID da loja (painel do vendedor).
 * @param dias Período: 7, 30 ou 90 dias, contando hoje.
 */
export function useMetricas(lojaId: string | undefined, dias: number) {
    const id = lojaId === "me" ? (localStorage.getItem("id_loja") || localStorage.getItem("id")) : lojaId;

    return useQuery<MetricasResponse>({
        queryKey: ["metricas", id, dias],
        queryFn: async () => {
            const response = await api.get("account/metricas", { params: { id_loja: id, dias } });
            return response.data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 min
        placeholderData: keepPreviousData,
    });
}

/**
 * Métricas somadas de várias lojas.
 * @param escopo "vendedor" soma as lojas do vendedor logado; "admin" soma a rede inteira.
 * @param dias Período: 7, 30 ou 90 dias, contando hoje.
 * @param habilitado false adia a consulta (ex.: enquanto ainda se confirma que é administrador).
 */
export function useMetricasRede(escopo: EscopoRede, dias: number, habilitado = true) {
    return useQuery<MetricasRedeResponse>({
        queryKey: ["metricas-rede", escopo, dias],
        queryFn: async () => {
            const rota = escopo === "admin" ? "admin/metricas" : "vendedor/metricas";
            const response = await api.get(rota, { params: { dias } });
            return response.data;
        },
        enabled: habilitado,
        staleTime: 1000 * 60 * 5, // 5 min
        placeholderData: keepPreviousData,
    });
}
