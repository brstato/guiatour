import axios from "axios";

/**
 * Instância do Axios configurada com a URL base e interceptadores para
 * gerenciamento automático de tokens e renovação (refresh token).
 */
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
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
 * Interceptador de Resposta: Lida com a renovação de tokens em caso de erros 401 ou 403.
 * Implementa a lógica de retry para garantir que o usuário não perca a sessão
 * se o token expirar durante o uso.
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Avoid infinite loop if refresh token call fails
        if (originalRequest.url === "token/refresh") {
            return Promise.reject(error);
        }

        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
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
            const userId = localStorage.getItem("id");

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
