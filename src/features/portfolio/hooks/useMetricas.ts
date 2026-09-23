import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export interface MetricasResponse {
    visibilidade: {
        total: number;
        variacao_pct: number;
        busca: number;
        perfil_maps: number;
    };
    acoes: {
        cliques_site: number;
        ligacoes: number;
        pedidos_rota: number;
    };
    termos: {
        consulta: string;
        posicao: number;
    }[];
}

export function useMetricas(tatuadorId: string | undefined) {
    const id = tatuadorId === "me" ? (localStorage.getItem("id_loja") || localStorage.getItem("id")) : tatuadorId;

    return useQuery<MetricasResponse>({
        queryKey: ["metricas", id],
        queryFn: async () => {
            const response = await api.get(`/tatuadores/${id}/metricas`);
            return response.data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 30, // 30 min
    });
}
