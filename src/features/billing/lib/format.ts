import type { CicloPlano, FormaPagamento, StatusAssinatura } from "../types";

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n ?? 0);
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const parts = iso.split("T")[0].split("-");
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const parts = iso.split("T")[0].split("-");
  if (parts.length !== 3) return null;
  const target = Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diffTime = target - today;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function cycleSuffix(ciclo?: CicloPlano): string {
  switch (ciclo) {
    case "WEEKLY":
      return "/semana";
    case "BIWEEKLY":
      return "/quinzena";
    case "MONTHLY":
      return "/mês";
    case "BIMONTHLY":
      return "/bimestre";
    case "QUARTERLY":
      return "/trimestre";
    case "SEMIANNUALLY":
      return "/semestre";
    case "YEARLY":
      return "/ano";
    default:
      return "/mês";
  }
}

export const FORMA_LABEL: Record<FormaPagamento | "UNDEFINED", string> = {
  PIX: "Pix",
  BOLETO: "Boleto",
  CREDIT_CARD: "Cartão de crédito",
  UNDEFINED: "A escolher na fatura",
};

export const STATUS_LABEL: Record<StatusAssinatura, string> = {
  SEM_ASSINATURA: "Sem assinatura",
  PENDENTE: "Aguardando pagamento",
  ATIVA: "Assinatura ativa",
  INADIMPLENTE: "Pagamento em atraso",
  CANCELADA: "Cancelada",
};

export function cobrancaLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: "Aguardando",
    CONFIRMED: "Confirmada",
    RECEIVED: "Paga",
    OVERDUE: "Vencida",
    REFUNDED: "Estornada",
  };
  return map[status] ?? status;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function errorMessage(error: any, fallback: string): string {
  return error?.response?.data?.error ?? error?.message ?? fallback;
}
