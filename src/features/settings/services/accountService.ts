import { api } from '@/services/api';
import type { AccountData, AddressData } from '@/types/api';

/**
 * Serviço responsável pelas operações relacionadas à conta do usuário e configurações.
 * Segue o padrão Singleton para centralizar as chamadas de API de perfil.
 */
class AccountService {
    /**
     * Busca os dados completos da conta do usuário.
     * @param id Identificador do usuário.
     */
    async getAccountData(id: string): Promise<AccountData> {
        const response = await api.post('account/get_data', { id });
        return response.data;
    }

    /**
     * Atualiza informações gerais da conta.
     * @param data Dados parciais da conta.
     */
    async updateAccount(data: Partial<AccountData>): Promise<any> {
        const response = await api.post('account/update', data);
        return response.data;
    }

    /**
     * Atualiza dados básicos do perfil (nome e apelido).
     * @param data Objeto com nome e/ou apelido.
     */
    async updateAccountBasico(data: { nome?: string; apelido?: string }): Promise<any> {
        const response = await api.post('account/update_account_basico', data);
        return response.data;
    }

    /**
     * Atualiza informações de contato (telefone, e-mail público, instagram).
     * @param data Dados de contato.
     */
    async updateAccountContato(data: { telefone?: string; email?: string; instagram?: string }): Promise<any> {
        const payload = {
            telefone: data.telefone ?? "",
            email: data.email ?? "",
            instagram: data.instagram ?? "",
        };
        const response = await api.post('account/contato', payload);
        return response.data;
    }

    /**
     * Atualiza o endereço associado à conta.
     * @param data Dados parciais de endereço.
     */
    async updateEndereco(data: Partial<AccountData>): Promise<any> {
        const payload = {
            cep: data.cep ?? "",
            endereco: data.endereco ?? "",
            numero: data.numero ?? "",
            bairro: data.bairro ?? "",
            cidade: data.cidade ?? "",
            estado: data.estado ?? "",
            complemento: data.complemento ?? "",
        };
        const response = await api.post('account/update_endereco', payload);
        return response.data;
    }

    /**
     * Atualiza configurações de marketing e analytics.
     * @param data IDs de rastreamento e tags.
     */
    async updateConfiguracoesAvancadas(data: { g_analytcs?: string; meta_pixel_id?: string; conta_google_ads?: string }): Promise<any> {
        const payload = {
            g_analytcs: data.g_analytcs ?? "",
            meta_pixel_id: data.meta_pixel_id ?? "",
            conta_google_ads: data.conta_google_ads ?? "",
        };
        const response = await api.post('account/update_configuracoes_avancadas', payload);
        return response.data;
    }

    /**
     * Registra uma nova conta de usuário.
     * @param data Dados de registro.
     */
    async registerAccount(data: any): Promise<any> {
        const response = await api.post('account/register', data);
        return response.data;
    }

    /**
     * Busca informações de endereço a partir de um CEP.
     * @param cep CEP para consulta.
     */
    async fetchEndereco(cep: string): Promise<AddressData> {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) throw new Error("Informe um CEP válido.");

        const response = await api.get(`portfolio/account/${cleanCep}`);
        return response.data;
    }

    /**
     * Verifica se um slug (URL amigável) está disponível ou pertence ao usuário.
     * @param slug Slug a ser verificado.
     */
    async checkSlug(slug: string): Promise<{ slug: boolean; id_loja: string }> {
        const response = await api.post('account/get_slug', { slug });
        return response.data;
    }
}

export const accountService = new AccountService();
