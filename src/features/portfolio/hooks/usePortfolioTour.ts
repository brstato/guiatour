import { useState, useEffect, useCallback } from 'react';

export interface TourStep {
    id: string;
    accordionValue?: string; // se pertencer a algum AccordionItem (ex: 'apresentacao', 'contato', etc.)
    targetElementId?: string; // id do elemento na DOM para scroll/destaque
    title: string;
    badge: string;
    description: string;
    tips: string[];
    importance: string;
}

export const PORTFOLIO_TOUR_STEPS: TourStep[] = [
    {
        id: 'identidade',
        targetElementId: 'section-identidade',
        badge: 'Identidade & Capa',
        title: 'Capa, Avatar e Apelido',
        description: 'É a primeira impressão que seu cliente tem ao abrir sua página. Uma foto nítida e uma capa marcante aumentam significativamente a confiança.',
        tips: [
            'Foto de perfil: use uma foto sua de alta resolução ou o logo do seu estúdio.',
            'Foto de capa: escolha uma foto horizontal que represente seu ambiente de trabalho ou arte.',
            'Apelido (Slug): define o link direto da sua página pública (ex: /tatuador/seu-nome).'
        ],
        importance: 'Obrigatório para transmitir profissionalismo instantâneo.'
    },
    {
        id: 'apresentacao',
        accordionValue: 'apresentacao',
        targetElementId: 'section-apresentacao',
        badge: 'Apresentação',
        title: 'Título, Subtítulo e Biografia',
        description: 'Conte quem você é, seus anos de experiência e suas especialidades no mundo da tatuagem.',
        tips: [
            'Título: seu foco principal (ex: Especialista em Fineline & Floral).',
            'Subtítulo: chamada atraente ou slogan que resuma seu diferencial.',
            'Foto da Bio: foto no estúdio que humaniza seu atendimento.',
            'Bio: conte sua trajetória artística, valores e como funciona seu processo criativo.'
        ],
        importance: 'Conecta emocionalmente com clientes indecisos.'
    },
    {
        id: 'contato',
        accordionValue: 'contato',
        targetElementId: 'section-contato',
        badge: 'Canais de Contato',
        title: 'WhatsApp, E-mail e Redes',
        description: 'Os canais diretos para o cliente orçar e agendar sessões com você.',
        tips: [
            'Telefone/WhatsApp: verifique com atenção, pois é o botão principal de ação dos clientes.',
            'Instagram: coloque apenas o arroba (sem @ ou link) para direcionamento correto.'
        ],
        importance: 'Permite que o cliente inicie o orçamento em um clique.'
    },
    {
        id: 'localizacao',
        accordionValue: 'localizacao',
        targetElementId: 'section-localizacao',
        badge: 'Localização',
        title: 'Endereço do Estúdio',
        description: 'Clientes buscam tatuadores próximos à sua região ou planejam deslocamento.',
        tips: [
            'Digite o CEP para preenchimento automático de rua, bairro, cidade e estado.',
            'Adicione referências caso seu estúdio fique em galerias ou prédios comerciais.'
        ],
        importance: 'Ajuda na indexação local e facilita a chegada do cliente.'
    },
    {
        id: 'trabalhos',
        accordionValue: 'trabalhos',
        targetElementId: 'section-trabalhos',
        badge: 'Portfólio',
        title: 'Galeria de Trabalhos',
        description: 'Sua vitrine visual. Mostre a qualidade do seu traço, cicatrização e versatilidade.',
        tips: [
            'Cadastre no mínimo 4 fotos com boa luz e foco.',
            'Fotos de tatuagens já cicatrizadas passam ainda mais autoridade técnica.',
            'Use fotos verticais ou quadradas nítidas.'
        ],
        importance: 'O fator decisivo para a conversão de novos clientes.'
    },
    {
        id: 'pos-tattoo',
        accordionValue: 'pos-tattoo',
        targetElementId: 'section-pos-tattoo',
        badge: 'Cuidados Pós-Tattoo',
        title: 'Orientações de Cicatrização',
        description: 'Instruções claras pós-procedimento demonstram zelo com a saúde e a cicatrização do trabalho.',
        tips: [
            'Orientações pós-tattoo reduzem dúvidas frequentes e passam extrema segurança.',
            'Adicione instruções sobre lavagem, pomadas, exposição ao sol e cuidados nos primeiros dias.'
        ],
        importance: 'Demonstra autoridade e suporte pós-venda completo.'
    },
    {
        id: 'config',
        accordionValue: 'config',
        targetElementId: 'section-config',
        badge: 'Configurações Avançadas',
        title: 'Horários e Métricas',
        description: 'Defina os horários de atendimento do estúdio e integre ferramentas de métricas e anúncios.',
        tips: [
            'Configure seus horários reais para alinhar a expectativa de resposta dos clientes.',
            'Adicione Google Analytics ou Meta Pixel se veicula anúncios para atrair novos clientes.'
        ],
        importance: 'Alinha horários de atendimento e potencializa campanhas de captação.'
    }
];

export function usePortfolioTour(userId?: string | null, isLoading = false) {
    const storageKey = userId ? `guia_tour_${userId}` : 'guia_tour_default';
    const [isOpen, setIsOpen] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // No primeiro acesso (sem flag no localStorage e após carregar dados), abre o tour automaticamente
    useEffect(() => {
        if (isLoading || !userId) return;

        try {
            const hasSeen = localStorage.getItem(storageKey);
            if (!hasSeen) {
                const timer = setTimeout(() => {
                    setIsOpen(true);
                    setCurrentStepIndex(0);
                }, 100);
                return () => clearTimeout(timer);
            }
        } catch {
            // Caso localStorage esteja desabilitado no navegador
        }
    }, [isLoading, userId, storageKey]);

    const markTourAsCompleted = useCallback(() => {
        try {
            localStorage.setItem(storageKey, 'true');
        } catch {
            // Trata restrições do navegador
        }
    }, [storageKey]);

    const closeTour = useCallback(() => {
        markTourAsCompleted();
        setIsOpen(false);
    }, [markTourAsCompleted]);

    const openTour = useCallback((startIndex = 0) => {
        setCurrentStepIndex(startIndex);
        setIsOpen(true);
    }, []);

    const openTourForSection = useCallback((sectionId: string) => {
        const foundIndex = PORTFOLIO_TOUR_STEPS.findIndex(
            s => s.id === sectionId || s.accordionValue === sectionId
        );
        if (foundIndex !== -1) {
            setCurrentStepIndex(foundIndex);
            setIsOpen(true);
        } else {
            setCurrentStepIndex(0);
            setIsOpen(true);
        }
    }, []);

    const nextStep = useCallback(() => {
        setCurrentStepIndex((prev) => {
            if (prev < PORTFOLIO_TOUR_STEPS.length - 1) {
                return prev + 1;
            }
            // Se chegou ao fim
            closeTour();
            return prev;
        });
    }, [closeTour]);

    const prevStep = useCallback(() => {
        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
    }, []);

    const goToStep = useCallback((index: number) => {
        if (index >= 0 && index < PORTFOLIO_TOUR_STEPS.length) {
            setCurrentStepIndex(index);
        }
    }, []);

    const currentStep = PORTFOLIO_TOUR_STEPS[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === PORTFOLIO_TOUR_STEPS.length - 1;
    const totalSteps = PORTFOLIO_TOUR_STEPS.length;

    return {
        isOpen,
        currentStep,
        currentStepIndex,
        totalSteps,
        isFirstStep,
        isLastStep,
        openTour,
        openTourForSection,
        closeTour,
        nextStep,
        prevStep,
        goToStep,
        steps: PORTFOLIO_TOUR_STEPS
    };
}
