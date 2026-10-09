import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMetricas } from "../hooks/useMetricas";
import { MetricasView } from "../components/MetricasView";

/** Aba Métricas da loja logada (/loja/me/metricas). */
export function MetricasPage() {
    const { id } = useParams();
    const [dias, setDias] = useState<number>(30);
    const consulta = useMetricas(id, dias);

    return <MetricasView consulta={consulta} dias={dias} onDias={setDias} />;
}
