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
