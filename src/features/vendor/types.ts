export type UserRole = 'vendedor' | 'comerciante';

export interface Merchant {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  categoria?: string;
  cidade?: string;
  uf?: string;
  ativo?: boolean;
}

export interface CreateMerchantDTO {
  nome: string;
  slug: string;
  telefone: string;
  email: string;
  insta: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  g_analytcs: string;
  meta_pixel_id: string;
  conta_google_ads: string;
  horario: string;
  titulo: string;
  subtitulo: string;
  bio: string;
  nome_arquivo_foto_avatar: string;
  nome_arquivo_foto_bio: string;
  nome_arquivo_foto_capa: string;
  foto_bio: string;
  avatar: string;
  foto_capa: string;
  trabalhos: string;
  id_categoria: number;
}

export interface MerchantListResponse {
  items: Merchant[];
  total: number;
  page: number;
  pageSize: number;
}
