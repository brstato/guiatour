export type UserRole = 'vendedor' | 'comerciante';

export interface Merchant {
  id: string;
  uuid?: string;
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
  latitude: string;
  longitude: string;
  url_video?: string;
}

export interface VendorMerchant {
  uuid: string;
  nome: string;
  slug: string;
}

export interface MerchantListResponse {
  items: Merchant[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SpotCategory {
  id_categoria: number;
  nome: string;
  slug: string;
}

export interface TouristSpotListItem {
  uuid: string;
  nome: string;
  slug: string;
  categoria: string;
  ativo: boolean;
}

export interface TouristSpotGalleryItem {
  id: number;
  url: string;
}

export interface TouristSpot {
  uuid: string;
  nome: string;
  slug: string;
  resumo: string;
  historia: string;
  latitude: number;
  longitude: number;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  capa: string;
  ativo: boolean;
  id_categoria: number;
  categoria_nome: string;
  categoria_slug: string;
  galeria: TouristSpotGalleryItem[];
  url_video?: string;
}

export interface SaveTouristSpotDTO {
  id_categoria: number;
  nome: string;
  resumo: string;
  historia: string;
  latitude: string;
  longitude: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  nome_arquivo_capa: string;
  capa: string;
  galeria: Array<{ nome_arquivo: string; itemFoto: string }>;
  url_video?: string;
}
