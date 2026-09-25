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
    idLoja: string;
    role?: 'vendedor' | 'comerciante';
    errorMessage: string;
}

export interface RefreshResult {
    success: boolean;
    statusCode: number;
    token: string;
    rToken: string;
    role?: 'vendedor' | 'comerciante';
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

export interface Categoria {
    categoria_id: number;
    categoria_nome: string;
}

export interface CategoriasResponse {
    itens: Categoria[];
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
    g_analytcs: string;
    latitude: number;
    longitude: number;
    google_ads_nome: string;
    conta_google_ads: string;
    meta_long_token?: string;
    meta_ads_id?: string;
    meta_pixel_id?: string;
    status_campanha_meta?: boolean;
    horario: Record<string, any>;
    id?: string;
    categoria_id?: number;
    id_categoria?: number;
    categoria_nome?: string;
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
