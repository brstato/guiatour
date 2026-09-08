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
    g_tag: string;
    latitude: number;
    longitude: number;
    conta_google_ads_nome: string;
    conta_google_ads_id: string;
    g_analytcs: string;
    meta_pixel_id: string;
    conta_google_ads: string;
    horario: Record<string, any>;
}

export interface PosTattooItem {
    id_item: number;
    descricao: string;
}

export interface CuidadoItem {
    id_item: number;
    id_site: number;
    descricao: string;
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
    pos_tattoo?: PosTattooItem[];
    cuidados?: CuidadoItem[];
}
