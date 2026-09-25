import { useEffect, useState, useMemo, useRef, useLayoutEffect } from "react";
import { 
  ChevronLeft, 
  Check, 
  Circle, 
  Phone, 
  MapPin, 
  Settings, 
  Loader2, 
  Images, 
  Trash2, 
  Plus, 
  FileText, 
  Camera, 
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { VendorHeader } from "../components/VendorHeader";
import { useAccountController } from "@/features/settings/hooks/useAccountController";
import { usePortfolioController } from "@/features/portfolio/hooks/usePortfolioController";
import { useVendorController } from "@/features/vendor/hooks/useVendorController";
import { processAndCompressImage, getImageUrl } from "@/lib/image-utils";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AccountData, PortfolioData } from "@/types/api";

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
              <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  className="text-slate-200/60"
              />
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
      </div>
  );
}

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

  const handleChange = (val: string) => {
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
          onChange={(e) => handleChange(e.target.value)}
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
            handleChange(val);
          }}
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

export default function MerchantCreatePage() {
  const navigate = useNavigate();
  const { createMerchant, isCreating } = useVendorController();
  const { 
    data: accountData, 
    categorias, 
    isLoading: isLoadingAccount,
    loadData: loadAccount, 
    fetchAddress
  } = useAccountController();

  const {
    data: portfolioData,
    isLoading: isLoadingPortfolio,
    loadData: loadPortfolio,
  } = usePortfolioController();

  const [slugError] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");

  // Estado local para evitar updates incrementais no backend
  const [localAccount, setLocalAccount] = useState<AccountData | null>(null);
  const [localPortfolio, setLocalPortfolio] = useState<PortfolioData | null>(null);

  // Estado local para armazenar as imagens em base64 para o payload final
  const [localImages, setLocalImages] = useState<{
    avatar?: { base64: string; name: string };
    bio?: { base64: string; name: string };
    capa?: { base64: string; name: string };
    gallery: Array<{ base64: string; name: string; id: number }>;
  }>({
    gallery: []
  });

  useEffect(() => {
    loadAccount();
    loadPortfolio();
  }, [loadAccount, loadPortfolio]);

  // Sincroniza dados iniciais apenas uma vez
  useEffect(() => {
    if (accountData && !localAccount) {
      setLocalAccount(accountData);
    }
  }, [accountData, localAccount]);

  useEffect(() => {
    if (portfolioData && !localPortfolio) {
      setLocalPortfolio(portfolioData);
    }
  }, [portfolioData, localPortfolio]);

  // Previews combinando dados do servidor e locais
  const displayImages = useMemo(() => {
    return {
      avatar: localImages.avatar?.base64 || getImageUrl(localPortfolio?.avatar),
      bio: localImages.bio?.base64 || getImageUrl(localPortfolio?.foto_bio),
      capa: localImages.capa?.base64 || getImageUrl(localPortfolio?.foto_capa),
      gallery: [
        ...localImages.gallery.map(img => ({ id_foto: img.id, url_foto: img.base64 })),
        ...(localPortfolio?.itens || [])
      ]
    };
  }, [localImages, localPortfolio, getImageUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'bio' | 'gallery' | 'capa') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const maxDim = type === 'avatar' ? 800 : 1920;
      const base64String = await processAndCompressImage(file, maxDim);
      
      // Sanitiza o nome do arquivo para evitar problemas com espaços em URLs
      const sanitizedName = file.name.replace(/\s+/g, '_');
      
      // Armazena localmente para o payload final
      if (type === 'gallery') {
        setLocalImages(prev => ({
          ...prev,
          gallery: [...prev.gallery, { base64: base64String, name: sanitizedName, id: Date.now() }]
        }));
      } else {
        setLocalImages(prev => ({
          ...prev,
          [type]: { base64: base64String, name: sanitizedName }
        }));
      }
    } catch (error: any) {
      console.error('Erro ao processar imagem:', error);
      alert('Não foi possível processar essa imagem.');
    } finally {
      event.target.value = '';
    }
  };

  const handleConfirmarCadastro = async () => {
    if (!localAccount || !localPortfolio) return;

    const cleanBase64 = (base64?: string) => {
      if (!base64) return '';
      return base64.includes(',') ? base64.split(',')[1] : base64;
    };

    const payload = {
      nome: localAccount.nome || '',
      slug: localAccount.slug || '',
      telefone: localAccount.telefone || '',
      email: localAccount.email || '',
      insta: localAccount.insta || '',
      cep: localAccount.cep || '',
      endereco: localAccount.endereco || '',
      numero: localAccount.numero || '',
      complemento: localAccount.complemento || '',
      bairro: localAccount.bairro || '',
      cidade: localAccount.cidade || '',
      estado: localAccount.estado || '',
      g_analytcs: localAccount.g_analytcs || '',
      meta_pixel_id: localAccount.meta_pixel_id || localAccount.meta_pixel || '',
      conta_google_ads: localAccount.conta_google_ads || '',
      horario: JSON.stringify(localAccount.horario || {}),
      titulo: localPortfolio.titulo || '',
      subtitulo: localPortfolio.subtitulo || '',
      bio: localPortfolio.bio || '',
      nome_arquivo_foto_avatar: localImages.avatar?.name || '',
      nome_arquivo_foto_bio: localImages.bio?.name || '',
      nome_arquivo_foto_capa: localImages.capa?.name || '',
      avatar: cleanBase64(localImages.avatar?.base64),
      foto_bio: cleanBase64(localImages.bio?.base64),
      foto_capa: cleanBase64(localImages.capa?.base64),
      trabalhos: JSON.stringify(localImages.gallery.map(img => ({
        nome_arquivo: img.name,
        itemTrabalho: cleanBase64(img.base64)
      }))),
      id_categoria: localAccount.id_categoria || localAccount.categoria_id || 0
    };

    try {
      await createMerchant(payload);
      setCreatedSlug(localAccount.slug);
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error("Erro ao criar comerciante:", error);
      const msg = error?.response?.data?.error || error?.message || "Erro desconhecido";
      alert(`Erro ao criar comerciante: ${msg}`);
    }
  };

  const statusApresentacao = useMemo((): SectionStatus => {
    const isComplete = !!(localPortfolio?.titulo && localPortfolio?.subtitulo && localPortfolio?.bio);
    return isComplete ? "complete" : "pending";
  }, [localPortfolio]);

  const statusContato = useMemo((): SectionStatus => {
    const isComplete = !!(localAccount?.telefone && localAccount?.email && localAccount?.insta);
    return isComplete ? "complete" : "pending";
  }, [localAccount]);

  const statusLocalizacao = useMemo((): SectionStatus => {
    const isComplete = !!(localAccount?.cep && localAccount?.endereco && localAccount?.numero && localAccount?.bairro && localAccount?.cidade && localAccount?.estado);
    return isComplete ? "complete" : "pending";
  }, [localAccount]);

  const statusTrabalhos = useMemo((): SectionStatus => {
    const isComplete = (displayImages.gallery.length || 0) >= 4;
    return isComplete ? "complete" : "pending";
  }, [displayImages.gallery]);

  const statusIdentidade = useMemo((): SectionStatus => {
    const isComplete = !!(displayImages.avatar && displayImages.capa);
    return isComplete ? "complete" : "pending";
  }, [displayImages.avatar, displayImages.capa]);

  const progressPercent = useMemo(() => {
    let completed = 0;
    if (statusIdentidade === "complete") completed++;
    if (statusApresentacao === "complete") completed++;
    if (statusContato === "complete") completed++;
    if (statusLocalizacao === "complete") completed++;
    if (statusTrabalhos === "complete") completed++;
    return Math.round((completed / 5) * 100);
  }, [statusIdentidade, statusApresentacao, statusContato, statusLocalizacao, statusTrabalhos]);

  const isLoading = (isLoadingAccount || isLoadingPortfolio) && !localAccount;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563eb]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <VendorHeader />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/vendedor')}
            className="gap-2 text-slate-500 hover:text-slate-800 mb-6 -ml-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar ao painel
          </Button>

          <div className="space-y-6">
            {/* 1. Card de Identidade + progresso */}
            <Card id="section-identidade" className="relative p-6 md:p-8 bg-white border border-slate-200/80 rounded-[2.5rem] flex flex-row items-center gap-6 overflow-hidden group min-h-[220px] text-slate-900 shadow-xs hover:border-blue-200/80 transition-all duration-300">
              {/* Imagem de Capa e Gradiente */}
              <div className="absolute inset-0 z-0">
                {displayImages.capa ? (
                  <img
                    src={displayImages.capa}
                    alt="Capa"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-50" />
                )}
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]" />
              </div>

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
                  {displayImages.avatar ? (
                    <img
                      src={displayImages.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50">
                      <span className="text-[#2563eb] text-3xl font-bold">{localAccount?.nome?.charAt(0)}</span>
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
                  value={localAccount?.nome}
                  maxLength={100}
                  onSave={(val) => setLocalAccount(prev => prev ? ({ ...prev, nome: val }) : null)}
                />
                <EditableField
                  label="Apelido"
                  value={localAccount?.slug}
                  maxLength={100}
                  isSlug
                  error={slugError}
                  onSave={(val) => setLocalAccount(prev => prev ? ({ ...prev, slug: val }) : null)}
                />
                <EditableSelect
                  label="Categoria"
                  value={localAccount?.id_categoria ?? localAccount?.categoria_id}
                  options={categorias.map(c => ({ id: c.categoria_id, name: c.categoria_nome }))}
                  onSave={(val) => setLocalAccount(prev => prev ? ({ ...prev, id_categoria: parseInt(val), categoria_id: parseInt(val) }) : null)}
                />
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Progresso</span>
                    <div className="bg-blue-50 border border-blue-100 text-[#2563eb] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tight">
                        {progressPercent}%
                    </div>
                </div>
              </div>
            </Card>

            {/* 2. Accordions expansíveis */}
            <Accordion type="single" collapsible className="w-full space-y-3">
              <AccordionItem id="section-apresentacao" value="apresentacao" className="rounded-3xl border border-slate-200/80 bg-white px-6 overflow-hidden shadow-xs hover:border-blue-200/80 transition-colors">
                <AccordionTrigger className="py-5 hover:no-underline [&>svg]:text-slate-400">
                  <div className="flex flex-1 items-center gap-4 pr-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-[#2563eb]" strokeWidth={2} />
                    </div>
                    <span className="flex-1 text-left text-lg font-bold text-slate-900">Apresentação</span>
                    <SectionStatusIcon status={statusApresentacao} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2 border-t border-slate-100">
                  <div className="space-y-6 pt-4">
                    <div className="flex flex-col items-center space-y-4 mb-6">
                      <div className="relative group">
                        <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-inner">
                          {displayImages.bio ? (
                            <img src={displayImages.bio} alt="Foto da Bio" className="w-full h-full object-cover" />
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
                      <EditableField label="Título" value={localPortfolio?.titulo} maxLength={100} onSave={(val) => setLocalPortfolio(prev => prev ? ({ ...prev, titulo: val }) : null)} />
                      <EditableField label="Subtítulo" value={localPortfolio?.subtitulo} maxLength={500} onSave={(val) => setLocalPortfolio(prev => prev ? ({ ...prev, subtitulo: val }) : null)} />
                      <EditableField label="Bio" value={localPortfolio?.bio} multiline onSave={(val) => setLocalPortfolio(prev => prev ? ({ ...prev, bio: val }) : null)} />
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
                    <SectionStatusIcon status={statusContato} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <EditableField 
                      label="Telefone" 
                      value={localAccount?.telefone} 
                      numericOnly 
                      onSave={(val) => setLocalAccount(prev => prev ? ({ ...prev, telefone: val }) : null)} 
                    />
                    <EditableField 
                      label="Email" 
                      value={localAccount?.email} 
                      onSave={(val) => setLocalAccount(prev => prev ? ({ ...prev, email: val }) : null)} 
                    />
                    <EditableField 
                      label="Instagram" 
                      value={localAccount?.insta} 
                      onSave={(val) => setLocalAccount(prev => prev ? ({ ...prev, insta: val }) : null)} 
                    />
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
                    <SectionStatusIcon status={statusLocalizacao} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <EditableField 
                      label="CEP" 
                      value={localAccount?.cep} 
                      numericOnly 
                      onSave={async (val) => {
                        const cleanCep = val.replace(/\D/g, '');
                        if (cleanCep.length === 8) {
                          const address = await fetchAddress(cleanCep);
                          if (address) {
                            setLocalAccount(prev => prev ? ({
                              ...prev,
                              cep: cleanCep,
                              endereco: address.street || prev.endereco,
                              bairro: address.neighborhood || prev.bairro,
                              cidade: address.city || prev.cidade,
                              estado: address.state || prev.estado
                            }) : null);
                          } else {
                            setLocalAccount(prev => prev ? ({ ...prev, cep: cleanCep }) : null);
                          }
                        } else {
                            setLocalAccount(prev => prev ? ({ ...prev, cep: val }) : null);
                        }
                      }} 
                    />
                    <EditableField label="Endereço" value={localAccount?.endereco} onSave={(val) => setLocalAccount(prev => prev ? ({ ...prev, endereco: val }) : null)} />
                    <EditableField label="Número" value={localAccount?.numero} onSave={(val) => setLocalAccount(prev => prev ? ({ ...prev, numero: val }) : null)} />
                    <EditableField label="Complemento" value={localAccount?.complemento} onSave={(val) => setLocalAccount(prev => prev ? ({ ...prev, complemento: val }) : null)} />
                    <EditableField label="Bairro" value={localAccount?.bairro} onSave={(val) => setLocalAccount(prev => prev ? ({ ...prev, bairro: val }) : null)} />
                    <EditableField label="Cidade" value={localAccount?.cidade} onSave={(val) => setLocalAccount(prev => prev ? ({ ...prev, cidade: val }) : null)} />
                    <EditableField label="Estado" value={localAccount?.estado} onSave={(val) => setLocalAccount(prev => prev ? ({ ...prev, estado: val }) : null)} />
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
                        {displayImages.gallery.length || 0} / 4 fotos
                      </span>
                    </div>
                    <SectionStatusIcon status={statusTrabalhos} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-3 pt-4">
                    {displayImages.gallery?.map((item, idx) => (
                      <div key={item.id_foto || idx} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group relative shadow-2xs">
                        <img src={item.url_foto} alt="Portfolio" className="w-full h-full object-cover" />
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="absolute bottom-2 left-2 h-7 w-7 rounded-full shadow-md bg-slate-900/80 hover:bg-red-600 text-white border-none cursor-pointer transition-colors" 
                          onClick={() => {
                            if (typeof item.id_foto === 'number' && item.id_foto > 1000000000) {
                              // É uma imagem local (timestamp)
                              setLocalImages(prev => ({
                                ...prev,
                                gallery: prev.gallery.filter(img => img.id !== item.id_foto)
                              }));
                            } else {
                              setPhotoToDelete(item.id_foto);
                            }
                          }}
                        >
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

              <AccordionItem id="section-config" value="config" className="rounded-3xl border border-slate-200/80 bg-white px-6 overflow-hidden shadow-xs hover:border-blue-200/80 transition-colors">
                  <AccordionTrigger className="py-5 hover:no-underline [&>svg]:text-slate-400">
                      <div className="flex flex-1 items-center gap-4 pr-2">
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                              <Settings className="h-5 w-5 text-[#2563eb]" strokeWidth={2} />
                          </div>
                          <span className="flex-1 text-left text-lg font-bold text-slate-900">Configurações Avançadas</span>
                          <SectionStatusIcon status="complete" />
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-2 border-t border-slate-100">
                      <div className="space-y-6 pt-4">
                          <div className="space-y-4">
                              <EditableField label="Google Analytics ID" value={localAccount?.g_analytcs} onSave={(val) => setLocalAccount(prev => prev ? ({ ...prev, g_analytcs: val }) : null)} />
                              <EditableField label="Meta Pixel ID" value={localAccount?.meta_pixel_id || localAccount?.meta_pixel} onSave={(val) => setLocalAccount(prev => prev ? ({ ...prev, meta_pixel_id: val, meta_pixel: val }) : null)} />
                              <EditableField label="Conta Google Ads" value={localAccount?.conta_google_ads} onSave={(val) => setLocalAccount(prev => prev ? ({ ...prev, conta_google_ads: val }) : null)} />
                          </div>
                          <div className="pt-6 border-t border-slate-100">
                              <div className="flex items-center gap-2 mb-6">
                                  <div className="w-1.5 h-4 bg-[#2563eb] rounded-full" />
                                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Horários de Funcionamento</h4>
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                  {DAYS_MAP.map((day) => (
                                      <ScheduleItemEditor key={day.id} day={day} data={localAccount?.horario?.[day.id]} onUpdate={(dayData) => {
                                          const newHorario = { ...(localAccount?.horario || {}), [day.id]: dayData };
                                          setLocalAccount(prev => prev ? ({ ...prev, horario: newHorario }) : null);
                                      }} />
                                  ))}
                              </div>
                          </div>
                      </div>
                  </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="pt-6 border-t border-slate-100">
              <Button 
                onClick={handleConfirmarCadastro}
                disabled={isCreating}
                className="w-full h-12 gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Check className="h-5 w-5" />
                )}
                Confirmar Cadastro
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <Dialog open={photoToDelete !== null} onOpenChange={(open) => !open && setPhotoToDelete(null)}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 rounded-[2rem] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-xl font-bold">Excluir foto</DialogTitle>
            <DialogDescription className="text-slate-500">Tem certeza que deseja excluir esta foto do seu portfólio? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t border-slate-100 pt-4 flex flex-row gap-3">
            <Button variant="ghost" className="flex-1 text-slate-600 hover:bg-slate-100" onClick={() => setPhotoToDelete(null)}>Cancelar</Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold" 
              onClick={() => { 
                if (photoToDelete !== null) { 
                  setLocalPortfolio(prev => prev ? ({
                    ...prev,
                    itens: prev.itens.filter(item => item.id_foto !== photoToDelete)
                  }) : null);
                  setPhotoToDelete(null); 
                } 
              }}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 rounded-[2rem] shadow-2xl max-w-sm mx-auto">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-emerald-600" strokeWidth={3} />
            </div>
            <DialogTitle className="text-slate-900 text-2xl font-bold">Tudo pronto!</DialogTitle>
            <DialogDescription className="text-slate-500 mt-2">
              Seu perfil foi criado com sucesso e já está disponível para o mundo.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 my-2">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 text-center">Seu endereço web</p>
            <p className="text-sm font-bold text-blue-600 text-center break-all">
              https://{createdSlug}.guiatour.online
            </p>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col pt-2">
            <Button 
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold h-12 rounded-xl"
              onClick={() => window.open(`https://${createdSlug}.guiatour.online`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver minha página
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-slate-500 font-bold"
              onClick={() => navigate('/vendedor')}
            >
              Voltar ao painel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
