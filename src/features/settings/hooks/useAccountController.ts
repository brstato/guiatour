import { useState, useCallback } from 'react';
import { accountService } from '../services/accountService';
import type { AccountData, AddressData, Categoria } from '@/types/api';

/**
 * Hook customizado que atua como Controller para as configurações de conta.
 * Gerencia o estado dos dados do perfil, atualizações de endereço e contato,
 * além de validações de slug e busca de CEP.
 */
export function useAccountController() {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<AccountData | null>(null);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [error, setError] = useState<string | null>(null);

    /**
     * Carrega as categorias de nichos.
     */
    const loadCategorias = useCallback(async () => {
        try {
            const result = await accountService.getCategorias();
            setCategorias(result.itens);
        } catch (err) {
            console.error("Erro ao carregar categorias:", err);
        }
    }, []);

    /**
     * Carrega os dados da conta do usuário.
     */
    const loadData = useCallback(async (id?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await accountService.getAccountData(id);
            setData(result);
            await loadCategorias();
        } catch (err) {
            console.error("Erro ao carregar dados da conta:", err);
            setError("Erro ao carregar dados da conta.");
        } finally {
            setIsLoading(false);
        }
    }, [loadCategorias]);

    /**
     * Lida com a atualização genérica de campos da conta.
     * @param updateData Campos parciais a atualizar.
     */
    const handleUpdate = async (updateData: Partial<AccountData>) => {
        setData(prev => prev ? { ...prev, ...updateData } : null);
        setError(null);
        try {
            await accountService.updateAccount(updateData);
        } catch (err) {
            console.error("Erro ao atualizar conta:", err);
            setError("Erro ao atualizar dados da conta.");
            await loadData();
        }
    };

    /**
     * Atualiza dados básicos do perfil (nome, apelido e categoria).
     * @param updateData Objeto com nome/apelido/categoria.
     */
    const handleUpdateBasico = async (updateData: { nome?: string; apelido?: string; id_categoria?: number }) => {
        const mergedData = data ? {
            ...data,
            ...(updateData.nome !== undefined && { nome: updateData.nome }),
            ...(updateData.apelido !== undefined && { slug: updateData.apelido }),
            ...(updateData.id_categoria !== undefined && {
                categoria_id: updateData.id_categoria,
                id_categoria: updateData.id_categoria
            })
        } : {
            ...updateData,
            ...(updateData.id_categoria !== undefined && {
                categoria_id: updateData.id_categoria,
                id_categoria: updateData.id_categoria
            })
        };

        setData(mergedData as AccountData);
        setError(null);
        try {
            await accountService.updateAccountBasico(updateData);
            return { success: true };
        } catch (err: any) {
            console.error("Erro ao atualizar dados básicos:", err);
            const status = err.response?.status;
            setError(status === 409 ? "Este apelido já está em uso." : "Erro ao atualizar dados básicos da conta.");
            await loadData();
            return { success: false, status };
        }
    };

    /**
     * Atualiza dados de contato (telefone, e-mail, instagram).
     * @param updateData Campos de contato.
     */
    const handleUpdateContato = async (updateData: { telefone?: string; email?: string; instagram?: string }) => {
        const mergedData = data ? {
            ...data,
            ...(updateData.telefone !== undefined && { telefone: updateData.telefone }),
            ...(updateData.email !== undefined && { email: updateData.email }),
            ...(updateData.instagram !== undefined && { insta: updateData.instagram })
        } : updateData;

        setData(mergedData as AccountData);
        setError(null);
        try {
            await accountService.updateAccountContato({
                telefone: updateData.telefone ?? data?.telefone,
                email: updateData.email ?? data?.email,
                instagram: updateData.instagram ?? data?.insta
            });
        } catch (err) {
            console.error("Erro ao atualizar contato:", err);
            setError("Erro ao atualizar dados de contato.");
            await loadData();
        }
    };

    /**
     * Atualiza os dados de endereço do usuário.
     * @param updateData Campos parciais de endereço.
     */
    const handleUpdateEndereco = async (updateData: Partial<AccountData>) => {
        const mergedData = data ? { ...data, ...updateData } : updateData;
        setData(mergedData as AccountData);
        setError(null);
        try {
            await accountService.updateEndereco(mergedData);
        } catch (err) {
            console.error("Erro ao atualizar endereço:", err);
            setError("Erro ao atualizar endereço.");
            await loadData();
        }
    };

    /**
     * Atualiza as configurações avançadas de marketing.
     * @param updateData IDs de Analytics, Pixel e Ads.
     */
    const handleUpdateConfiguracoesAvancadas = async (updateData: { g_analytcs?: string; meta_pixel_id?: string; conta_google_ads?: string; horario?: any }) => {
        const mergedData = data ? {
            ...data,
            ...(updateData.g_analytcs !== undefined && { g_analytcs: updateData.g_analytcs }),
            ...(updateData.meta_pixel_id !== undefined && { meta_pixel_id: updateData.meta_pixel_id }),
            ...(updateData.conta_google_ads !== undefined && { conta_google_ads: updateData.conta_google_ads }),
            ...(updateData.horario !== undefined && { horario: updateData.horario })
        } : updateData;

        setData(mergedData as AccountData);
        setError(null);
        try {
            await accountService.updateConfiguracoesAvancadas(updateData);
        } catch (err) {
            console.error("Erro ao atualizar configurações avançadas:", err);
            setError("Erro ao atualizar configurações avançadas.");
            await loadData();
        }
    };

    /**
     * Busca um endereço completo a partir de um CEP.
     * @param cep CEP para consulta.
     */
    const fetchAddress = async (cep: string): Promise<AddressData | null> => {
        setError(null);
        try {
            const address = await accountService.fetchEndereco(cep);
            return address;
        } catch (err) {
            console.error("Erro ao buscar endereço por CEP:", err);
            setError("CEP não encontrado.");
            return null;
        }
    };

    /**
     * Valida se um slug está disponível para uso ou se já pertence ao usuário atual.
     * @param slug Slug desejado.
     * @param currentId ID do usuário atual.
     */
    const validateSlug = async (slug: string, currentId: string): Promise<boolean> => {
        try {
            const result = await accountService.checkSlug(slug);
            // Válido se o slug estiver livre OU pertencer à conta atual
            return !result.slug || result.id_loja === currentId;
        } catch (err) {
            console.error("Erro ao validar slug:", err);
            return false;
        }
    };

    return {
        isLoading,
        data,
        categorias,
        error,
        loadData,
        handleUpdate,
        handleUpdateBasico,
        handleUpdateContato,
        handleUpdateEndereco,
        handleUpdateConfiguracoesAvancadas,
        fetchAddress,
        validateSlug,
    };
}
