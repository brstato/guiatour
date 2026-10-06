import { useState } from "react";
import { Loader2, Copy, Check, ExternalLink, AlertCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PixData } from "../types";
import { copyText, formatDate } from "../lib/format";

interface PixPaymentProps {
  pix?: PixData | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  invoiceUrl?: string;
}

export function PixPayment({ pix, isLoading, isError, onRetry, invoiceUrl }: PixPaymentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!pix?.payload) return;
    const ok = await copyText(pix.payload);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb] mb-3" />
        <p className="text-sm font-medium text-slate-600">Gerando o QR Code…</p>
      </div>
    );
  }

  if (isError || !pix) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">Não foi possível carregar o Pix</h4>
          <p className="text-sm text-slate-500 mt-1">Tente novamente ou pague pela fatura.</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={onRetry} variant="outline" className="rounded-xl">
            Tentar de novo
          </Button>
          {invoiceUrl && (
            <a
              href={invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "default" }) + " rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8]" + " inline-flex items-center justify-center"}
            >
              Pagar pela fatura <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4">
      <div>
        <h3 className="font-bold text-lg text-slate-900">Pague com Pix</h3>
        <p className="text-sm text-slate-500 mt-0.5">Aponte a câmera do seu aplicativo de pagamento</p>
      </div>

      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm inline-block">
        <img
          src={`data:image/png;base64,${pix.qr_base64}`}
          alt="QR Code Pix"
          className="w-48 h-48 object-contain mx-auto"
        />
      </div>

      <div className="w-full space-y-2">
        <label className="text-xs font-semibold text-slate-500 block text-left">Pix Copia e Cola</label>
        <div className="flex gap-2">
          <Input readOnly value={pix.payload} className="font-mono text-xs bg-slate-50" />
          <Button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1.5" /> Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1.5" /> Copiar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100 w-full">
        <p className="font-medium text-slate-700">Aguardando o pagamento. Esta tela atualiza sozinha.</p>
        {pix.expira_em && <p>QR Code válido até {formatDate(pix.expira_em)}</p>}
      </div>
    </div>
  );
}
