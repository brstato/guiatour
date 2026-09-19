/**
 * Data Transfer Objects for API Responses
 * Based on the Python reference project structure.
 */

export interface LoginResult {
    success: boolean;
    statusCode: number;
    token: string;
    rToken: string;
    userId: string;
    errorMessage: string;
}

export interface RefreshResult {
    success: boolean;
    statusCode: number;
    token: string;
    rToken: string;
}

export interface RecoveryResult {
    success: boolean;
    statusCode: number;
    message: string;
}

export interface GoogleLoginPayload {
    g_email: string;
    g_id: string;
    g_token: string;
    g_name: string;
    ads_id?: string | null;
    r_token: string;
}

export interface GoogleLoginCodePayload {
    g_code: string;
    r_token?: string;
}

export interface AddressData {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    location?: {
        coordinates: {
            latitude: number;
            longitude: number;
        };
    };
}

export interface AccountData {
    nome: string;
    telefone: string;
    email: string;
    slug: string;
    cep: string;
    endereco: string;
    bairro: string;
    cidade: string;
    estado: string;
    numero: string;
    complemento: string;
    insta: string;
    meta_pixel: string;
    g_analytics_id: string;
    latitude: number;
    longitude: number;
    google_ads_nome: string;
    google_ads_id: string;
    meta_long_token?: string;
    meta_ads_id?: string;
    meta_pixel_id?: string;
    google_analytics_id?: string;
    status_campanha_meta?: boolean;
    horario: Record<string, any>;
    id?: string;
}

export interface PortfolioData {
    id_site: number;
    titulo: string;
    subtitulo: string;
    bio: string;
    avatar: string;
    foto_bio: string;
    foto_capa?: string;
    itens: Array<{
        id_foto: number;
        url_foto: string;
    }>;
}
