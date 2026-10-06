import axios from "axios";

/**
 * Instância do Axios configurada com a URL base e interceptadores para
 * gerenciamento automático de tokens e renovação (refresh token).
 */
/**
 * Define a URL base da API com base no ambiente.
 * Se VITE_API_URL estiver definida no .env, ela terá precedência.
 * Caso contrário, segue a regra:
 * - Produção: https://api.guiatour.online/api/v1/
 * - Outros (Dev/Teste): https://api.guiatour.online/api/v1/
 */
const baseURL = import.meta.env.VITE_API_URL || (
    import.meta.env.PROD
        ? 'https://api.guiatour.online/api/v1/'
        : 'https://api.guiatour.online/api/v1/'
);

export const api = axios.create({
    baseURL,
    timeout: 60000, // Tempo limite aumentado para requisições lentas
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Interceptador de Requisição: Injeta o token de acesso do localStorage
 * em cada chamada enviada para o servidor.
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Fila para gerenciar múltiplas requisições falhas durante o refresh do token
let isRefreshing = false;
let failedQueue: any[] = [];

/**
 * Processa a fila de requisições que aguardavam o novo token.
 * @param error Erro ocorrido durante o processo, se houver.
 * @param token Novo token de acesso para ser usado nas requisições da fila.
 */
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

/**
 * Interceptador de Resposta: renova o token quando ele expira (401) e repete a chamada.
 *
 * - 401 = token ausente, inválido ou expirado -> tenta o refresh.
 * - 403 = acesso NEGADO (loja de outro vendedor, rota de administrador...) -> NÃO renova:
 *   renovar não muda a permissão e, com o id errado, derrubava a sessão.
 *   Exceção: "Vendedor inativo." encerra a sessão (o vendedor foi desativado).
 * - O refresh usa o UUID de QUEM ESTÁ LOGADO ("id"). "id_loja" é a loja aberta no painel
 *   do vendedor e não serve para renovar a sessão dele.
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Avoid infinite loop if refresh token call fails
        if (!originalRequest || originalRequest.url === "token/refresh") {
            return Promise.reject(error);
        }

        // 403: acesso negado. Não adianta renovar o token.
        if (error.response?.status === 403) {
            if (error.response?.data?.error === "Vendedor inativo.") {
                localStorage.clear();
                window.location.href = "/";
            }
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const rToken = localStorage.getItem("r_token");
            // UUID de quem está logado (loja ou vendedor). NÃO usar "id_loja" primeiro:
            // no painel do vendedor ele guarda a loja aberta, não o vendedor.
            const userId = localStorage.getItem("id") || localStorage.getItem("id_loja");

            if (!rToken || !userId) {
                isRefreshing = false;
                // Redirect to login if tokens are missing
                window.location.href = "/";
                return Promise.reject(error);
            }

            try {
                const response = await api.post("token/refresh", {
                    r_token: rToken,
                    uuid: userId,
                });

                const { token, r_token: newRToken } = response.data;

                localStorage.setItem("token", token);
                localStorage.setItem("r_token", newRToken);

                api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                originalRequest.headers.Authorization = `Bearer ${token}`;

                processQueue(null, token);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.clear();
                window.location.href = "/";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
