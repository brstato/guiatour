export type FormaPagamento = "PIX" | "BOLETO" | "CREDIT_CARD";
export type StatusAssinatura = "SEM_ASSINATURA" | "PENDENTE" | "ATIVA" | "INADIMPLENTE" | "CANCELADA";
export type CicloPlano =
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "BIMONTHLY"
  | "QUARTERLY"
  | "SEMIANNUALLY"
  | "YEARLY";

export interface Plano {
  codigo: string;
  nome: string;
  descricao: string; // itens separados por "|"
  valor: number;
  ciclo: CicloPlano;
}

export interface Cobranca {
  id: string;
  valor: number;
  vencimento: string | null;
  pago_em: string | null;
  status: string;
  invoice_url: string;
}

export interface AssinaturaStatus {
  validade: string | null;
  assinatura: string | null;
  status: StatusAssinatura;
  valor?: number;
  ciclo?: CicloPlano;
  forma_pagamento?: FormaPagamento | "UNDEFINED";
  plano?: string;
  plano_nome?: string;
  cobrancas?: Cobranca[];
  precisa_documento?: boolean;
}

export interface PixData {
  payload: string;
  qr_base64: string;
  expira_em: string;
}

export interface CheckoutPayload {
  plano: string;
  forma_pagamento: FormaPagamento;
  cpf_cnpj?: string;
  id_loja?: string; // só vendedor
}

export interface CheckoutResponse {
  assinatura: string;
  status: StatusAssinatura;
  forma_pagamento: FormaPagamento;
  invoice_url: string;
  plano: { codigo: string; nome: string; valor: number; ciclo: CicloPlano };
  pix?: PixData;
}
