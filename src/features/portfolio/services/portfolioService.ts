import { api } from '@/services/api';
import type { PortfolioData } from '@/types/api';
import type { Depoimento } from '../types';

/**
 * Serviço responsável pelas operações relacionadas ao Portfólio.
 * Implementa o padrão Singleton para garantir uma única instância de comunicação.
 */
class PortfolioService {
    /**
     * Busca os dados completos do portfólio do lojista autenticado.
     * @param id Opcional: ID da loja para vendedores gerenciarem.
     * @returns Promessa com os dados do portfólio.
     */
    async getPortfolioData(id?: string): Promise<PortfolioData> {
        const url = id && id !== 'me' ? `portfolio/info?id_loja=${encodeURIComponent(id)}` : 'portfolio/info';
        const response = await api.get(url);
        return response.data;
    }

    /**
     * Atualiza informações básicas do portfólio (título, subtítulo e bio).
     * @param data Objeto com os campos de texto básicos e id_loja opcional.
     */
    async updatePortfolioBasico(data: { titulo?: string; subtitulo?: string; bio?: string; url_video?: string; id_loja?: string }): Promise<any> {
        const id = data.id_loja || localStorage.getItem("id_loja") || undefined;
        const payload = {
            titulo: data.titulo ?? "",
            subtitulo: data.subtitulo ?? "",
            bio: data.bio ?? "",
            // só envia o vídeo quando ele é a alteração: sem o campo, o backend mantém o vídeo salvo
            ...(data.url_video !== undefined && { url_video: data.url_video }),
            id_loja: id,
            uuid: id
        };
        const response = await api.post('portfolio/update_portifolio_basico', payload);
        return response.data;
    }

    /**
     * Obtém a galeria de fotos de um portfólio específico.
     * @param idPortfolio ID do portfólio.
     */
    async getGaleria(idPortfolio: number): Promise<any> {
        const response = await api.get(`portfolio/galeria/${idPortfolio}`);
        return response.data;
    }

    /**
     * Realiza o upload de uma foto genérica para a galeria do portfólio.
     * @param payload Dados da imagem em base64 e metadados.
     */
    async uploadFoto(payload: { nome_arquivo: string; imagem_base64: string; id_site: number; id_loja?: string }): Promise<any> {
        const response = await api.post('portfolio/upload', payload);
        return response.data;
    }

    /**
     * Realiza o upload da foto de perfil (avatar).
     * @param payload Dados da imagem em base64 e metadados.
     */
    async uploadAvatar(payload: { nome_arquivo: string; imagem_base64: string; id_site: number; id_loja?: string }): Promise<any> {
        const response = await api.post('portfolio/avatar', payload);
        return response.data;
    }

    /**
     * Realiza o upload da foto de biografia.
     * @param payload Dados da imagem em base64 e metadados.
     */
    async uploadBioFoto(payload: { nome_arquivo: string; imagem_base64: string; id_site: number; id_loja?: string }): Promise<any> {
        const response = await api.post('portfolio/foto-bio', payload);
        return response.data;
    }

    /**
     * Realiza o upload da foto de capa do portfólio.
     * @param payload Dados da imagem em base64 e metadados.
     */
    async uploadFotoCapa(payload: { nome_arquivo: string; imagem_base64: string; id_site: number; id_loja?: string }): Promise<any> {
        const response = await api.post('portfolio/foto-capa', payload);
        return response.data;
    }

    /**
     * Remove uma foto específica da galeria.
     * @param idFoto ID da foto a ser removida.
     */
    async removeFoto(idFoto: number): Promise<any> {
        const response = await api.post('portfolio/remove', { id_foto: idFoto });
        return response.data;
    }

    /**
     * Busca os depoimentos pendentes de aprovação.
     * @returns Promessa com a lista de depoimentos.
     */
    async getDepoimentosPendentes(): Promise<Depoimento[]> {
        const response = await api.get('depoimentos/pendentes');
        return response.data;
    }

    /**
     * Aprova um depoimento específico.
     * @param idDepoimento ID do depoimento a ser aprovado.
     */
    async aprovarDepoimento(idDepoimento: number): Promise<any> {
        const response = await api.put('depoimentos/aprovar', { id_depoimento: idDepoimento });
        return response.data;
    }
}

export const portfolioService = new PortfolioService();
