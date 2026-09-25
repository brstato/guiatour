import { api } from '@/services/api';
import type { LoginResult, RefreshResult, RecoveryResult, GoogleLoginPayload, GoogleLoginCodePayload } from '@/types/api';
import axios from 'axios';

/**
 * Serviço responsável pelas operações de autenticação com o backend.
 * Utiliza a instância do axios configurada em '@/services/api'.
 * Implementa o padrão de Singleton para centralizar o estado de autenticação.
 */
class AuthService {
  /**
   * Autentica um usuário utilizando o código de autorização do Google OAuth.
   * Envia o code para o backend trocar por tokens.
   * 
   * @param payload - Objeto contendo o code retornado pelo Google.
   * @returns Uma promessa que resolve para um LoginResult.
   */
  async loginGoogleCode(payload: GoogleLoginCodePayload): Promise<LoginResult> {
    try {
      const response = await api.post('login_google', payload);
      return this.parseLoginResponse(response);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return this.parseLoginResponse(error.response);
      }
      return {
        success: false,
        statusCode: 500,
        token: '',
        rToken: '',
        userId: '',
        idLoja: '',
        errorMessage: 'Não foi possível conectar ao servidor. Tente novamente mais tarde.',
      };
    }
  }

  /**
   * Autentica um usuário utilizando dados do Google OAuth (Fluxo Implícito).
   * Envia as informações recebidas do Google para o backend para validação ou criação de conta.
   * 
   * @param payload - Dados incluindo e-mail, ID, token e nome do Google, além de metadados.
   * @returns Uma promessa que resolve para um LoginResult contendo os tokens de acesso ou mensagem de erro.
   */
  async loginGoogle(payload: GoogleLoginPayload): Promise<LoginResult> {
    try {
      const response = await api.post('login_google', payload);
      return this.parseLoginResponse(response);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return this.parseLoginResponse(error.response);
      }
      return {
        success: false,
        statusCode: 500,
        token: '',
        rToken: '',
        userId: '',
        idLoja: '',
        errorMessage: 'Não foi possível conectar ao servidor. Tente novamente mais tarde.',
      };
    }
  }

  /**
   * Realiza o login padrão utilizando e-mail e senha.
   * 
   * @param email - Endereço de e-mail do usuário.
   * @param senha - Senha do usuário.
   * @returns Uma promessa que resolve para um LoginResult.
   */
  async login(email: string, senha: string): Promise<LoginResult> {
    try {
      const response = await api.post('login', { email, senha });
      return this.parseLoginResponse(response);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return this.parseLoginResponse(error.response);
      }
      return {
        success: false,
        statusCode: 500,
        token: '',
        rToken: '',
        userId: '',
        idLoja: '',
        errorMessage: 'Não foi possível conectar ao servidor. Tente novamente mais tarde.',
      };
    }
  }

  /**
   * Renova os tokens de autenticação utilizando um refresh token válido.
   * 
   * @param rToken - O refresh token atual.
   * @param userId - O ID do usuário.
   * @returns Uma promessa que resolve para um RefreshResult.
   */
  async refreshToken(rToken: string, userId: string): Promise<RefreshResult> {
    try {
      const response = await api.post('token/refresh', { r_token: rToken, uuid: userId });
      if (response.status === 200) {
        return {
          success: true,
          statusCode: 200,
          token: response.data.token,
          rToken: response.data.r_token,
          role: response.data.tipo || response.data.message?.tipo,
        };
      }
      return { success: false, statusCode: response.status, token: '', rToken: '' };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return { success: false, statusCode: error.response.status, token: '', rToken: '' };
      }
      return { success: false, statusCode: 500, token: '', rToken: '' };
    }
  }

  /**
   * Solicita um e-mail de recuperação de senha para o endereço especificado.
   * 
   * @param email - O e-mail para o qual enviar a recuperação.
   * @returns Uma promessa que resolve para um RecoveryResult.
   */
  async recoveryPassword(email: string): Promise<RecoveryResult> {
    try {
      const response = await api.post('recovery', { email });
      return {
        success: response.status === 200,
        statusCode: response.status,
        message: response.data.message || '',
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          statusCode: error.response.status,
          message: error.response.data?.message || 'Erro ao recuperar senha',
        };
      }
      return {
        success: false,
        statusCode: 500,
        message: 'Não foi possível conectar ao servidor. Tente novamente mais tarde.',
      };
    }
  }

  /**
   * Auxiliar interno para processar o formato de resposta de login/google do backend.
   * Lida com sucessos e códigos de erro comuns, mapeando-os para mensagens amigáveis.
   */
  private parseLoginResponse(response: any): LoginResult {
    if (response.status === 200) {
      return {
        success: true,
        statusCode: 200,
        token: response.data.token,
        rToken: response.data.r_token,
        userId: String(response.data.message?.id || ''),
        idLoja: String(response.data.id_loja || ''),
        role: response.data.tipo || response.data.message?.tipo,
        errorMessage: '',
      };
    }

    const errorMessages: Record<number, string> = {
      401: 'E-mail ou senha incorretos.',
      404: 'Não encontramos uma conta com esse e-mail. Verifique o e-mail informado.',
      422: 'Verifique os dados informados e tente novamente.',
    };

    return {
      success: false,
      statusCode: response.status,
      token: '',
      rToken: '',
      userId: '',
      idLoja: '',
      errorMessage: errorMessages[response.status] || 'Não foi possível realizar o login no momento. Tente novamente mais tarde.',
    };
  }
}

export const authService = new AuthService();
