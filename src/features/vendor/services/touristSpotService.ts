import { api } from '@/services/api';
import type { 
  TouristSpotListItem, 
  TouristSpot, 
  SaveTouristSpotDTO, 
  SpotCategory 
} from '../types';

class TouristSpotService {
  /**
   * Obtém a lista de pontos turísticos do vendedor.
   * Rota: GET vendedor/pontos-turisticos
   */
  async listSpots(): Promise<TouristSpotListItem[]> {
    const response = await api.get('vendedor/pontos-turisticos');
    return response.data.itens;
  }

  /**
   * Obtém os detalhes de um ponto turístico específico.
   * Rota: GET vendedor/ponto-turistico/:uuid
   */
  async getSpot(uuid: string): Promise<TouristSpot> {
    const response = await api.get(`vendedor/ponto-turistico/${uuid}`);
    return response.data;
  }

  /**
   * Cria um novo ponto turístico.
   * Rota: POST vendedor/ponto-turistico
   */
  async createSpot(data: SaveTouristSpotDTO): Promise<{ uuid: string }> {
    const response = await api.post('vendedor/ponto-turistico', data);
    return response.data;
  }

  /**
   * Atualiza um ponto turístico existente.
   * Rota: PUT vendedor/ponto-turistico/:uuid
   */
  async updateSpot(uuid: string, data: SaveTouristSpotDTO): Promise<void> {
    await api.put(`vendedor/ponto-turistico/${uuid}`, data);
  }

  /**
   * Ativa ou desativa um ponto turístico.
   * Rota: PATCH vendedor/ponto-turistico/:uuid/ativo
   */
  async setActive(uuid: string, ativo: boolean): Promise<void> {
    await api.patch(`vendedor/ponto-turistico/${uuid}/ativo`, { ativo });
  }

  /**
   * Remove uma foto da galeria de um ponto turístico.
   * Rota: DELETE vendedor/ponto-turistico/:uuid/galeria/:photoId
   */
  async removePhoto(uuid: string, photoId: number): Promise<void> {
    await api.delete(`vendedor/ponto-turistico/${uuid}/galeria/${photoId}`);
  }

  /**
   * Lista as categorias de pontos turísticos.
   * Rota: GET explorar/categorias
   */
  async listCategories(): Promise<SpotCategory[]> {
    const response = await api.get('explorar/categorias');
    return response.data.itens;
  }
}

export const touristSpotService = new TouristSpotService();
