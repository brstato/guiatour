import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { authService } from '../services/authService';

/**
 * Hook customizado que atua como Controller para a funcionalidade de Autenticação.
 * Centraliza a lógica de login (E-mail/Senha e Google), recuperação de senha,
 * auto-login e gerenciamento de tokens persistentes.
 */
export function useAuthController() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [message, setMessage] = useState<{ title: string; message: string } | null>(null);
  const navigate = useNavigate();
  const autoLoginAttempted = useRef(false);

  /** Limpa o estado de erro da UI. */
  const clearError = () => setError(null);
  /** Limpa o estado de mensagens de sucesso/informação da UI. */
  const clearMessage = () => setMessage(null);

  /**
   * Tenta realizar o login automático ao montar o componente.
   * Verifica a existência de um refresh token e tenta renovar o acesso.
   */
  useEffect(() => {
    const tryAutoLogin = async () => {
      if (autoLoginAttempted.current) return;

      const rToken = localStorage.getItem('r_token');
      const userId = localStorage.getItem('id');

      if (!rToken || !userId) return;

      autoLoginAttempted.current = true;
      setIsLoading(true);
      try {
        const result = await authService.refreshToken(rToken, userId);
        if (result.success) {
          localStorage.setItem('r_token', result.rToken);
          localStorage.setItem('token', result.token);
          navigate('/portfolio');
        } else {
          if (result.statusCode === 401) {
            clearPersistentTokens();
          }
        }
      } catch (err) {
        console.error("Auto-login falhou:", err);
      } finally {
        setIsLoading(false);
      }
    };

    tryAutoLogin();
  }, [navigate]);

  /**
   * Limpa todos os tokens e informações de sessão do localStorage.
   */
  const clearPersistentTokens = () => {
    localStorage.removeItem('r_token');
    localStorage.removeItem('id');
    localStorage.removeItem('token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('login_method');
  };

  /**
   * Lida com o processo de login por e-mail e senha.
   * @param email E-mail do usuário.
   * @param senha Senha do usuário.
   */
  const handleLogin = async (email: string, senha: string) => {
    if (!email || !senha) {
      setError({ title: 'Atenção', message: 'Por favor, preencha o e-mail e a senha.' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.login(email, senha);

      if (result.success) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('r_token', result.rToken);
        localStorage.setItem('id', result.userId);

        navigate('/dashboard');
      } else {
        const errorTitles: Record<number, string> = {
          401: 'Acesso Negado',
          404: 'Usuário não encontrado',
          422: 'Dados inválidos',
        };
        setError({
          title: errorTitles[result.statusCode] || 'Serviço indisponível',
          message: result.errorMessage,
        });
      }
    } catch (err) {
      setError({
        title: 'Erro de conexão',
        message: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Lida com o processo de recuperação de senha.
   * @param email E-mail do usuário para recuperação.
   */
  const handleForgotPassword = async (email: string) => {
    if (!email) {
      setError({ title: 'Atenção', message: 'Por favor informe o email.' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.recoveryPassword(email);
      if (result.success) {
        setMessage({ title: 'Sucesso', message: result.message });
      } else {
        setError({ title: 'Erro', message: result.message });
      }
    } catch (err) {
      setError({
        title: 'Erro',
        message: 'Ocorreu um erro inesperado.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Lida com o processo de login via Google OAuth.
   * Obtém os dados do usuário do Google e os envia para validação no backend.
   */
  const handleLoginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const { access_token } = tokenResponse;

        // Buscar dados do usuário no Google APIs
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        const g_mail = userInfo.data.email;
        const g_id = userInfo.data.sub;
        const g_name = userInfo.data.name;

        const r_token = "";
        const ads_id = null;

        const result = await authService.loginGoogle({
          g_email: g_mail,
          g_id,
          g_token: access_token,
          g_name,
          ads_id,
          r_token
        });

        if (result.success) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('r_token', result.rToken);
          localStorage.setItem('id', result.userId);
          localStorage.setItem('login_method', 'google');
          navigate('/dashboard');
        } else {
          setError({ title: 'Erro de Autenticação', message: `Falha ao autenticar com Google no servidor.` });
        }
      } catch (err) {
        setError({ title: 'Erro de Autenticação', message: 'Ocorreu um erro ao processar o login com o Google.' });
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.log('Login Google falhou:', error);
      setError({ title: 'Erro', message: 'Houve um problema ao realizar o login com o Google.' });
    }
  });

  return {
    isLoading,
    error,
    message,
    clearError,
    clearMessage,
    handleLogin,
    handleForgotPassword,
    handleLoginGoogle,
  };
}

