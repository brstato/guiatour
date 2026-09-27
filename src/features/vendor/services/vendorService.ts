import { api } from '@/services/api';
import type { Merchant, CreateMerchantDTO, MerchantListResponse, VendorMerchant } from '../types';

class VendorService {
  /**
   * Obtém a lista simplificada de comércios do vendedor.
   */
  async listMerchants(): Promise<VendorMerchant[]> {
    const response = await api.get('vendedor/comercios');
    return response.data.itens;
  }

  /**
   * Obtém a lista de comerciantes vinculados ao vendedor autenticado.
   */
  async getMerchants(page = 1, pageSize = 10): Promise<MerchantListResponse> {
    const response = await api.get('vendedor/comerciantes', {
      params: { page, pageSize },
    });
    return response.data;
  }

  /**
   * Obtém detalhes de um comerciante específico.
   */
  async getMerchant(id: string): Promise<Merchant> {
    const response = await api.get(`vendedor/comerciantes/${id}`);
    return response.data;
  }

  /**
   * Cadastra um novo comerciante.
   */
  async createMerchant(data: CreateMerchantDTO): Promise<{ data: Merchant; status: number }> {
    const response = await api.post('vendedor/comercio', data);
    return { data: response.data, status: response.status };
  }

  /**
   * Atualiza dados de um comerciante.
   */
  async updateMerchant(id: string, data: Partial<CreateMerchantDTO>): Promise<Merchant> {
    const response = await api.put(`vendedor/comerciantes/${id}`, data);
    return response.data;
  }

  /**
   * Gera um link ou token de convite para o comerciante.
   */
  async generateInvite(id: string): Promise<{ inviteToken: string; inviteUrl: string }> {
    const response = await api.post(`vendedor/comerciantes/${id}/convite`);
    return response.data;
  }
}

export const vendorService = new VendorService();
