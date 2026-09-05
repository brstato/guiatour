import { useEffect, useMemo, useState, useRef, useLayoutEffect } from 'react';
import { usePortfolioController } from '../hooks/usePortfolioController';
import { useAccountController } from '@/features/settings/hooks/useAccountController';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    AlertCircle
} from 'lucide-react';
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

function SectionStatusIcon({ status }: { status: SectionStatus }) {
    if (status === "complete") {
        return <Check className="h-4 w-4 text-[#4ADE80]" strokeWidth={2.5} />;
    }
    return <Circle className="h-4 w-4 text-[#8a94a6]" strokeWidth={2} />;
}

function EditableField({
    label,
    value,
    onSave,
    multiline = false,
    numericOnly = false
}: {
    label: string;
    value: string | undefined;
    onSave: (val: string) => void;
    multiline?: boolean;
    numericOnly?: boolean;
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

    return (
        <div className="mb-3.5 last:mb-0">
            <p className="mb-1 text-xs uppercase tracking-wide text-[#8a94a6]">
                {label}
            </p>
            {multiline ? (
                <textarea
                    ref={textareaRef}
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={handleBlur}
                    className="w-full bg-transparent border-none p-0 text-sm font-medium text-white focus:outline-none focus:border-b focus:border-[#F7931E] transition-none resize-none overflow-hidden"
                />
            ) : (
                <Input
                    inputMode={numericOnly ? "numeric" : undefined}
                    value={localValue}
                    onChange={(e) => {
                        let val = e.target.value;
                        if (numericOnly) val = val.replace(/\D/g, '');
                        setLocalValue(val);
                    }}
                    onBlur={handleBlur}
                    className="bg-transparent border-none p-0 h-auto text-sm font-medium text-white focus-visible:ring-0 focus-visible:border-b focus-visible:border-[#F7931E] rounded-none transition-none"
                />
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
                    className="text-slate-800"
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
                    className="text-slate-700/50"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[2.2rem]">
                {/* Content goes here (avatar) */}
            </div>
        </div>
    );
}

export function PortfolioPage() {
    const {
        data: portfolio,
        isLoading: loadingPortfolio,
        loadData: loadPortfolio,
        handleUpdate: updatePortfolio,
        handleUpdateBasico: updatePortfolioBasico,
        handleUpload: uploadFile,
        handleDeleteFoto
    } = usePortfolioController();

    const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);
    const [cepError, setCepError] = useState<{ title: string, message: string } | null>(null);

    const {
        data: account,
        isLoading: loadingAccount,
        loadData: loadAccount,
        handleUpdate: updateAccount,
        handleUpdateBasico,
        handleUpdateContato: updateAccountContato,
        handleUpdateEndereco,
        handleUpdateConfiguracoesAvancadas: updateAccountConfiguracoesAvancadas,
        fetchAddress
    } = useAccountController();

    const getImageUrl = (url: string | undefined) => {
        if (!url) return "";
        if (url.startsWith('data:') || url.startsWith('http')) return url;
        // Se a URL começar com /imagens ou algo similar, apontamos para o domínio do APP
        return `https://app.inkers.com.br${url}`;
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'bio' | 'gallery' | 'capa') => {
        const file = event.target.files?.[0];
        if (!file || !portfolio?.id_site) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            await uploadFile(type, file.name, base64String, portfolio.id_site);
            // Reset input value to allow selecting the same file again
            event.target.value = '';
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        const id = localStorage.getItem("id");
        if (id) {
            loadAccount(id);
            loadPortfolio(id);
        }
    }, [loadAccount, loadPortfolio]);

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
            <div className="flex items-center justify-center p-8 min-h-screen bg-[#0f1420]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F7931E]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1420] text-white pb-32">
            <div className="p-6 md:p-10 space-y-6 max-w-2xl mx-auto">

                {/* 1. Card de identidade + progresso */}
                <Card className="relative p-6 md:p-8 bg-[#141a2b] border-none rounded-[2.5rem] flex flex-row items-center gap-6 overflow-hidden group">
                    {/* Imagem de Capa e Gradiente */}
                    <div className="absolute inset-0 z-0">
                        {portfolio?.foto_capa ? (
                            <img
                                src={getImageUrl(portfolio.foto_capa)}
                                alt="Capa"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-800/20" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#141a2b] via-[#141a2b]/80 to-transparent" />
                    </div>

                    {/* Botão de upload da capa */}
                    <label className="absolute bottom-4 right-4 flex items-center justify-center p-2 bg-[#F7931E] rounded-full cursor-pointer shadow-lg z-20 hover:scale-110 transition-transform">
                        <Camera className="h-4 w-4 text-slate-950" />
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'capa')}
                        />
                    </label>

                    <div className="relative z-10 shrink-0">
                        <div className="absolute inset-[6px] rounded-full overflow-hidden bg-slate-800">
                            {portfolio?.avatar ? (
                                <img
                                    src={getImageUrl(portfolio.avatar)}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-orange-500/10">
                                    <span className="text-[#F7931E] text-3xl font-bold">{account?.nome?.charAt(0)}</span>
                                </div>
                            )}
                        </div>
                        <div className="relative pointer-events-none">
                            <ProgressRing progress={progressPercent} size={120} strokeWidth={2.5} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-[#141a2b] p-1 rounded-full z-10">
                            <label className="flex p-1.5 bg-[#F7931E] rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                <Camera className="h-4 w-4 text-slate-950" />
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'avatar')}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="relative z-10 flex-1 flex flex-col justify-center text-left w-full overflow-hidden">
                        <EditableField
                            label="Nome"
                            value={account?.nome}
                            onSave={(val) => handleUpdateBasico({ nome: val, apelido: account?.slug })}
                        />
                        <EditableField
                            label="Apelido"
                            value={account?.slug}
                            onSave={(val) => handleUpdateBasico({ nome: account?.nome, apelido: val })}
                        />
                        <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wide text-[#8a94a6] font-medium">Perfil</span>
                            <div className="bg-[#F7931E]/10 text-[#F7931E] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {progressPercent}% Completo
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 2. Cards expansíveis */}
                <Accordion type="single" collapsible defaultValue="apresentacao" className="w-full space-y-3">

                    {/* Apresentação */}
                    <AccordionItem
                        value="apresentacao"
                        className="rounded-3xl border-none bg-[#141a2b] px-6 overflow-hidden"
                    >
                        <AccordionTrigger className="py-5 hover:no-underline [&>svg]:text-[#8a94a6]">
                            <div className="flex flex-1 items-center gap-4 pr-2">
                                <div className="w-10 h-10 rounded-2xl bg-[#F7931E]/10 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-[#F7931E]" strokeWidth={2} />
                                </div>
                                <span className="flex-1 text-left text-lg font-medium text-[#F7931E]">
                                    Apresentação
                                </span>
                                <SectionStatusIcon status={statusApresentacao} />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 pt-2 border-t border-slate-800/50">
                            <div className="space-y-6 pt-4">
                                <div className="flex flex-col items-center space-y-4 mb-6">
                                    <div className="relative group">
                                        <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700/50">
                                            {portfolio?.foto_bio ? (
                                                <img
                                                    src={getImageUrl(portfolio.foto_bio)}
                                                    alt="Foto da Bio"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                                    <Camera className="h-8 w-8 text-slate-600" />
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 p-2 bg-[#F7931E] rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                            <Camera className="h-4 w-4 text-slate-950" />
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, 'bio')}
                                            />
                                        </label>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-white">Foto da biografia</p>
                                        <p className="text-xs text-[#8a94a6] max-w-[240px] mt-1 leading-relaxed">
                                            Esta foto aparece na seção "Sobre" da sua página, dando um toque pessoal para seus clientes.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <EditableField
                                        label="Título"
                                        value={portfolio?.titulo}
                                        onSave={(val) => updatePortfolioBasico({ titulo: val, subtitulo: portfolio?.subtitulo, bio: portfolio?.bio })}
                                    />
                                    <EditableField
                                        label="Subtítulo"
                                        value={portfolio?.subtitulo}
                                        onSave={(val) => updatePortfolioBasico({ titulo: portfolio?.titulo, subtitulo: val, bio: portfolio?.bio })}
                                    />
                                    <EditableField
                                        label="Bio"
                                        value={portfolio?.bio}
                                        multiline
                                        onSave={(val) => updatePortfolioBasico({ titulo: portfolio?.titulo, subtitulo: portfolio?.subtitulo, bio: val })}
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Contato */}
                    <AccordionItem
                        value="contato"
                        className="rounded-3xl border-none bg-[#141a2b] px-6 overflow-hidden"
                    >
                        <AccordionTrigger className="py-5 hover:no-underline [&>svg]:text-[#8a94a6]">
                            <div className="flex flex-1 items-center gap-4 pr-2">
                                <div className="w-10 h-10 rounded-2xl bg-[#F7931E]/10 flex items-center justify-center">
                                    <Phone className="h-5 w-5 text-[#F7931E]" strokeWidth={2} />
                                </div>
                                <span className="flex-1 text-left text-lg font-medium text-[#F7931E]">
                                    Contato
                                </span>
                                <SectionStatusIcon status={statusContato} />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 pt-2 border-t border-slate-800/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <EditableField
                                    label="Telefone"
                                    value={account?.telefone}
                                    numericOnly
                                    onSave={(val) => updateAccountContato({ telefone: val, email: account?.email, instagram: account?.insta })}
                                />
                                <EditableField
                                    label="Email"
                                    value={account?.email}
                                    onSave={(val) => updateAccountContato({ telefone: account?.telefone, email: val, instagram: account?.insta })}
                                />
                                <EditableField
                                    label="Instagram"
                                    value={account?.insta}
                                    onSave={(val) => updateAccountContato({ telefone: account?.telefone, email: account?.email, instagram: val })}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Endereço e Localização */}
                    <AccordionItem
                        value="localizacao"
                        className="rounded-3xl border-none bg-[#141a2b] px-6 overflow-hidden"
                    >
                        <AccordionTrigger className="py-5 hover:no-underline [&>svg]:text-[#8a94a6]">
                            <div className="flex flex-1 items-center gap-4 pr-2">
                                <div className="w-10 h-10 rounded-2xl bg-[#F7931E]/10 flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-[#F7931E]" strokeWidth={2} />
                                </div>
                                <span className="flex-1 text-left text-lg font-medium text-[#F7931E]">
                                    Endereço e Localização
                                </span>
                                <SectionStatusIcon status={statusLocalizacao} />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 pt-2 border-t border-slate-800/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <EditableField
                                    label="CEP"
                                    value={account?.cep}
                                    numericOnly
                                    onSave={async (val) => {
                                        const cleanCep = val.replace(/\D/g, '');
                                        if (cleanCep.length !== 8) {
                                            if (cleanCep.length > 0) {
                                                setCepError({
                                                    title: "CEP Inválido",
                                                    message: "Por favor, informe um CEP com 8 dígitos."
                                                });
                                            }
                                            handleUpdateEndereco({ cep: val });
                                            return;
                                        }

                                        const address = await fetchAddress(cleanCep);
                                        if (address) {
                                            handleUpdateEndereco({
                                                cep: cleanCep,
                                                endereco: address.street || account?.endereco,
                                                bairro: address.neighborhood || account?.bairro,
                                                cidade: address.city || account?.cidade,
                                                estado: address.state || account?.estado
                                            });
                                        } else {
                                            setCepError({
                                                title: "CEP não encontrado",
                                                message: "Não conseguimos localizar o endereço para o CEP informado."
                                            });
                                            handleUpdateEndereco({ cep: cleanCep });
                                        }
                                    }}
                                />
                                <EditableField
                                    label="Endereço"
                                    value={account?.endereco}
                                    onSave={(val) => handleUpdateEndereco({ endereco: val })}
                                />
                                <EditableField
                                    label="Número"
                                    value={account?.numero}
                                    onSave={(val) => handleUpdateEndereco({ numero: val })}
                                />
                                <EditableField
                                    label="Bairro"
                                    value={account?.bairro}
                                    onSave={(val) => handleUpdateEndereco({ bairro: val })}
                                />
                                <EditableField
                                    label="Cidade"
                                    value={account?.cidade}
                                    onSave={(val) => handleUpdateEndereco({ cidade: val })}
                                />
                                <EditableField
                                    label="Estado"
                                    value={account?.estado}
                                    onSave={(val) => handleUpdateEndereco({ estado: val })}
                                />
                                <EditableField
                                    label="Complemento"
                                    value={account?.complemento}
                                    onSave={(val) => handleUpdateEndereco({ complemento: val })}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Trabalhos */}
                    <AccordionItem
                        value="trabalhos"
                        className="rounded-3xl border-none bg-[#141a2b] px-6 overflow-hidden"
                    >
                        <AccordionTrigger className="py-5 hover:no-underline [&>svg]:text-[#8a94a6]">
                            <div className="flex flex-1 items-center gap-4 pr-2">
                                <div className="w-10 h-10 rounded-2xl bg-[#F7931E]/10 flex items-center justify-center">
                                    <Images className="h-5 w-5 text-[#F7931E]" strokeWidth={2} />
                                </div>
                                <div className="flex-1 flex flex-col items-start">
                                    <span className="text-lg font-medium text-[#F7931E]">
                                        Trabalhos
                                    </span>
                                    <span className={cn(
                                        "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                                        statusTrabalhos === "complete" ? "bg-[#4ADE80]/10 text-[#4ADE80]" : "bg-slate-800 text-[#8a94a6]"
                                    )}>
                                        {portfolio?.itens?.length || 0} / 4 fotos
                                    </span>
                                </div>
                                <SectionStatusIcon status={statusTrabalhos} />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 pt-2 border-t border-slate-800/50">
                            <div className="space-y-6 pt-4">
                                <div className="grid grid-cols-3 gap-3">
                                    {portfolio?.itens?.map((item) => (
                                        <div key={item.id_foto} className="aspect-square rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/50 group relative">
                                            <img
                                                src={getImageUrl(item.url_foto)}
                                                alt="Portfolio"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute bottom-2 left-2 z-10">
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-full shadow-lg bg-[#F7931E] hover:bg-[#F7931E]/90 text-slate-950 border-none"
                                                    onClick={() => setPhotoToDelete(item.id_foto)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-2 text-[#8a94a6] hover:text-[#F7931E] hover:border-[#F7931E]/40 hover:bg-[#F7931E]/5 transition-all group cursor-pointer">
                                        <Plus className="w-6 h-6" />
                                        <span className="text-[10px] font-bold uppercase">Add</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'gallery')}
                                        />
                                    </label>
                                </div>

                                {statusTrabalhos === "pending" && (
                                    <p className="text-xs text-center text-[#8a94a6]">
                                        Adicione pelo menos 4 fotos para completar esta seção.
                                    </p>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Configurações Avançadas */}
                    <AccordionItem
                        value="config"
                        className="rounded-3xl border-none bg-[#141a2b] px-6 overflow-hidden"
                    >
                        <AccordionTrigger className="py-5 hover:no-underline [&>svg]:text-[#8a94a6]">
                            <div className="flex flex-1 items-center gap-4 pr-2">
                                <div className="w-10 h-10 rounded-2xl bg-[#F7931E]/10 flex items-center justify-center">
                                    <Settings className="h-5 w-5 text-[#F7931E]" strokeWidth={2} />
                                </div>
                                <span className="flex-1 text-left text-lg font-medium text-[#F7931E]">
                                    Configurações Avançadas
                                </span>
                                <SectionStatusIcon status="complete" />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 pt-2 border-t border-slate-800/50">
                            <div className="space-y-4">
                                <EditableField
                                    label="Google Analytics ID"
                                    value={account?.g_analytcs || account?.g_tag}
                                    onSave={(val) => updateAccountConfiguracoesAvancadas({ g_analytcs: val, meta_pixel_id: account?.meta_pixel_id || account?.meta_pixel, conta_google_ads: account?.conta_google_ads || account?.conta_google_ads_id })}
                                />
                                <EditableField
                                    label="Meta Pixel ID"
                                    value={account?.meta_pixel_id || account?.meta_pixel}
                                    onSave={(val) => updateAccountConfiguracoesAvancadas({ g_analytcs: account?.g_analytcs || account?.g_tag, meta_pixel_id: val, conta_google_ads: account?.conta_google_ads || account?.conta_google_ads_id })}
                                />
                                <EditableField
                                    label="Conta Google Ads"
                                    value={account?.conta_google_ads || account?.conta_google_ads_id}
                                    onSave={(val) => updateAccountConfiguracoesAvancadas({ g_analytcs: account?.g_analytcs || account?.g_tag, meta_pixel_id: account?.meta_pixel_id || account?.meta_pixel, conta_google_ads: val })}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* Dialog de confirmação de exclusão */}
            <Dialog open={photoToDelete !== null} onOpenChange={(open) => !open && setPhotoToDelete(null)}>
                <DialogContent className="bg-[#141a2b] border-slate-800 text-white rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-[#F7931E] text-xl font-bold">Excluir foto</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Tem certeza que deseja excluir esta foto do seu portfólio? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="border-t border-slate-800/50 pt-4 flex flex-row gap-3">
                        <Button
                            variant="ghost"
                            className="flex-1 text-slate-400 hover:text-white hover:bg-slate-800"
                            onClick={() => setPhotoToDelete(null)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="flex-1 bg-[#F7931E] hover:bg-[#F7931E]/90 text-slate-950 font-bold"
                            onClick={async () => {
                                if (photoToDelete !== null) {
                                    await handleDeleteFoto(photoToDelete);
                                    setPhotoToDelete(null);
                                }
                            }}
                        >
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de erro de CEP */}
            <Dialog open={cepError !== null} onOpenChange={(open) => !open && setCepError(null)}>
                <DialogContent className="bg-[#141a2b] border-slate-800 text-white rounded-[2rem]">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                <AlertCircle className="h-6 w-6 text-red-500" />
                            </div>
                            <DialogTitle className="text-red-500 text-xl font-bold">{cepError?.title}</DialogTitle>
                        </div>
                        <DialogDescription className="text-slate-400 text-base">
                            {cepError?.message}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="border-t border-slate-800/50 pt-4">
                        <Button
                            className="w-full bg-[#F7931E] hover:bg-[#F7931E]/90 text-slate-950 font-bold h-12 rounded-xl"
                            onClick={() => setCepError(null)}
                        >
                            Entendi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 5. Rodapé fixo */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0f1420] via-[#0f1420] to-transparent pt-12 z-10">
                <div className="max-w-2xl mx-auto flex flex-col items-center space-y-4">
                    {!isFullyComplete && (
                        <p className="text-[#8a94a6] text-xs font-medium">
                            Complete todas as seções para publicar sua página
                        </p>
                    )}
                    <Button
                        disabled={!isFullyComplete}
                        onClick={() => window.open(`https://${account?.slug}.inkers.com.br`, '_blank')}
                        className={cn(
                            "w-full max-w-sm h-[56px] rounded-2xl font-bold text-base transition-all",
                            isFullyComplete
                                ? "bg-[#F7931E] hover:bg-[#F7931E]/90 text-slate-950 shadow-lg shadow-[#F7931E]/20"
                                : "bg-[#F7931E] opacity-40 text-slate-950 cursor-not-allowed"
                        )}
                    >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Ver página pública
                    </Button>

                    <a href="https://inkers.com.br" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-slate-600 text-xs font-medium transition-colors">
                        inkers.com.br
                    </a>
                </div>
            </div>
        </div>
    );
}
