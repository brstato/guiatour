/**
 * Vídeo do YouTube.
 *
 * As páginas públicas (index.html do comerciante e ponto.html) só tocam links que a
 * regex abaixo reconhece. O painel usa a MESMA regra para nunca salvar um link que a
 * página não consegue tocar.
 */
const YOUTUBE_RE =
  /^https:\/\/(?:(?:www\.|m\.)?youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#/]|$)/;

/** ID de 11 caracteres do vídeo, ou "" se não for um link de vídeo do YouTube. */
export function youtubeId(url: string | null | undefined): string {
  if (typeof url !== "string") return "";
  const m = url.trim().match(YOUTUBE_RE);
  return m ? m[1] : "";
}

/**
 * Normaliza o que a pessoa colou:
 * - vazio                  -> ""   (remove o vídeo)
 * - link de vídeo válido   -> "https://www.youtube.com/watch?v=ID" (sem parâmetros extras)
 * - qualquer outra coisa   -> null (inválido)
 * Aceita colar sem "https://" ou com "http://".
 */
export function normalizarUrlYoutube(entrada: string): string | null {
  const texto = entrada.trim();
  if (texto === "") return "";
  const comHttps = "https://" + texto.replace(/^https?:\/\//i, "");
  const id = youtubeId(comHttps);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}

/** Miniatura do vídeo (a versão "hqdefault" existe para todo vídeo). */
export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
