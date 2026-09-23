import { useState, useCallback } from 'react';
import axios from 'axios';
import { portfolioService } from '../services/portfolioService';
import { compressImage } from '@/lib/image-utils';
import type { PortfolioData } from '@/types/api';
import type { Depoimento } from '../types';

/**
 * Hook customizado que atua como Controller para a funcionalidade de Portfólio.
 * Gerencia o estado dos dados do portfólio, estados de carregamento e as interações do usuário,
 * implementando a lógica de negócio e atualizações otimistas na UI.
 */
export function usePortfolioController() {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDepoimentos, setIsLoadingDepoimentos] = useState(false);
    const [data, setData] = useState<PortfolioData | null>(null);
    const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);

    /**
     * Carrega os dados do portfólio a partir da API.
     * @param idLoja ID da loja/artista para busca.
     */
    const loadData = useCallback(async (idLoja: string) => {
        setIsLoading(true);
        try {
            const result = await portfolioService.getPortfolioData(idLoja);
            setData(result);
        } catch (error) {
            // Se for 404, define um estado inicial vazio para evitar erros de UI e logs excessivos
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                setData({
                    id_site: 0,
                    titulo: "",
                    subtitulo: "",
                    bio: "",
                    avatar: "",
                    foto_bio: "",
                    itens: []
                } as PortfolioData);
            } else {
                console.error("Erro ao carregar portfólio:", error);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Lida com a atualização genérica de campos do portfólio.
     * Implementa atualização otimista para uma UI mais fluida.
     * @param payload Campos a serem atualizados.
     */
    const handleUpdate = async (payload: Partial<PortfolioData>) => {
        setData(prev => prev ? { ...prev, ...payload } : null);
        try {
            await portfolioService.updatePortfolio(payload);
        } catch (error) {
            console.error("Erro ao atualizar portfólio:", error);
            const idLoja = localStorage.getItem("id_loja") || "";
            await loadData(idLoja);
        }
    };

    /**
     * Lida com a atualização dos campos básicos (título, subtítulo, bio).
     * @param updateData Dados parciais de texto.
     */
    const handleUpdateBasico = async (updateData: { titulo?: string; subtitulo?: string; bio?: string }) => {
        const mergedData = data ? {
            ...data,
            titulo: updateData.titulo ?? data.titulo ?? "",
            subtitulo: updateData.subtitulo ?? data.subtitulo ?? "",
            bio: updateData.bio ?? data.bio ?? "",
        } : {
            titulo: updateData.titulo ?? "",
            subtitulo: updateData.subtitulo ?? "",
            bio: updateData.bio ?? "",
        };

        setData(mergedData as PortfolioData);
        try {
            await portfolioService.updatePortfolioBasico(mergedData);
        } catch (error) {
            console.error("Erro ao atualizar portfólio básico:", error);
            const idLoja = localStorage.getItem("id_loja") || "";
            await loadData(idLoja);
        }
    };

    /**
     * Lida com o upload de diferentes tipos de imagens para o portfólio.
     * Realiza a compressão automática da imagem antes do envio.
     * @param type Tipo do upload ('avatar', 'bio', 'gallery', 'capa').
     * @param fileName Nome original do arquivo.
     * @param base64 String da imagem em formato base64.
     * @param idSite ID do site/portfólio.
     */
    const handleUpload = async (
        type: 'avatar' | 'bio' | 'gallery' | 'capa',
        fileName: string,
        base64: string,
        idSite: number
    ) => {
        let base64ToProcess = base64;

        try {
            // Aplica compressão: 800x800 para avatar/bio, 1600x1600 para outros
            const maxDim = (type === 'avatar' || type === 'bio') ? 800 : 1600;
            base64ToProcess = await compressImage(base64, maxDim, maxDim, 0.7);
        } catch (error) {
            console.error("Erro ao comprimir imagem no controller:", error);
        }

        // Atualização Otimista (Optimistic Update)
        const previewUrl = base64ToProcess.startsWith('data:') ? base64ToProcess : `data:image/jpeg;base64,${base64ToProcess}`;
        if (type === 'avatar') {
            setData(prev => ({ ...(prev || {}), avatar: previewUrl } as PortfolioData));
        } else if (type === 'bio') {
            setData(prev => ({ ...(prev || {}), foto_bio: previewUrl } as PortfolioData));
        } else if (type === 'capa') {
            setData(prev => ({ ...(prev || {}), foto_capa: previewUrl } as PortfolioData));
        } else if (type === 'gallery') {
            setData(prev => {
                const newItem = {
                    id_foto: Date.now(), // ID temporário para chave React
                    url_foto: previewUrl,
                    id_site: idSite
                };
                const currentData = prev || {
                    id_site: idSite,
                    titulo: '',
                    subtitulo: '',
                    bio: '',
                    avatar: '',
                    foto_bio: '',
                    itens: []
                };
                return {
                    ...currentData,
                    itens: [...(currentData.itens || []), newItem]
                };
            });
        }

        try {
            // Remove o prefixo "data:image/...;base64," antes de enviar para a API
            const base64Data = base64ToProcess.includes(',') ? base64ToProcess.split(',')[1] : base64ToProcess;
            const payload = { nome_arquivo: fileName, imagem_base64: base64Data, id_site: idSite };

            console.log(`Iniciando upload de ${type} para id_site: ${idSite}`);

            if (type === 'avatar') await portfolioService.uploadAvatar(payload);
            else if (type === 'bio') await portfolioService.uploadBioFoto(payload);
            else if (type === 'capa') await portfolioService.uploadFotoCapa(payload);
            else await portfolioService.uploadFoto(payload);

            // Atualiza os dados em background para obter as URLs finais do servidor sem travar a UI
            const idLoja = localStorage.getItem("id_loja") || "";
            const result = await portfolioService.getPortfolioData(idLoja);
            setData(result);
        } catch (error) {
            console.error(`Erro no upload de ${type}:`, error);
            // Reverte em caso de erro
            const idLoja = localStorage.getItem("id_loja") || "";
            try {
                const result = await portfolioService.getPortfolioData(idLoja);
                setData(result);
            } catch (reError) {
                console.error("Erro ao reverter dados:", reError);
            }
            throw error;
        }
    };

    /**
     * Remove uma foto da galeria do portfólio.
     * @param idFoto ID da foto a ser removida.
     */
    const handleDeleteFoto = async (idFoto: number) => {
        // Atualização Otimista
        setData(prev => prev ? {
            ...prev,
            itens: prev.itens.filter(item => item.id_foto !== idFoto)
        } : null);

        try {
            await portfolioService.removeFoto(idFoto);
            // Atualiza em background
            const idLoja = localStorage.getItem("id_loja") || "";
            const result = await portfolioService.getPortfolioData(idLoja);
            setData(result);
        } catch (error) {
            console.error("Erro ao deletar foto:", error);
            // Reverte em caso de erro
            const idLoja = localStorage.getItem("id_loja") || "";
            const result = await portfolioService.getPortfolioData(idLoja);
            setData(result);
        }
    };

    /**
     * Carrega os depoimentos pendentes.
     */
    const loadDepoimentos = useCallback(async () => {
        setIsLoadingDepoimentos(true);
        try {
            const result = await portfolioService.getDepoimentosPendentes();
            setDepoimentos(result);
        } catch (error) {
            console.error("Erro ao carregar depoimentos:", error);
        } finally {
            setIsLoadingDepoimentos(false);
        }
    }, []);

    /**
     * Aprova um depoimento e recarrega a lista de pendentes.
     * @param idDepoimento ID do depoimento a ser aprovado.
     */
    const handleAprovarDepoimento = async (idDepoimento: number) => {
        setIsLoadingDepoimentos(true);
        try {
            await portfolioService.aprovarDepoimento(idDepoimento);
            await loadDepoimentos();
        } catch (error) {
            console.error("Erro ao aprovar depoimento:", error);
            setIsLoadingDepoimentos(false);
        }
    };

    return {
        isLoading,
        isLoadingDepoimentos,
        data,
        depoimentos,
        loadData,
        loadDepoimentos,
        handleUpdate,
        handleUpdateBasico,
        handleUpload,
        handleDeleteFoto,
        handleAprovarDepoimento
    };
}
