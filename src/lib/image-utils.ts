import heic2any from 'heic2any';

/**
 * Converte arquivos HEIC (iOS) para JPEG e comprime imagens via Canvas.
 * @param file Arquivo obtido diretamente do evento do input (File).
 * @param maxDimension Dimensão máxima do lado mais longo (padrão: 1920px).
 * @param quality Qualidade do JPEG final (0.0 a 1.0).
 * @returns Promise com o Base64 otimizado, pronto para envio no payload.
 */
export async function processAndCompressImage(
    file: File,
    maxDimension: number = 1920,
    quality: number = 0.75
): Promise<string> {
    let sourceBlob: Blob = file;

    // 1. Detecta se a imagem está em formato HEIC/HEIF
    const isHeic =
        file.type === 'image/heic' ||
        file.type === 'image/heif' ||
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif');

    // 2. Converte para JPEG caso seja HEIC
    if (isHeic) {
        try {
            const converted = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9,
            });
            // heic2any pode retornar um Blob ou Blob[] dependendo da imagem
            sourceBlob = Array.isArray(converted) ? converted[0] : converted;
        } catch (error) {
            console.error('Falha ao converter HEIC via heic2any:', error);
            throw new Error('Não foi possível converter a imagem do formato HEIC.');
        }
    }

    // 3. Usa Object URL para evitar alocar um Base64 gigante na RAM
    const objectUrl = URL.createObjectURL(sourceBlob);

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = objectUrl;

        img.onload = () => {
            // Libera a memória imediatamente após carregar a imagem
            URL.revokeObjectURL(objectUrl);

            let { width, height } = img;

            // 4. Redimensionamento proporcional sem distorcer Retrato/Paisagem
            if (width > height) {
                if (width > maxDimension) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                }
            } else {
                if (height > maxDimension) {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Não foi possível inicializar o canvas 2D.'));
                return;
            }

            // 5. Desenha e comprime
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedBase64);
        };

        img.onerror = () => {
            // Garante a liberação de memória mesmo em caso de erro
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Falha ao processar e carregar a imagem no Canvas.'));
        };
    });
}

/**
 * Comprime uma imagem usando Canvas API a partir de Base64 (legado).
 * @deprecated Utilize `processAndCompressImage` com o objeto File diretamente.
 * @param base64 String base64 da imagem original.
 * @param maxWidth Largura máxima permitida.
 * @param maxHeight Altura máxima permitida.
 * @param quality Qualidade da compressão (0.0 a 1.0).
 * @returns Promise com a string base64 comprimida.
 */
export async function compressImage(
    base64: string,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.7
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Redimensionamento proporcional
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Não foi possível obter o contexto do canvas'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Exporta como JPEG com a qualidade desejada
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedBase64);
        };

        img.onerror = (error) => reject(error);
    });
}

/**
 * Retorna a URL completa para uma imagem, tratando URLs base64, URLs externas
 * e caminhos relativos ao servidor de imagens configurado.
 * @param url Caminho ou URL da imagem.
 * @returns URL formatada pronta para uso em elementos <img>.
 */
export function getImageUrl(url: string | undefined): string {
    if (!url) return "";
    if (url.startsWith('data:') || url.startsWith('http')) return url;

    // Fallback para a URL do frontend caso a variável de ambiente não esteja definida
    const base = import.meta.env.VITE_IMAGE_BASE_URL || 'https://pages.guiatour.online';

    // Garante que não haja barras duplas e que a URL esteja bem formada
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${base}${cleanPath}`;
}
