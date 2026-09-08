import { useState, useCallback } from 'react';
import { portfolioService } from '../services/portfolioService';
import { compressImage } from '@/lib/image-utils';
import type { PortfolioData } from '@/types/api';

/**
 * Hook customizado que atua como Controller para a funcionalidade de Portfólio.
 * Gerencia o estado dos dados do portfólio, estados de carregamento e as interações do usuário,
 * implementando a lógica de negócio e atualizações otimistas na UI.
 */
export function usePortfolioController() {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<PortfolioData | null>(null);

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
            console.error("Erro ao carregar portfólio:", error);
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
            const idLoja = localStorage.getItem("id") || "";
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
            const idLoja = localStorage.getItem("id") || "";
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
            // Aplica compressão "média pesada": 1600x1600, 0.7 de qualidade
            // Isso garante que todos os tipos de upload sejam comprimidos
            base64ToProcess = await compressImage(base64, 1600, 1600, 0.7);
        } catch (error) {
            console.error("Erro ao comprimir imagem no controller:", error);
        }

        // Atualização Otimista (Optimistic Update)
        const previewUrl = base64ToProcess.startsWith('data:') ? base64ToProcess : `data:image/jpeg;base64,${base64ToProcess}`;
        if (type === 'avatar') {
            setData(prev => prev ? { ...prev, avatar: previewUrl } : null);
        } else if (type === 'bio') {
            setData(prev => prev ? { ...prev, foto_bio: previewUrl } : null);
        } else if (type === 'capa') {
            setData(prev => prev ? { ...prev, foto_capa: previewUrl } : null);
        } else if (type === 'gallery') {
            setData(prev => {
                if (!prev) return null;
                const newItem = {
                    id_foto: Date.now(), // ID temporário para chave React
                    url_foto: previewUrl,
                    id_site: idSite
                };
                return {
                    ...prev,
                    itens: [...(prev.itens || []), newItem]
                };
            });
        }

        try {
            // Remove o prefixo "data:image/...;base64," antes de enviar para a API
            const base64Data = base64ToProcess.includes(',') ? base64ToProcess.split(',')[1] : base64ToProcess;
            const payload = { nome_arquivo: fileName, imagem_base64: base64Data, id_site: idSite };

            if (type === 'avatar') await portfolioService.uploadAvatar(payload);
            else if (type === 'bio') await portfolioService.uploadBioFoto(payload);
            else if (type === 'capa') await portfolioService.uploadFotoCapa(payload);
            else await portfolioService.uploadFoto(payload);

            // Atualiza os dados em background para obter as URLs finais do servidor sem travar a UI
            const idLoja = localStorage.getItem("id") || "";
            const result = await portfolioService.getPortfolioData(idLoja);
            setData(result);
        } catch (error) {
            console.error(`Erro no upload de ${type}:`, error);
            // Reverte em caso de erro
            const idLoja = localStorage.getItem("id") || "";
            const result = await portfolioService.getPortfolioData(idLoja);
            setData(result);
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
            const idLoja = localStorage.getItem("id") || "";
            const result = await portfolioService.getPortfolioData(idLoja);
            setData(result);
        } catch (error) {
            console.error("Erro ao deletar foto:", error);
            // Reverte em caso de erro
            const idLoja = localStorage.getItem("id") || "";
            const result = await portfolioService.getPortfolioData(idLoja);
            setData(result);
        }
    };

    /**
     * Adiciona um novo item vazio de cuidados pós tattoo na interface.
     */
    const handleAddPosTattoo = () => {
        setData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                cuidados: [...(prev.cuidados || []), { id_item: 0, id_site: prev.id_site, descricao: "" }]
            };
        });
    };

    /**
     * Salva ou atualiza um item de cuidados pós tattoo.
     * @param idItem ID do item (0 para novo).
     * @param descricao Texto do cuidado.
     */
    const handleUpdatePosTattoo = async (idItem: number, descricao: string) => {
        if (!data?.id_site) return;

        // Atualização Otimista
        setData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                cuidados: (prev.cuidados || []).map(item =>
                    item.id_item === idItem ? { ...item, descricao } : item
                )
            };
        });

        try {
            const result = await portfolioService.updatePosTattoo({
                id_item: idItem,
                id_site: data.id_site,
                descricao
            });

            // Se for um novo item, atualiza o ID temporário (0) pelo ID real do banco
            if (result?.id_item && idItem === 0) {
                setData(prev => {
                    if (!prev) return null;
                    // Encontra o primeiro item com id 0 e mesma descrição para atualizar
                    let found = false;
                    return {
                        ...prev,
                        cuidados: (prev.cuidados || []).map(item => {
                            if (!found && item.id_item === 0 && item.descricao === descricao) {
                                found = true;
                                return { ...item, id_item: result.id_item };
                            }
                            return item;
                        })
                    };
                });
            }
        } catch (error) {
            console.error("Erro ao salvar cuidado pós tattoo:", error);
            // Em caso de erro crítico, recarrega para garantir consistência
            const idLoja = localStorage.getItem("id") || "";
            await loadData(idLoja);
        }
    };

    /**
     * Remove um item de cuidados pós tattoo.
     * @param idItem ID do item a ser removido.
     */
    const handleDeleteCuidado = async (idItem: number) => {
        if (idItem === 0) {
            // Se for um item novo não salvo, apenas remove da lista local
            setData(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    cuidados: (prev.cuidados || []).filter(item => item.id_item !== 0)
                };
            });
            return;
        }

        // Atualização Otimista
        setData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                cuidados: (prev.cuidados || []).filter(item => item.id_item !== idItem)
            };
        });

        try {
            await portfolioService.removeCuidado(idItem);
        } catch (error) {
            console.error("Erro ao remover cuidado pós tattoo:", error);
            const idLoja = localStorage.getItem("id") || "";
            await loadData(idLoja);
        }
    };

    return {
        isLoading,
        data,
        loadData,
        handleUpdate,
        handleUpdateBasico,
        handleUpload,
        handleDeleteFoto,
        handleAddPosTattoo,
        handleUpdatePosTattoo,
        handleDeleteCuidado
    };
}
