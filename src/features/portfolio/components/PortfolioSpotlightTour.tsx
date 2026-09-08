import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Sparkles,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    X,
    Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TourStep } from '../hooks/usePortfolioTour';

interface PortfolioSpotlightTourProps {
    open: boolean;
    step: TourStep;
    stepIndex: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
    onClose: () => void;
    onGoToStep: (index: number) => void;
    onOpenAccordion?: (accordionValue: string) => void;
}

interface RectState {
    top: number;
    left: number;
    width: number;
    height: number;
}

export function PortfolioSpotlightTour({
    open,
    step,
    stepIndex,
    totalSteps,
    onNext,
    onPrev,
    onClose,
    onGoToStep,
    onOpenAccordion,
}: PortfolioSpotlightTourProps) {
    const [targetRect, setTargetRect] = useState<RectState | null>(null);
    const isFirst = stepIndex === 0;
    const isLast = stepIndex === totalSteps - 1;
    const intervalRef = useRef<number | null>(null);

    const measureTarget = useCallback(() => {
        const targetId = step.targetElementId || `section-${step.id}`;
        const el = document.getElementById(targetId);
        if (!el) {
            setTargetRect(null);
            return;
        }

        const rect = el.getBoundingClientRect();
        setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
        });
    }, [step]);

    useEffect(() => {
        if (!open) return;

        // Se o passo pertence a um acordeão, abre-o
        if (step.accordionValue && onOpenAccordion) {
            onOpenAccordion(step.accordionValue);
        }

        // Faz scroll suave até o elemento
        const targetId = step.targetElementId || `section-${step.id}`;
        const scrollTimer = setTimeout(() => {
            const el = document.getElementById(targetId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 120);

        // Medições repetidas enquanto a animação do acordeão e o scroll acontecem
        const initialTimer = setTimeout(() => {
            measureTarget();
        }, 0);

        let count = 0;
        intervalRef.current = window.setInterval(() => {
            measureTarget();
            count++;
            if (count > 8 && intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }, 80);

        const handleUpdate = () => measureTarget();
        window.addEventListener('resize', handleUpdate);
        window.addEventListener('scroll', handleUpdate, { passive: true });

        return () => {
            clearTimeout(scrollTimer);
            clearTimeout(initialTimer);
            if (intervalRef.current) clearInterval(intervalRef.current);
            window.removeEventListener('resize', handleUpdate);
            window.removeEventListener('scroll', handleUpdate);
            setTargetRect(null);
        };
    }, [open, step, onOpenAccordion, measureTarget]);

    if (!open) return null;

    const padding = 10;
    const cutout = targetRect
        ? {
            x: Math.max(0, targetRect.left - padding),
            y: Math.max(0, targetRect.top - padding),
            width: Math.min(window.innerWidth, targetRect.width + padding * 2),
            height: targetRect.height + padding * 2,
        }
        : null;

    // Altura segura da Bottom App Bar (TabBar) no mobile com folga para não encobrir controles
    const BOTTOM_NAV_HEIGHT = 88;
    const CARD_ESTIMATED_HEIGHT = 300;

    // Determina a posição do card de dicas: abaixo do recorte ou fixo acima da barra inferior
    const fitsBelow = cutout
        ? cutout.y + cutout.height + CARD_ESTIMATED_HEIGHT < window.innerHeight - BOTTOM_NAV_HEIGHT
        : true;
    const fitsAbove = cutout
        ? cutout.y - CARD_ESTIMATED_HEIGHT > 12
        : false;

    let popoverPositionStyle: React.CSSProperties = {
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
    };

    if (cutout) {
        if (fitsBelow) {
            popoverPositionStyle = {
                position: 'fixed',
                top: Math.min(window.innerHeight - BOTTOM_NAV_HEIGHT - CARD_ESTIMATED_HEIGHT, cutout.y + cutout.height + 16),
                left: '50%',
                transform: 'translateX(-50%)',
            };
        } else if (fitsAbove) {
            popoverPositionStyle = {
                position: 'fixed',
                bottom: Math.max(BOTTOM_NAV_HEIGHT + 12, window.innerHeight - cutout.y + 16),
                left: '50%',
                transform: 'translateX(-50%)',
            };
        } else {
            // Em telas menores, fixa com segurança ACIMA da barra inferior
            popoverPositionStyle = {
                position: 'fixed',
                bottom: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px))`,
                left: '50%',
                transform: 'translateX(-50%)',
            };
        }
    } else {
        popoverPositionStyle = {
            position: 'fixed',
            bottom: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px))`,
            left: '50%',
            transform: 'translateX(-50%)',
        };
    }

    return (
        <div className="fixed inset-0 z-[100] select-none">
            {/* SVG Mask com o recorte da seção ativa */}
            <svg
                className="fixed inset-0 w-full h-full pointer-events-none transition-all duration-300 z-[100]"
                style={{ width: '100vw', height: '100vh' }}
            >
                <defs>
                    <mask id="spotlight-tour-mask">
                        {/* Fundo branco que mantém o overlay visível */}
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {/* Recorte preto com cantos arredondados sobre a seção focada */}
                        {cutout && (
                            <rect
                                x={cutout.x}
                                y={cutout.y}
                                width={cutout.width}
                                height={cutout.height}
                                rx="32"
                                ry="32"
                                fill="black"
                                className="transition-all duration-300 ease-out"
                            />
                        )}
                    </mask>
                </defs>
                {/* Camada semi-translúcida com o recorte aplicado */}
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(5, 8, 16, 0.84)"
                    mask="url(#spotlight-tour-mask)"
                    className="pointer-events-auto cursor-pointer"
                    onClick={onClose}
                />
            </svg>

            {/* Borda luminosa em destaque ao redor do recorte */}
            {cutout && (
                <div
                    style={{
                        top: cutout.y,
                        left: cutout.x,
                        width: cutout.width,
                        height: cutout.height,
                    }}
                    className="fixed rounded-[32px] border-2 border-[#F7931E] pointer-events-none shadow-[0_0_35px_rgba(247,147,30,0.55)] transition-all duration-300 ease-out z-[101] animate-pulse"
                />
            )}

            {/* Balão / Card Flutuante de Dicas Visuais */}
            <div
                style={popoverPositionStyle}
                className="z-[102] w-[calc(100%-2rem)] max-w-lg bg-[#141a2b] border border-[#F7931E]/40 text-white rounded-[2rem] p-5 sm:p-6 shadow-2xl shadow-black/95 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200 max-h-[calc(100vh-110px)] overflow-y-auto"
            >
                {/* Header do Card */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-[#F7931E]/20 flex items-center justify-center text-[#F7931E]">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#F7931E]">
                            Passo {stepIndex + 1} de {totalSteps} • {step.badge}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Pontos de avanço */}
                        <div className="flex items-center gap-1.5 hidden sm:flex">
                            {Array.from({ length: totalSteps }, (_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => onGoToStep(i)}
                                    aria-label={`Ir para passo ${i + 1}`}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                                        i === stepIndex
                                            ? "w-5 bg-[#F7931E]"
                                            : i < stepIndex
                                                ? "w-1.5 bg-slate-600 hover:bg-slate-500"
                                                : "w-1.5 bg-slate-800 hover:bg-slate-700"
                                    )}
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            title="Fechar guia"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Conteúdo: Título e Descrição */}
                <div className="mt-3 space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {step.description}
                    </p>
                </div>

                {/* Dicas de preenchimento */}
                <div className="mt-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#F7931E]">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Dicas práticas para esta seção:</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                        {step.tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 leading-relaxed">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#F7931E] shrink-0 mt-0.5" />
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Controles do Tour */}
                <div className="mt-4 flex items-center justify-between gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer py-2 px-1 font-medium"
                    >
                        Pular tour
                    </button>

                    <div className="flex items-center gap-2">
                        {!isFirst && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onPrev}
                                className="border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl h-9 px-3.5 text-xs"
                            >
                                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                                Anterior
                            </Button>
                        )}

                        <Button
                            type="button"
                            size="sm"
                            onClick={onNext}
                            className="bg-[#F7931E] text-slate-950 font-bold hover:bg-[#F7931E]/90 rounded-xl h-9 px-4 text-xs shadow-lg shadow-[#F7931E]/20"
                        >
                            <span>{isLast ? 'Concluir Guia' : 'Próxima Seção'}</span>
                            {!isLast && <ChevronRight className="w-3.5 h-3.5 ml-1" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
