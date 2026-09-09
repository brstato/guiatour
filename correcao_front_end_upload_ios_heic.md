# Resolução de Problemas no Upload de Fotos (Front-end)

Este guia detalha a solução para o front-end (TypeScript) referente aos problemas de upload de imagens enfrentados por usuários de iPhone.

## O Problema

A falha no envio ocorre por dois motivos principais no ambiente iOS:

1. **Formato Incompatível:** Dispositivos Apple salvam fotos no formato HEIC/HEIF por padrão. O construtor nativo `new Image()` do Safari frequentemente falha ao tentar carregar esse formato diretamente.

2. **Estouro de Memória (Crash):** Tentar converter arquivos brutos de 15 a 25 MB diretamente para Base64 antes da compressão esgota a memória da aba do navegador no celular, causando travamentos.

## Solução Implementada

Para resolver isso, vamos:

1. Interceptar a imagem diretamente como um objeto `File`.

2. Converter o formato `.heic` nativamente no front-end.

3. Usar `URL.createObjectURL` (que aponta para a memória sem duplicar o arquivo em texto) para carregar e comprimir a imagem via Canvas.

### Passo 1: Instalar a dependência

No diretório do seu projeto front-end, instale a biblioteca de conversão:

```
npm install heic2any

```

### Passo 2: Atualizar o utilitário `image-utils.ts`

Substitua a antiga função `compressImage` pelo código abaixo. Esta nova versão recebe o arquivo físico e faz o gerenciamento seguro da memória.

```
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

        img.onerror = (error) => {
            // Garante a liberação de memória mesmo em caso de erro
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Falha ao processar e carregar a imagem no Canvas.'));
        };
    });
}

```

### 