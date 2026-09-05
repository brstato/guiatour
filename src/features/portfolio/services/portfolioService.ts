import { api } from '@/services/api';
import type { PortfolioData } from '@/types/api';

/**
 * Serviço responsável pelas operações relacionadas ao Portfólio.
 * Implementa o padrão Singleton para garantir uma única instância de comunicação.
 */
class PortfolioService {
    /**
     * Limpa a URL removendo o domínio e barras redundantes.
     * @param url URL original retornada pela API ou vinda de inputs.
     * @returns URL normalizada para armazenamento ou exibição.
     */
    private cleanUrl(url: string): string {
        if (!url) return "";
        return url.split(".com.br").pop()?.replace(/\/\//g, "/") || "";
    }

    /**
     * Busca os dados completos do portfólio de um lojista.
     * @param idLoja Identificador único da loja/artista.
     * @returns Promessa com os dados do portfólio.
     */
    async getPortfolioData(idLoja: string): Promise<PortfolioData> {
        const response = await api.get(`portfolio/info/${idLoja}`);
        return response.data;
    }

    /**
     * Atualiza as informações gerais do portfólio.
     * @param payload Objeto contendo os campos parciais a serem atualizados.
     */
    async updatePortfolio(payload: Partial<PortfolioData>): Promise<any> {
        const cleanedPayload = {
            ...payload,
            avatar: this.cleanUrl(payload.avatar || ""),
            foto_bio: this.cleanUrl(payload.foto_bio || ""),
            foto_capa: this.cleanUrl(payload.foto_capa || ""),
        };
        const response = await api.post('portfolio/update', cleanedPayload);
        return response.data;
    }

    /**
     * Atualiza informações básicas do portfólio (título, subtítulo e bio).
     * @param data Objeto com os campos de texto básicos.
     */
    async updatePortfolioBasico(data: { titulo?: string; subtitulo?: string; bio?: string }): Promise<any> {
        const payload = {
            titulo: data.titulo ?? "",
            subtitulo: data.subtitulo ?? "",
            bio: data.bio ?? "",
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
    async uploadFoto(payload: { nome_arquivo: string; imagem_base64: string; id_site: number }): Promise<any> {
        const response = await api.post('portfolio/upload', payload);
        return response.data;
    }

    /**
     * Realiza o upload da foto de perfil (avatar).
     * @param payload Dados da imagem em base64 e metadados.
     */
    async uploadAvatar(payload: { nome_arquivo: string; imagem_base64: string; id_site: number }): Promise<any> {
        const response = await api.post('portfolio/avatar', payload);
        return response.data;
    }

    /**
     * Realiza o upload da foto de biografia.
     * @param payload Dados da imagem em base64 e metadados.
     */
    async uploadBioFoto(payload: { nome_arquivo: string; imagem_base64: string; id_site: number }): Promise<any> {
        const response = await api.post('portfolio/foto-bio', payload);
        return response.data;
    }

    /**
     * Realiza o upload da foto de capa do portfólio.
     * @param payload Dados da imagem em base64 e metadados.
     */
    async uploadFotoCapa(payload: { nome_arquivo: string; imagem_base64: string; id_site: number }): Promise<any> {
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
}

export const portfolioService = new PortfolioService();
