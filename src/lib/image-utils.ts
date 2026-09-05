/**
 * Comprime uma imagem usando Canvas API.
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
            // Retorna apenas a parte base64 se necessário, ou a string completa
            resolve(compressedBase64);
        };

        img.onerror = (error) => reject(error);
    });
}
