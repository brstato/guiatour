import { CheckCircle2, Clock, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";
import type { AssinaturaStatus } from "../types";
import { cycleSuffix, formatDate, formatMoney, FORMA_LABEL, STATUS_LABEL, cobrancaLabel } from "../lib/format";

interface SubscriptionStatusCardProps {
  data: AssinaturaStatus;
}

export function SubscriptionStatusCard({ data }: SubscriptionStatusCardProps) {
  const status = data.status;

  const getStatusConfig = () => {
    switch (status) {
      case "ATIVA":
        return {
          bg: "bg-emerald-50 border-emerald-200 text-emerald-900",
          badgeBg: "bg-emerald-100 text-emerald-800",
          icon: CheckCircle2,
          iconColor: "text-emerald-600",
        };
      case "PENDENTE":
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-900",
          badgeBg: "bg-amber-100 text-amber-800",
          icon: Clock,
          iconColor: "text-amber-600",
        };
      case "INADIMPLENTE":
        return {
          bg: "bg-red-50 border-red-200 text-red-900",
          badgeBg: "bg-red-100 text-red-800",
          icon: AlertTriangle,
          iconColor: "text-red-600",
        };
      case "CANCELADA":
        return {
          bg: "bg-slate-50 border-slate-200 text-slate-800",
          badgeBg: "bg-slate-200 text-slate-700",
          icon: XCircle,
          iconColor: "text-slate-500",
        };
      default:
        return {
          bg: "bg-blue-50 border-blue-200 text-blue-900",
          badgeBg: "bg-blue-100 text-blue-800",
          icon: ShieldCheck,
          iconColor: "text-blue-600",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const planoNome = data.plano_nome ?? data.plano ?? "Plano";
  const forma = data.forma_pagamento ? FORMA_LABEL[data.forma_pagamento] : "";
  const valorStr = data.valor !== undefined ? `${formatMoney(data.valor)}${cycleSuffix(data.ciclo)}` : "";

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className={`p-4 rounded-xl border flex items-start gap-4 ${config.bg}`}>
        <div className={`w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center shrink-0 ${config.iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-bold text-lg text-slate-900">{planoNome}</h3>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.badgeBg}`}>
              {STATUS_LABEL[status] ?? status}
            </span>
          </div>

          <div className="mt-1 text-sm text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
            {valorStr && <span>{valorStr}</span>}
            {valorStr && forma && <span className="text-slate-300">•</span>}
            {forma && <span>{forma}</span>}
          </div>

          {data.validade && (
            <p className="text-xs font-medium text-slate-700 mt-2 pt-2 border-t border-black/5">
              Página no ar até <span className="font-bold">{formatDate(data.validade)}</span>
            </p>
          )}
        </div>
      </div>

      {data.cobrancas && data.cobrancas.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900">Últimas cobranças</h4>
          <div className="space-y-2">
            {data.cobrancas.map((cob) => {
              const pago = cob.pago_em ? `Paga em ${formatDate(cob.pago_em)}` : cob.vencimento ? `Vence em ${formatDate(cob.vencimento)}` : "";
              return (
                <div
                  key={cob.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm"
                >
                  <div>
                    <span className="font-bold text-slate-900">{formatMoney(cob.valor)}</span>
                    {pago && <span className="text-xs text-slate-500 block mt-0.5">{pago}</span>}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                    {cobrancaLabel(cob.status)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
