import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, AlertCircle, ExternalLink, MessageCircle, Copy, Check, RefreshCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBilling, usePix } from "../hooks/useBilling";
import { PlanCard } from "../components/PlanCard";
import { PaymentMethodPicker } from "../components/PaymentMethodPicker";
import { PixPayment } from "../components/PixPayment";
import { SubscriptionStatusCard } from "../components/SubscriptionStatusCard";
import { onlyDigits, isValidDocumento, maskDocumento } from "../lib/documento";
import { daysUntil, errorMessage, formatDate, copyText } from "../lib/format";
import type { FormaPagamento } from "../types";

export function BillingPage() {
  const { id, uuid } = useParams<{ id?: string; uuid?: string }>();
  const isVendor = localStorage.getItem("role")?.trim().toLowerCase() === "vendedor";
  const lojaId = isVendor ? (uuid ?? (id && id !== "me" ? id : undefined)) : undefined;

  const { plans, status, checkout, cancel } = useBilling(lojaId);

  const [selectedPlano, setSelectedPlano] = useState<string>("");
  const [selectedForma, setSelectedForma] = useState<FormaPagamento | null>(null);
  const [documento, setDocumento] = useState<string>("");
  const [docError, setDocError] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [confirmingCancel, setConfirmingCancel] = useState<boolean>(false);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  const data = status.data;

  const isAguardando = data?.status === "PENDENTE" || data?.status === "INADIMPLENTE";
  const usaPix = Boolean(isAguardando && data?.forma_pagamento === "PIX");
  const pixQuery = usePix(lojaId, usaPix);

  // Selecionar o primeiro plano por padrão quando os planos carregarem
  useEffect(() => {
    if (plans.data && plans.data.length > 0 && !selectedPlano) {
      setSelectedPlano(plans.data[0].codigo);
    }
  }, [plans.data, selectedPlano]);

  if (isVendor && !lojaId) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
          <h3 className="font-bold">Comerciante não identificado</h3>
          <p className="text-sm mt-1">Volte ao painel e escolha um comércio.</p>
        </div>
      </div>
    );
  }

  if (status.isLoading || plans.isLoading) {
    return (
      <div className="mx-auto max-w-2xl p-12 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563eb] mb-3" />
        <p className="text-sm font-medium text-slate-600">Carregando informações da assinatura…</p>
      </div>
    );
  }

  if (status.isError || plans.isError || !data) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-center space-y-4">
          <AlertCircle className="w-8 h-8 mx-auto text-amber-600" />
          <div>
            <h3 className="font-bold text-slate-900">Não foi possível carregar a assinatura</h3>
            <p className="text-sm text-slate-500 mt-1">
              {errorMessage(status.error || plans.error, "Erro ao carregar dados.")}
            </p>
          </div>
          <Button
            onClick={() => {
              status.refetch();
              plans.refetch();
            }}
            className="rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8]"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const emAndamento = ["PENDENTE", "ATIVA", "INADIMPLENTE"].includes(data.status);
  const aguardando = data.status === "PENDENTE" || data.status === "INADIMPLENTE";
  const cobrancaAberta = data.cobrancas?.find((c) => c.status === "PENDING" || c.status === "OVERDUE");
  const invoiceUrl = cobrancaAberta?.invoice_url ?? "";

  const precisaDocumento = data.precisa_documento === true;

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskDocumento(e.target.value);
    setDocumento(masked);
    const digits = onlyDigits(masked);
    if (digits.length > 0) {
      setDocError(!isValidDocumento(digits));
    } else {
      setDocError(false);
    }
  };

  const handleCheckout = () => {
    setCheckoutError(null);
    if (!selectedPlano || !selectedForma) return;

    if (precisaDocumento) {
      const digits = onlyDigits(documento);
      if (!isValidDocumento(digits)) {
        setDocError(true);
        return;
      }
    }

    checkout.mutate(
      {
        plano: selectedPlano,
        forma_pagamento: selectedForma,
        cpf_cnpj: precisaDocumento ? onlyDigits(documento) : undefined,
      },
      {
        onError: (err) => {
          setCheckoutError(errorMessage(err, "Erro ao criar checkout."));
        },
      }
    );
  };

  const isFormValid =
    selectedPlano &&
    selectedForma &&
    (!precisaDocumento || (documento.length > 0 && !docError && isValidDocumento(onlyDigits(documento))));

  const handleCopyLink = async () => {
    if (!invoiceUrl) return;
    const ok = await copyText(invoiceUrl);
    if (ok) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    }
  };

  const planoNomeAtual = data.plano_nome ?? data.plano ?? "Plano";
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Olá! Segue o link para pagar a mensalidade do Guia Tour (${planoNomeAtual}): ${invoiceUrl}`
  )}`;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 pb-12">
      {/* A) SEM ASSINATURA EM ANDAMENTO */}
      {!emAndamento && (
        <>
          {/* Faixa de validade / aviso */}
          {(() => {
            const dias = daysUntil(data.validade);
            if (data.status === "CANCELADA") {
              return (
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-slate-500 shrink-0" />
                  <span>
                    A assinatura anterior foi cancelada.{" "}
                    {data.validade && `A página continua no ar até ${formatDate(data.validade)}.`} Assine para renovar.
                  </span>
                </div>
              );
            }
            if (dias !== null && dias < 0) {
              return (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>
                    A página saiu do ar em {formatDate(data.validade)}. Assine para voltar ao catálogo.
                  </span>
                </div>
              );
            }
            if (dias !== null && dias <= 7) {
              return (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    Sua assinatura vence em {formatDate(data.validade)} ({dias === 0 ? "hoje" : `em ${dias} dias`}). Renove para não sair do ar.
                  </span>
                </div>
              );
            }
            if (data.validade) {
              return (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-sm flex items-center gap-3">
                  <RefreshCcw className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Sua página está no ar até {formatDate(data.validade)}. Escolha um plano abaixo para renovar ou alterar.</span>
                </div>
              );
            }
            return null;
          })()}

          {/* Passo 1: Escolha o plano */}
          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Passo 1 de 3</span>
              <h2 className="text-xl font-bold text-slate-900">Escolha o plano</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {plans.data?.map((plano) => (
                <PlanCard
                  key={plano.codigo}
                  plano={plano}
                  selected={selectedPlano === plano.codigo}
                  onSelect={setSelectedPlano}
                />
              ))}
            </div>
          </div>

          {/* Passo 2: Como prefere pagar? */}
          <div className="space-y-3 pt-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Passo 2 de 3</span>
              <h2 className="text-xl font-bold text-slate-900">Como prefere pagar?</h2>
            </div>
            <PaymentMethodPicker value={selectedForma} onChange={setSelectedForma} />
            {selectedForma === "CREDIT_CARD" && (
              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                🔒 Os dados do cartão são digitados na página segura do Asaas e não passam pelo Guia Tour.
              </p>
            )}
          </div>

          {/* Passo 3: CPF / CNPJ (se necessário) */}
          {precisaDocumento && (
            <div className="space-y-3 pt-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Passo 3 de 3</span>
                <h2 className="text-xl font-bold text-slate-900">Documento do responsável</h2>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">CPF ou CNPJ</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  value={documento}
                  onChange={handleDocumentoChange}
                  className={docError ? "border-red-500 focus-visible:ring-red-500/20" : ""}
                />
                {docError && <p className="text-xs text-red-600 font-medium">Confira o número informado.</p>}
              </div>
            </div>
          )}

          {/* Botão de envio */}
          <div className="pt-2 space-y-3">
            <Button
              type="button"
              disabled={!isFormValid || checkout.isPending}
              onClick={handleCheckout}
              className="w-full h-12 rounded-2xl bg-[#2563eb] hover:bg-[#1d4ed8] text-base font-semibold shadow-md shadow-blue-500/20"
            >
              {checkout.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Gerando pagamento…
                </>
              ) : (
                "Continuar para o pagamento"
              )}
            </Button>
            {checkoutError && (
              <p role="alert" className="text-sm text-red-600 font-medium text-center bg-red-50 p-3 rounded-xl border border-red-200">
                {checkoutError}
              </p>
            )}
          </div>
        </>
      )}

      {/* B) ASSINATURA EM ANDAMENTO */}
      {emAndamento && (
        <>
          <SubscriptionStatusCard data={data} />

          {aguardando && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-lg text-slate-900">
                  {data.status === "INADIMPLENTE" ? "Regularize o pagamento" : "Falta só o pagamento"}
                </h3>

                {data.forma_pagamento === "PIX" ? (
                  <PixPayment
                    pix={pixQuery.data}
                    isLoading={pixQuery.isLoading}
                    isError={pixQuery.isError}
                    onRetry={() => pixQuery.refetch()}
                    invoiceUrl={invoiceUrl}
                  />
                ) : (
                  <div className="space-y-3">
                    {!invoiceUrl ? (
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl text-slate-600">
                        <Loader2 className="w-5 h-5 animate-spin text-[#2563eb]" />
                        <span className="text-sm font-medium">Gerando a fatura…</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <a
                          href={invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonVariants({ variant: "default" }) + " w-full h-12 rounded-2xl bg-[#2563eb] hover:bg-[#1d4ed8] text-base font-semibold shadow-md inline-flex items-center justify-center"}
                        >
                          {data.forma_pagamento === "CREDIT_CARD" ? "Pagar com cartão" : "Abrir fatura"}
                          <ExternalLink className="w-5 h-5 ml-2" />
                        </a>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCopyLink}
                            className="flex-1 h-11 rounded-xl"
                          >
                            {linkCopied ? (
                              <>
                                <Check className="w-4 h-4 mr-2 text-emerald-600" /> Link copiado
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" /> Copiar link de pagamento
                              </>
                            )}
                          </Button>

                          {isVendor && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={buttonVariants({ variant: "outline" }) + " flex-1 h-11 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 inline-flex items-center justify-center"}
                            >
                              <MessageCircle className="w-4 h-4 mr-2 text-emerald-600" /> Enviar por WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ações de assinatura */}
          <div className="pt-2">
            {data.status === "PENDENTE" && (
              <Button
                type="button"
                variant="outline"
                disabled={cancel.isPending}
                onClick={() => cancel.mutate()}
                className="w-full h-11 rounded-2xl text-slate-700 hover:text-slate-900 border-slate-200"
              >
                {cancel.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Trocar plano ou forma de pagamento
              </Button>
            )}

            {(data.status === "ATIVA" || data.status === "INADIMPLENTE") && (
              <div>
                {!confirmingCancel ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setConfirmingCancel(true)}
                    className="w-full h-11 rounded-2xl text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Cancelar assinatura
                  </Button>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-4 text-center">
                    <p className="text-sm text-red-900">
                      Ao cancelar, não haverá novas cobranças. A página continua no ar até {formatDate(data.validade)}.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setConfirmingCancel(false)}
                        className="rounded-xl border-slate-200 bg-white"
                      >
                        Voltar
                      </Button>
                      <Button
                        type="button"
                        disabled={cancel.isPending}
                        onClick={() => cancel.mutate()}
                        className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
                      >
                        {cancel.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Sim, cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
