import { useEffect, useMemo, useState, useRef, useLayoutEffect } from 'react';
import { usePortfolioController } from '../hooks/usePortfolioController';
import { useAccountController } from '@/features/settings/hooks/useAccountController';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { processAndCompressImage, getImageUrl } from "@/lib/image-utils";
import {
    ExternalLink,
    Plus,
    FileText,
    Phone,
    Images,
    Settings,
    MapPin,
    Camera,
    Check,
    Circle,
    Trash2,
    AlertCircle,
    Sparkles,
    HelpCircle,
    MessageSquare,
    Star
} from 'lucide-react';
import { usePortfolioTour } from '../hooks/usePortfolioTour';
import { PortfolioSpotlightTour } from '../components/PortfolioSpotlightTour';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type SectionStatus = "complete" | "pending";

const DAYS_MAP = [
    { id: "2", name: "Segunda" },
    { id: "3", name: "Terça" },
    { id: "4", name: "Quarta" },
    { id: "5", name: "Quinta" },
    { id: "6", name: "Sexta" },
    { id: "7", name: "Sábado" },
    { id: "1", name: "Domingo" },
];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

function ScheduleItemEditor({
    day,
    data,
    onUpdate
}: {
    day: { id: string, name: string },
    data?: { aberto: boolean, inicio: string, fim: string },
    onUpdate: (data: { aberto: boolean, inicio: string, fim: string }) => void
}) {
    const aberto = data?.aberto ?? false;
    const inicio = data?.inicio ?? "09:00";
    const fim = data?.fim ?? "18:00";

    return (
        <div className={cn(
            "flex flex-col gap-3 p-4 rounded-2xl transition-all duration-300",
            aberto ? "bg-blue-50/60 border border-blue-200/70 shadow-xs" : "bg-transparent border border-transparent"
        )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        onClick={() => onUpdate({ aberto: !aberto, inicio, fim })}
                        className={cn(
                            "w-12 h-6 rounded-full relative transition-all duration-300 cursor-pointer p-1",
                            aberto ? "bg-[#2563eb]" : "bg-slate-300"
                        )}
                    >
                        <div className={cn(
                            "w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
                            aberto ? "ml-6" : "ml-0"
                        )} />
                    </div>
                    <span className={cn(
                        "text-sm font-bold tracking-tight transition-colors",
                        aberto ? "text-slate-900" : "text-slate-500"
                    )}>
                        {day.name}
                    </span>
                </div>
                {!aberto && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
                        Fechado
                    </span>
                )}
            </div>

            {aberto && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2.5 gap-2 group focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-blue-500/15 transition-all shadow-2xs">
                        <div className="flex flex-col w-full">
                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Início</span>
                            <select
                                value={inicio}
                                onChange={(e) => onUpdate({ aberto, inicio: e.target.value, fim })}
                                className="bg-transparent text-sm font-bold text-slate-800 outline-none appearance-none cursor-pointer w-full"
                            >
                                {HOUR_OPTIONS.map(h => <option key={h} value={h} className="bg-white text-slate-800">{h}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="text-[#2563eb] font-black text-xs px-1">—</div>

                    <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2.5 gap-2 group focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-blue-500/15 transition-all shadow-2xs">
                        <div className="flex flex-col w-full">
                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Fim</span>
                            <select
                                value={fim}
                                onChange={(e) => onUpdate({ aberto, inicio, fim: e.target.value })}
                                className="bg-transparent text-sm font-bold text-slate-800 outline-none appearance-none cursor-pointer w-full"
                            >
                                {HOUR_OPTIONS.map(h => <option key={h} value={h} className="bg-white text-slate-800">{h}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SectionStatusIcon({ status }: { status: SectionStatus }) {
    if (status === "complete") {
        return <Check className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />;
    }
    return <Circle className="h-4 w-4 text-slate-300" strokeWidth={2} />;
}

function EditableField({
    label,
    value,
    onSave,
    multiline = false,
    numericOnly = false,
    isSlug = false,
    maxLength,
    theme = "light",
    error
}: {
    label: string;
    value: string | undefined;
    onSave: (val: string) => void;
    multiline?: boolean;
    numericOnly?: boolean;
    isSlug?: boolean;
    maxLength?: number;
    theme?: "light" | "dark";
    error?: string | null;
}) {
    const [localValue, setLocalValue] = useState(value || '');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    useLayoutEffect(() => {
        if (multiline && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [localValue, multiline]);

    const handleBlur = () => {
        if (localValue !== (value || '')) {
            onSave(localValue);
        }
    };

    const isDark = theme === "dark";

    return (
        <div className="mb-3.5 last:mb-0">
            <div className="flex justify-between items-center mb-1">
                <p className={cn(
                    "text-xs uppercase tracking-wide font-semibold",
                    isDark ? "text-white/70" : "text-slate-500"
                )}>
                    {label}
                </p>
                {maxLength && (
                    <span className={cn(
                        "text-[10px] font-medium",
                        isDark ? "text-white/60" : "text-slate-400"
                    )}>
                        {Math.max(0, maxLength - localValue.length)} restantes
                    </span>
                )}
            </div>
            {multiline ? (
                <textarea
                    ref={textareaRef}
                    value={localValue}
                    maxLength={maxLength}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={handleBlur}
                    className={cn(
                        "w-full bg-transparent border-none p-0 text-sm font-medium focus:outline-none focus:border-b-2 focus:border-[#2563eb] transition-none resize-none overflow-hidden",
                        isDark ? "text-white placeholder:text-white/40" : "text-slate-900 placeholder:text-slate-400",
                        error && "text-red-500"
                    )}
                />
            ) : (
                <Input
                    inputMode={numericOnly ? "numeric" : undefined}
                    value={localValue}
                    maxLength={maxLength}
                    onChange={(e) => {
                        let val = e.target.value;
                        if (numericOnly) val = val.replace(/\D/g, '');
                        if (isSlug) val = val.toLowerCase().replace(/[^a-z0-9]/g, '');
                        setLocalValue(val);
                    }}
                    onBlur={handleBlur}
                    className={cn(
                        "bg-transparent border-none p-0 h-auto text-sm font-semibold focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-[#2563eb] rounded-none transition-none shadow-none",
                        isDark ? "text-white placeholder:text-white/40" : "text-slate-900 placeholder:text-slate-400",
                        error && "text-red-500 border-b-2 border-red-500"
                    )}
                />
            )}
            {error && (
                <p className="text-[10px] text-red-500 font-bold mt-1 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
}

function EditableSelect({
    label,
    value,
    options,
    onSave,
    theme = "light",
    error
}: {
    label: string;
    value: string | number | undefined;
    options: Array<{ id: string | number, name: string }>;
    onSave: (val: string) => void;
    theme?: "light" | "dark";
    error?: string | null;
}) {
    const [localValue, setLocalValue] = useState(value || '');

    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setLocalValue(val);
        onSave(val);
    };

    const isDark = theme === "dark";

    return (
        <div className="mb-3.5 last:mb-0">
            <div className="flex justify-between items-center mb-1">
                <p className={cn(
                    "text-xs uppercase tracking-wide font-semibold",
                    isDark ? "text-white/70" : "text-slate-500"
                )}>
                    {label}
                </p>
            </div>
            <div className="relative">
                <select
                    value={localValue}
                    onChange={handleChange}
                    className={cn(
                        "w-full bg-transparent border-none p-0 h-auto text-sm font-semibold focus:outline-none focus:border-b-2 focus:border-[#2563eb] rounded-none transition-none shadow-none appearance-none cursor-pointer",
                        isDark ? "text-white" : "text-slate-900",
                        error && "text-red-500 border-b-2 border-red-500"
                    )}
                >
                    <option value="" disabled className={isDark ? "bg-slate-800" : "bg-white"}>Selecione uma categoria</option>
                    {options.map(opt => (
                        <option key={opt.id} value={opt.id} className={isDark ? "bg-slate-800 text-white" : "bg-white text-slate-900"}>
                            {opt.name}
                        </option>
                    ))}
                </select>
            </div>
            {error && (
                <p className="text-[10px] text-red-500 font-bold mt-1 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
}

function ProgressRing({ progress, size = 112, strokeWidth = 6 }: { progress: number, size?: number, strokeWidth?: number }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-slate-200/60"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 0.5s ease' }}
                    strokeLinecap="round"
                    className="text-[#2563eb]"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[2.2rem]">
                {/* Content (avatar) is rendered outside via absolute positioning */}
            </div>
        </div>
    );
}

export function PortfolioPage() {
    const {
        data: portfolio,
        depoimentos,
        isLoading: loadingPortfolio,
        isLoadingDepoimentos,
        loadData: loadPortfolio,
        loadDepoimentos,
        handleUpdateBasico: updatePortfolioBasico,
        handleUpload: uploadFile,
        handleDeleteFoto,
        handleAprovarDepoimento
    } = usePortfolioController();

    const {
        data: account,
        categorias,
        isLoading: loadingAccount,
        loadData: loadAccount,
        handleUpdateBasico,
        handleUpdateContato: updateAccountContato,
        handleUpdateEndereco,
        handleUpdateConfiguracoesAvancadas: updateAccountConfiguracoesAvancadas,
        fetchAddress
    } = useAccountController();

    const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);
    const [cepError, setCepError] = useState<{ title: string, message: string } | null>(null);
    const [activeAccordion, setActiveAccordion] = useState<string | undefined>("apresentacao");
    const [userId] = useState<string | null>(() => localStorage.getItem("id_loja") || localStorage.getItem("id"));
    const [slugError, setSlugError] = useState<string | null>(null);

    const {
        isOpen: isTourOpen,
        currentStep: tourStep,
        currentStepIndex: tourStepIndex,
        totalSteps: tourTotalSteps,
        openTour,
        openTourForSection,
        closeTour,
        nextStep: tourNextStep,
        prevStep: tourPrevStep,
        goToStep: tourGoToStep,
    } = usePortfolioTour(userId, loadingPortfolio || loadingAccount);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'bio' | 'gallery' | 'capa') => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            // Reduzido para 800px para o avatar ser mais leve e evitar limites de upload do servidor
            const maxDim = type === 'avatar' ? 800 : 1920;
            const base64String = await processAndCompressImage(file, maxDim);
            const idSite = portfolio?.id_site || 0;
            
            // Sanitiza o nome do arquivo para evitar problemas com espaços e caracteres especiais em URLs
            const sanitizedName = file.name.replace(/\s+/g, '_');
            
            await uploadFile(type, sanitizedName, base64String, idSite);
        } catch (error: any) {
            console.error('Erro ao processar/enviar imagem:', error);
            const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            alert(`Não foi possível enviar essa imagem: ${errorMessage}`);
        } finally {
            event.target.value = '';
        }
    };

    useEffect(() => {
        loadAccount();
        loadPortfolio();
        loadDepoimentos();
    }, [loadAccount, loadPortfolio, loadDepoimentos]);

    const statusApresentacao = useMemo((): SectionStatus => {
        const isComplete = !!(portfolio?.titulo && portfolio?.subtitulo && portfolio?.bio);
        return isComplete ? "complete" : "pending";
    }, [portfolio]);

    const statusContato = useMemo((): SectionStatus => {
        const isComplete = !!(account?.telefone && account?.email && account?.insta);
        return isComplete ? "complete" : "pending";
    }, [account]);

    const statusLocalizacao = useMemo((): SectionStatus => {
        const isComplete = !!(account?.cep && account?.endereco && account?.numero && account?.bairro && account?.cidade && account?.estado);
        return isComplete ? "complete" : "pending";
    }, [account]);

    const statusTrabalhos = useMemo((): SectionStatus => {
        const isComplete = (portfolio?.itens?.length || 0) >= 4;
        return isComplete ? "complete" : "pending";
    }, [portfolio]);

    const statusIdentidade = useMemo((): SectionStatus => {
        const isComplete = !!(portfolio?.avatar && portfolio?.foto_capa);
        return isComplete ? "complete" : "pending";
    }, [portfolio]);

    const progressPercent = useMemo(() => {
        let completed = 0;
        if (statusIdentidade === "complete") completed++;
        if (statusApresentacao === "complete") completed++;
        if (statusContato === "complete") completed++;
        if (statusLocalizacao === "complete") completed++;
        if (statusTrabalhos === "complete") completed++;
        return Math.round((completed / 5) * 100);
    }, [statusIdentidade, statusApresentacao, statusContato, statusLocalizacao, statusTrabalhos]);

    const isFullyComplete =
        statusApresentacao === "complete" &&
        statusContato === "complete" &&
        statusLocalizacao === "complete" &&
        statusTrabalhos === "complete";

    if (loadingPortfolio || loadingAccount) {
        return (
            <div className="flex items-center justify-center p-8 min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563eb]"></div>
            </div>
        );
    }

    return (
        <div className="text-slate-900 pb-20">
            <div className="p-6 space-y-6 max-w-2xl mx-auto">

                {/* 1. Card de identidade + progresso */}
                <Card id="section-identidade" className="relative p-6 md:p-8 bg-white border border-slate-200/80 rounded-[2.5rem] flex flex-row items-center gap-6 overflow-hidden group min-h-[220px] text-slate-900 shadow-xs hover:border-blue-200/80 transition-all duration-300">
                    {/* Imagem de Capa e Gradiente */}
                    <div className="absolute inset-0 z-0">
                        {portfolio?.foto_capa ? (
                            <img
                                src={getImageUrl(portfolio.foto_capa)}
                                alt="Capa"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-50" />
                        )}
                        {/* Overlay claro para contraste visual ótimo sobre foto */}
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]" />
                    </div>

                    {/* Botão Guia "Como preencher" no canto superior direito do card */}
                    <button
                        type="button"
                        onClick={() => openTour(0)}
                        className="absolute top-6 right-6 z-20 flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white/80 hover:bg-white border border-slate-200 hover:border-[#2563eb] rounded-full px-3.5 py-1.5 backdrop-blur-md transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                        title="Ver assistente visual de como preencher cada seção"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" />
                        <span>Como preencher</span>
                    </button>

                    {/* Botão de upload da capa */}
                    <label className="absolute bottom-6 right-6 flex items-center justify-center w-10 h-10 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full cursor-pointer shadow-lg z-20 hover:scale-110 transition-all active:scale-95">
                        <Camera className="h-5 w-5 text-white" />
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'capa')}
                        />
                    </label>

                    <div className="relative z-10 shrink-0">
                        <div className="absolute inset-[5px] rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-sm">
                            {portfolio?.avatar ? (
                                <img
                                    src={getImageUrl(portfolio.avatar)}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                    <span className="text-[#2563eb] text-3xl font-bold">{account?.nome?.charAt(0)}</span>
                                </div>
                            )}
                        </div>
                        <div className="relative pointer-events-none">
                            <ProgressRing progress={progressPercent} size={130} strokeWidth={3} />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-white p-1 rounded-full z-10 shadow-sm">
                            <label className="flex items-center justify-center w-9 h-9 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full cursor-pointer shadow-lg hover:scale-110 transition-all active:scale-95">
                                <Camera className="h-4 w-4 text-white" />
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'avatar')}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="relative z-10 flex-1 flex flex-col justify-center text-left w-full overflow-hidden py-2">
                        <EditableField
                            label="Nome"
                            value={account?.nome}
                            maxLength={100}
                            onSave={(val) => handleUpdateBasico({ 
                                nome: val, 
                                apelido: account?.slug, 
                                id_categoria: account?.id_categoria ?? account?.categoria_id 
                            })}
                        />
                        <EditableField
                            label="Apelido"
                            value={account?.slug}
                            maxLength={100}
                            isSlug
                            error={slugError}
                            onSave={async (val) => {
                                setSlugError(null);
                                const result = await handleUpdateBasico({ 
                                    nome: account?.nome, 
                                    apelido: val, 
                                    id_categoria: account?.id_categoria ?? account?.categoria_id 
                                });
                                if (result && !result.success && result.status === 409) {
                                    setSlugError("Este nome de usuário não está disponível");
                                }
                            }}
                        />
                        <EditableSelect
                            label="Categoria"
                            value={account?.id_categoria ?? account?.categoria_id}
                            options={categorias.map(c => ({ id: c.categoria_id, name: c.categoria_nome }))}
                            onSave={(val) => handleUpdateBasico({ nome: account?.nome, apelido: account?.slug, id_categoria: parseInt(val) })}
                        />
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Perfil</span>
                            <div className="bg-blue-50 border border-blue-100 text-[#2563eb] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tight">
                                {progressPercent}%
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 2. Cards expansíveis */}
                <Accordion
                    type="single"
                    collapsible
                    value={activeAccordion}
                    onValueChange={(val) => setActiveAccordion(val)}
                    className="w-full space-y-3"
                >
                    <AccordionItem id="section-apresentacao" value="apresentacao" className="rounded-3xl border border-slate-200/80 bg-white px-6 overflow-hidden shadow-xs hover:border-blue-200/80 transition-colors">
                        <AccordionTrigger className="py-5 hover:no-underline [&>svg]:text-slate-400">
                            <div className="flex flex-1 items-center gap-4 pr-2">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-[#2563eb]" strokeWidth={2} />
                                </div>
                                <span className="flex-1 text-left text-lg font-bold text-slate-900">Apresentação</span>
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openTourForSection('apresentacao');
                                    }}
                                    className="p-1.5 rounded-full text-slate-400 hover:text-[#2563eb] hover:bg-blue-50 transition-colors cursor-pointer"
                                    title="Como preencher Apresentação"
                                >
                                    <HelpCircle className="w-4 h-4" />
                                </span>
                                <SectionStatusIcon status={statusApresentacao} />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 pt-2 border-t border-slate-100">
                            <div className="space-y-6 pt-4">
                                <div className="flex flex-col items-center space-y-4 mb-6">
                                    <div className="relative group">
                                        <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-inner">
                                            {portfolio?.foto_bio ? (
                                                <img src={getImageUrl(portfolio.foto_bio)} alt="Foto da Bio" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                                    <Camera className="h-8 w-8 text-slate-400" />
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 p-2 bg-[#2563eb] hover:bg-[#1d4ed8] rounded-full cursor-pointer shadow-md hover:scale-110 transition-all active:scale-95 text-white">
                                            <Camera className="h-4 w-4 text-white" />
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'bio')} />
                                        </label>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-slate-900">Foto da biografia</p>
                                        <p className="text-xs text-slate-500 max-w-[240px] mt-1 leading-relaxed">
                                            Esta foto aparece na seção "Sobre" da sua página, dando um toque pessoal para seus clientes.
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <EditableField label="Título" value={portfolio?.titulo} maxLength={100} onSave={(val) => updatePortfolioBasico({ titulo: val, subtitulo: portfolio?.subtitulo, bio: portfolio?.bio })} />
                                    <EditableField label="Subtítulo" value={portfolio?.subtitulo} maxLength={500} onSave={(val) => updatePortfolioBasico({ titulo: portfolio?.titulo, subtitulo: val, bio: portfolio?.bio })} />
                                    <EditableField label="Bio" value={portfolio?.bio} multiline onSave={(val) => updatePortfolioBasico({ titulo: portfolio?.titulo, subtitulo: portfolio?.subtitulo, bio: val })} />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem id="section-contato" value="contato" className="rounded-3xl border border-slate-200/80 bg-white px-6 overflow-hidden shadow-xs hover:border-blue-200/80 transition-colors">
                        <AccordionTrigger className="py-5 hover:no-underline [&>svg]:text-slate-400">
                            <div className="flex flex-1 items-center gap-4 pr-2">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                    <Phone className="h-5 w-5 text-[#2563eb]" strokeWidth={2} />
                                </div>
                                <span className="flex-1 text-left text-lg font-bold text-slate-900">Contato</span>
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openTourForSection('contato');
                                    }}
                                    className="p-1.5 rounded-full text-slate-400 hover:text-[#2563eb] hover:bg-blue-50 transition-colors cursor-pointer"
                                    title="Como preencher Contato"
                                >
                                    <HelpCircle className="w-4 h-4" />
                                </span>
                                <SectionStatusIcon status={statusContato} />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 pt-2 border-t border-slate-100">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <EditableField label="Telefone" value={account?.telefone} numericOnly onSave={(val) => updateAccountContato({ telefone: val, email: account?.email, instagram: account?.insta })} />
                                <EditableField label="Email" value={account?.email} onSave={(val) => updateAccountContato({ telefone: account?.telefone, email: val, instagram: account?.insta })} />
                                <EditableField label="Instagram" value={account?.insta} onSave={(val) => updateAccountContato({ telefone: account?.telefone, email: account?.email, instagram: val })} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem id="section-localizacao" value="localizacao" className="rounded-3xl border border-slate-200/80 bg-white px-6 overflow-hidden shadow-xs hover:border-blue-200/80 transition-colors">
                        <AccordionTrigger className="py-5 hover:no-underline [&>svg]:text-slate-400">
                            <div className="flex flex-1 items-center gap-4 pr-2">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-[#2563eb]" strokeWidth={2} />
                                </div>
                                <span className="flex-1 text-left text-lg font-bold text-slate-900">Endereço e Localização</span>
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openTourForSection('localizacao');
                                    }}
                                    className="p-1.5 rounded-full text-slate-400 hover:text-[#2563eb] hover:bg-blue-50 transition-colors cursor-pointer"
                                    title="Como preencher Endereço e Localização"
                                >
                                    <HelpCircle className="w-4 h-4" />
                                </span>
                                <SectionStatusIcon status={statusLocalizacao} />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 pt-2 border-t border-slate-100">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <EditableField label="CEP" value={account?.cep} numericOnly onSave={async (val) => {
                                    const cleanCep = val.replace(/\D/g, '');
                                    if (cleanCep.length === 8) {
                                        const address = await fetchAddress(cleanCep);
                                        if (address) {
                                            handleUpdateEndereco({
                                                cep: cleanCep,
                                                endereco: address.street || account?.endereco,
                                                bairro: address.neighborhood || account?.bairro,
                                                cidade: address.city || account?.cidade,
                                                estado: address.state || account?.estado
                                            });
                                        }
                                    }
                                }} />
                                <EditableField label="Endereço" value={account?.endereco} onSave={(val) => handleUpdateEndereco({ endereco: val })} />
                                <EditableField label="Número" value={account?.numero} onSave={(val) => handleUpdateEndereco({ numero: val })} />
                                <EditableField label="Complemento" value={account?.complemento} onSave={(val) => handleUpdateEndereco({ complemento: val })} />
                                <EditableField label="Bairro" value={account?.bairro} onSave={(val) => handleUpdateEndereco({ bairro: val })} />
                                <EditableField label="Cidade" value={account?.cidade} onSave={(val) => handleUpdateEndereco({ cidade: val })} />
                                <EditableField label="Estado" value={account?.estado} onSave={(val) => handleUpdateEndereco({ estado: val })} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem id="section-trabalhos" value="trabalhos" className="rounded-3xl border border-slate-200/80 bg-white px-6 overflow-hidden shadow-xs hover:border-blue-200/80 transition-colors">
                        <AccordionTrigger className="py-5 hover:no-underline [&>svg]:text-slate-400">
                            <div className="flex flex-1 items-center gap-4 pr-2">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                    <Images className="h-5 w-5 text-[#2563eb]" strokeWidth={2} />
                                </div>
                                <div className="flex-1 flex flex-col items-start">
                                    <span className="text-lg font-bold text-slate-900">Trabalhos</span>
                                    <span className={cn(
                                        "text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border",
                                        statusTrabalhos === "complete" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-[#2563eb] border-blue-200/70"
                                    )}>
                                        {portfolio?.itens?.length || 0} / 4 fotos
                                    </span>
                                </div>
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openTourForSection('trabalhos');
                                    }}
                                    className="p-1.5 rounded-full text-slate-400 hover:text-[#2563eb] hover:bg-blue-50 transition-colors cursor-pointer"
                                    title="Como preencher Trabalhos"
                                >
                                    <HelpCircle className="w-4 h-4" />
                                </span>
                                <SectionStatusIcon status={statusTrabalhos} />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 pt-2 border-t border-slate-100">
                            <div className="grid grid-cols-3 gap-3 pt-4">
                                {portfolio?.itens?.map((item) => (
                                    <div key={item.id_foto} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group relative shadow-2xs">
                                        <img src={getImageUrl(item.url_foto)} alt="Portfolio" className="w-full h-full object-cover" />
                                        <Button variant="secondary" size="icon" className="absolute bottom-2 left-2 h-7 w-7 rounded-full shadow-md bg-slate-900/80 hover:bg-red-600 text-white border-none cursor-pointer transition-colors" onClick={() => setPhotoToDelete(item.id_foto)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                ))}
                                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-[#2563eb] hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer transition-all shadow-2xs">
                                    <Plus className="w-6 h-6" />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'gallery')} />
                                </label>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem id="section-depoimentos" value="depoimentos" className="rounded-3xl border border-slate-200/80 bg-white px-6 overflow-hidden shadow-xs hover:border-blue-200/80 transition-colors">
                        <AccordionTrigger className="py-5 hover:no-underline [&>svg]:text-slate-400">
                            <div className="flex flex-1 items-center gap-4 pr-2">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                    <MessageSquare className="h-5 w-5 text-[#2563eb]" strokeWidth={2} />
                                </div>
                                <div className="flex-1 flex flex-col items-start">
                                    <span className="text-lg font-bold text-slate-900">Depoimentos</span>
                                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border bg-blue-50 text-[#2563eb] border-blue-200/70">
                                        {depoimentos.length} novos
                                    </span>
                                </div>
                                <SectionStatusIcon status={depoimentos.length > 0 ? "pending" : "complete"} />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 pt-2 border-t border-slate-100">
                            <div className="pt-4">
                                {isLoadingDepoimentos ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563eb]"></div>
                                    </div>
                                ) : depoimentos.length > 0 ? (
                                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                                        {depoimentos.map((depoimento) => (
                                            <div key={depoimento.id} className="min-w-[280px] max-w-[280px] bg-slate-50 rounded-2xl p-4 border border-slate-200 snap-center shadow-sm">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border border-white shadow-xs">
                                                        {depoimento.foto_url ? (
                                                            <img src={getImageUrl(depoimento.foto_url)} alt={depoimento.nome} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-xs">
                                                                {depoimento.nome.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 line-clamp-1">{depoimento.nome}</p>
                                                        <div className="flex gap-0.5">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star key={i} className={cn("w-3 h-3", i < depoimento.nota ? "fill-yellow-400 text-yellow-400" : "text-slate-300")} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-600 line-clamp-3 italic mb-2">"{depoimento.texto}"</p>
                                                <div className="flex items-center justify-between mt-auto">
                                                    <p className="text-[10px] text-slate-400 font-medium">{depoimento.data}</p>
                                                    <Button
                                                        size="sm"
                                                        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl shadow-sm"
                                                        onClick={() => handleAprovarDepoimento(depoimento.id)}
                                                        disabled={isLoadingDepoimentos}
                                                    >
                                                        {isLoadingDepoimentos ? "Aprovando..." : "Aprovar"}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 px-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                                            <MessageSquare className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-500">Nenhum depoimento pendente no momento.</p>
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem id="section-config" value="config" className="rounded-3xl border border-slate-200/80 bg-white px-6 overflow-hidden shadow-xs hover:border-blue-200/80 transition-colors">
                        <AccordionTrigger className="py-5 hover:no-underline [&>svg]:text-slate-400">
                            <div className="flex flex-1 items-center gap-4 pr-2">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                    <Settings className="h-5 w-5 text-[#2563eb]" strokeWidth={2} />
                                </div>
                                <span className="flex-1 text-left text-lg font-bold text-slate-900">Configurações Avançadas</span>
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openTourForSection('config');
                                    }}
                                    className="p-1.5 rounded-full text-slate-400 hover:text-[#2563eb] hover:bg-blue-50 transition-colors cursor-pointer"
                                    title="Como preencher Configurações Avançadas"
                                >
                                    <HelpCircle className="w-4 h-4" />
                                </span>
                                <SectionStatusIcon status="complete" />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 pt-2 border-t border-slate-100">
                            <div className="space-y-6 pt-4">
                                <div className="space-y-4">
                                    <EditableField label="Google Analytics ID" value={account?.g_analytcs} onSave={(val) => updateAccountConfiguracoesAvancadas({ g_analytcs: val, meta_pixel_id: account?.meta_pixel_id || account?.meta_pixel, conta_google_ads: account?.conta_google_ads, horario: account?.horario })} />
                                    <EditableField label="Meta Pixel ID" value={account?.meta_pixel_id || account?.meta_pixel} onSave={(val) => updateAccountConfiguracoesAvancadas({ g_analytcs: account?.g_analytcs, meta_pixel_id: val, conta_google_ads: account?.conta_google_ads, horario: account?.horario })} />
                                    <EditableField label="Conta Google Ads" value={account?.conta_google_ads} onSave={(val) => updateAccountConfiguracoesAvancadas({ g_analytcs: account?.g_analytcs, meta_pixel_id: account?.meta_pixel_id || account?.meta_pixel, conta_google_ads: val, horario: account?.horario })} />
                                </div>
                                <div className="pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-1.5 h-4 bg-[#2563eb] rounded-full" />
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Horários de Funcionamento</h4>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {DAYS_MAP.map((day) => (
                                            <ScheduleItemEditor key={day.id} day={day} data={account?.horario?.[day.id]} onUpdate={(dayData) => {
                                                const newHorario = { ...(account?.horario || {}), [day.id]: dayData };
                                                updateAccountConfiguracoesAvancadas({ g_analytcs: account?.g_analytcs, meta_pixel_id: account?.meta_pixel_id || account?.meta_pixel, conta_google_ads: account?.conta_google_ads, horario: newHorario });
                                            }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* Botão Ver página pública - Sticky acima da TabBar */}
                <div className="sticky bottom-4 mt-8 px-2 z-10">
                    <Button
                        disabled={!isFullyComplete}
                        onClick={() => window.open(`https://${account?.slug}.guiatour.online`, '_blank')}
                        className={cn(
                            "w-full h-[56px] rounded-2xl font-bold text-base transition-all shadow-xl",
                            isFullyComplete
                                ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-blue-500/25 cursor-pointer"
                                : "bg-slate-200 text-slate-400 opacity-70 cursor-not-allowed border-none shadow-none"
                        )}
                    >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Ver página pública
                    </Button>
                </div>
            </div>

            {/* Dialogs */}
            <Dialog open={photoToDelete !== null} onOpenChange={(open) => !open && setPhotoToDelete(null)}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 rounded-[2rem] shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900 text-xl font-bold">Excluir foto</DialogTitle>
                        <DialogDescription className="text-slate-500">Tem certeza que deseja excluir esta foto do seu portfólio? Esta ação não pode ser desfeita.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="border-t border-slate-100 pt-4 flex flex-row gap-3">
                        <Button variant="ghost" className="flex-1 text-slate-600 hover:bg-slate-100" onClick={() => setPhotoToDelete(null)}>Cancelar</Button>
                        <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold" onClick={async () => { if (photoToDelete !== null) { await handleDeleteFoto(photoToDelete); setPhotoToDelete(null); } }}>Excluir</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={cepError !== null} onOpenChange={(open) => !open && setCepError(null)}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 rounded-[2rem] shadow-2xl">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center"><AlertCircle className="h-6 w-6 text-red-500" /></div>
                            <DialogTitle className="text-red-500 text-xl font-bold">{cepError?.title}</DialogTitle>
                        </div>
                        <DialogDescription className="text-slate-500 text-base">{cepError?.message}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="border-t border-slate-100 pt-4"><Button className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold h-12 rounded-xl shadow-md shadow-blue-500/20" onClick={() => setCepError(null)}>Entendi</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assistente Visual de Preenchimento (Camada Semi-Translúcida com Recorte Spotlight) */}
            <PortfolioSpotlightTour
                open={isTourOpen}
                onClose={closeTour}
                step={tourStep}
                stepIndex={tourStepIndex}
                totalSteps={tourTotalSteps}
                onNext={tourNextStep}
                onPrev={tourPrevStep}
                onGoToStep={tourGoToStep}
                onOpenAccordion={(val) => setActiveAccordion(val)}
            />
        </div>
    );
}
