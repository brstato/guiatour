import { api } from '@/services/api';
import type { Merchant, CreateMerchantDTO, VendorMerchant } from '../types';

class VendorService {
  /**
   * Obtém a lista simplificada de comércios do vendedor.
   * Rota: GET vendedor/comercios
   */
  async listMerchants(): Promise<VendorMerchant[]> {
    const response = await api.get('vendedor/comercios');
    return response.data.itens;
  }

  /**
   * Cadastra um novo comerciante.
   * Rota: POST vendedor/comercio
   */
  async createMerchant(data: CreateMerchantDTO): Promise<{ data: Merchant; status: number }> {
    const response = await api.post('vendedor/comercio', data);
    return { data: response.data, status: response.status };
  }
}

export const vendorService = new VendorService();
