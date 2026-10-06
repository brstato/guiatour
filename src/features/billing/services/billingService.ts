import { api } from "@/services/api";
import type { AssinaturaStatus, CheckoutPayload, CheckoutResponse, PixData, Plano } from "../types";

class BillingService {
  async listPlans(): Promise<Plano[]> {
    const response = await api.get("assinatura/planos");
    return response.data.itens ?? [];
  }
  async getStatus(lojaId?: string): Promise<AssinaturaStatus> {
    const response = await api.get("assinatura", { params: lojaId ? { id_loja: lojaId } : undefined });
    return response.data;
  }
  async getPix(lojaId?: string): Promise<PixData> {
    const response = await api.get("assinatura/pix", { params: lojaId ? { id_loja: lojaId } : undefined });
    return response.data;
  }
  async checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
    const response = await api.post("assinatura/checkout", payload);
    return response.data;
  }
  async cancel(lojaId?: string): Promise<void> {
    await api.post("assinatura/cancelar", lojaId ? { id_loja: lojaId } : {});
  }
}

export const billingService = new BillingService();
