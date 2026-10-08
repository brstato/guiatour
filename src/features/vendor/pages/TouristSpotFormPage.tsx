import { useEffect, useState, useMemo } from "react";
import { 
  ChevronLeft, 
  MapPin, 
  Loader2, 
  Images, 
  Trash2, 
  Plus, 
  FileText, 
  Camera, 
  Check,
  Settings
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VendorHeader } from "../components/VendorHeader";
import { SpotEditableField } from "../components/spot/SpotEditableField";
import { SpotEditableSelect } from "../components/spot/SpotEditableSelect";
import { SpotSectionStatusIcon } from "../components/spot/SpotSectionStatusIcon";
import { SpotVisibilityToggle } from "../components/spot/SpotVisibilityToggle";
import { useTouristSpotController } from "../hooks/useTouristSpotController";
import { accountService } from "@/features/settings/services/accountService";
import { processAndCompressImage, getImageUrl } from "@/lib/image-utils";
import { cn } from "@/lib/utils";
import { VideoUrlField } from "@/components/VideoUrlField";
import type { SaveTouristSpotDTO } from "../types";

const MIN_GALLERY_PHOTOS = 3;
const MAX_GALLERY_PHOTOS = 12;

interface FormState {
  nome: string;
  id_categoria: number;
  resumo: string;
  historia: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  latitude: string;
  longitude: string;
  url_video: string;
}

export default function TouristSpotFormPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  
  const [spotUuid, setSpotUuid] = useState<string | null>(() => uuid || localStorage.getItem("id_ponto_turistico"));
  const isEditing = !!spotUuid;

  const {
    categories,
    spot,
    isLoadingSpot,
    createSpot,
    updateSpot,
    setSpotActive,
    removeSpotPhoto,
    isSaving,
  } = useTouristSpotController(spotUuid || undefined);

  const [form, setForm] = useState<FormState>({
    nome: "",
    id_categoria: 0,
    resumo: "",
    historia: "",
    cep: "",
    endereco: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
    latitude: "",
    longitude: "",
    url_video: "",
  });

  const [capa, setCapa] = useState<{ base64: string; name: string } | null>(null);
  const [newPhotos, setNewPhotos] = useState<Array<{ localId: number; base64: string; name: string }>>([]);
  const [savedPhotos, setSavedPhotos] = useState<Array<{ id: number; url: string }>>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [photoToDelete, setPhotoToDelete] = useState<{ id: number; isSaved: boolean; localId?: number } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Sincroniza o UUID da URL com o estado local e localStorage
  useEffect(() => {
    if (uuid && uuid !== spotUuid) {
      setSpotUuid(uuid);
      localStorage.setItem("id_ponto_turistico", uuid);
    }
  }, [uuid, spotUuid]);

  // Carregar dados na edição
  useEffect(() => {
    if (isEditing && spot && !loaded) {
      setForm({
        nome: spot.nome || "",
        id_categoria: spot.id_categoria || 0,
        resumo: spot.resumo || "",
        historia: spot.historia || "",
        cep: spot.cep || "",
        endereco: spot.endereco || "",
        numero: spot.numero || "",
        bairro: spot.bairro || "",
        cidade: spot.cidade || "",
        uf: spot.uf || "",
        latitude: spot.latitude?.toString() || "",
        longitude: spot.longitude?.toString() || "",
        url_video: spot.url_video || "",
      });
      setSavedPhotos(spot.galeria || []);
      setLoaded(true);
    }
  }, [isEditing, spot, loaded]);

  const cleanBase64 = (b64: string) => b64.includes(',') ? b64.split(',')[1] : b64;

  // incluirVideo: o vídeo só vai no PUT quando ele é a alteração.
  // Sem o campo, o backend mantém o vídeo que já está salvo.
  // Devolve a mensagem de erro do backend, ou null se salvou.
  const saveChanges = async (currentForm: FormState, newCapa?: { base64: string; name: string } | null, newerPhotos?: Array<{ base64: string; name: string }>, incluirVideo = false): Promise<string | null> => {
    if (!spotUuid) return null;

    const payload: SaveTouristSpotDTO = {
      id_categoria: currentForm.id_categoria,
      nome: currentForm.nome,
      resumo: currentForm.resumo,
      historia: currentForm.historia,
      latitude: currentForm.latitude.replace(',', '.'),
      longitude: currentForm.longitude.replace(',', '.'),
      cep: currentForm.cep,
      endereco: currentForm.endereco,
      numero: currentForm.numero,
      bairro: currentForm.bairro,
      cidade: currentForm.cidade,
      estado: currentForm.uf.toUpperCase(),
      nome_arquivo_capa: newCapa?.name || "",
      capa: newCapa ? cleanBase64(newCapa.base64) : "",
      galeria: (newerPhotos || []).map(p => ({
        nome_arquivo: p.name,
        itemFoto: cleanBase64(p.base64)
      })),
      ...(incluirVideo && { url_video: currentForm.url_video })
    };

    try {
      await updateSpot(payload);
      if (newCapa) setCapa(null);
      if (newerPhotos && newerPhotos.length > 0) {
        setNewPhotos(prev => prev.filter(p => !newerPhotos.some(np => np.base64 === p.base64)));
      }
      return null;
    } catch (error: any) {
      console.error("Erro ao salvar alterações automáticas:", error);
      return error?.response?.data?.error || "Não foi possível salvar. Tente de novo.";
    }
  };

  const handleFieldChange = async (field: keyof FormState, value: any) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    if (spotUuid) {
      await saveChanges(updatedForm);
    }
  };

  const handleVideoSave = async (url: string): Promise<string | null> => {
    const updatedForm = { ...form, url_video: url };
    if (spotUuid) {
      const erro = await saveChanges(updatedForm, null, [], true);
      if (erro) return erro;
    }
    setForm(updatedForm);
    return null;
  };

  const handleCapaChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64String = await processAndCompressImage(file, 1920);
      const base = file.name.replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '_') || 'capa';
      const name = `${base}.jpg`;
      
      if (spotUuid) {
        await saveChanges(form, { base64: base64String, name });
      } else {
        setCapa({ base64: base64String, name });
        setValidationErrors(prev => {
          const next = { ...prev };
          delete next.capa;
          return next;
        });
      }
    } catch (error) {
      console.error('Erro ao processar capa:', error);
      alert('Não foi possível processar essa imagem.');
    } finally {
      event.target.value = '';
    }
  };

  const handleGalleryChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (savedPhotos.length + newPhotos.length + files.length > MAX_GALLERY_PHOTOS) {
      alert(`O limite máximo é de ${MAX_GALLERY_PHOTOS} fotos.`);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const base64String = await processAndCompressImage(file, 1920);
        const base = file.name.replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '_') || 'foto';
        const name = `${base}.jpg`;
        
        if (spotUuid) {
          await saveChanges(form, null, [{ base64: base64String, name }]);
        } else {
          setNewPhotos(prev => [...prev, { localId: Date.now() + i, base64: base64String, name }]);
        }
      } catch (error) {
        console.error('Erro ao processar foto:', error);
      }
    }
    
    setValidationErrors(prev => {
      const next = { ...prev };
      delete next.galeria;
      return next;
    });
    event.target.value = '';
  };

  const handleCepBlur = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const address = await accountService.fetchEndereco(cleanCep);
        if (address) {
          const updatedForm = {
            ...form,
            cep: cleanCep,
            endereco: address.street || form.endereco,
            bairro: address.neighborhood || form.bairro,
            cidade: address.city || form.cidade,
            uf: address.state || form.uf,
            latitude: address.location?.coordinates.latitude.toString() || form.latitude,
            longitude: address.location?.coordinates.longitude.toString() || form.longitude,
          };
          
          setForm(updatedForm);
          
          setValidationErrors(prev => {
            const next = { ...prev };
            delete next.cep;
            delete next.endereco;
            delete next.bairro;
            delete next.cidade;
            delete next.uf;
            delete next.latitude;
            delete next.longitude;
            return next;
          });

          if (spotUuid) {
            await saveChanges(updatedForm);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada pelo seu navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const updatedForm = {
          ...form,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        };
        setForm(updatedForm);
        setValidationErrors(prev => {
          const next = { ...prev };
          delete next.latitude;
          delete next.longitude;
          return next;
        });

        if (spotUuid) {
          await saveChanges(updatedForm);
        }
      },
      () => {
        alert("Não foi possível obter sua localização. Verifique as permissões do navegador.");
      }
    );
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.nome.trim()) errors.nome = "Nome é obrigatório";
    if (!form.id_categoria) errors.id_categoria = "Categoria é obrigatória";
    if (!isEditing && !capa) errors.capa = "Capa é obrigatória";
    if (isEditing && !capa && !spot?.capa) errors.capa = "Capa é obrigatória";
    if (!form.resumo.trim()) errors.resumo = "Resumo é obrigatório";
    
    const lat = parseFloat(form.latitude.replace(',', '.'));
    const lng = parseFloat(form.longitude.replace(',', '.'));
    
    if (isNaN(lat) || lat < -90 || lat > 90) errors.latitude = "Latitude inválida (-90 a 90)";
    if (isNaN(lng) || lng < -180 || lng > 180) errors.longitude = "Longitude inválida (-180 a 180)";
    
    if (!form.cidade.trim()) errors.cidade = "Cidade é obrigatória";
    if (!form.uf.trim() || form.uf.length !== 2) errors.uf = "UF inválida (2 letras)";
    
    const totalPhotos = savedPhotos.length + newPhotos.length;
    if (totalPhotos < MIN_GALLERY_PHOTOS) {
      errors.galeria = `Adicione pelo menos ${MIN_GALLERY_PHOTOS} fotos na galeria`;
    }

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      alert("Por favor, preencha todos os campos obrigatórios antes de confirmar.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload: SaveTouristSpotDTO = {
      id_categoria: form.id_categoria,
      nome: form.nome,
      resumo: form.resumo,
      historia: form.historia,
      latitude: form.latitude.replace(',', '.'),
      longitude: form.longitude.replace(',', '.'),
      cep: form.cep,
      endereco: form.endereco,
      numero: form.numero,
      bairro: form.bairro,
      cidade: form.cidade,
      estado: form.uf.toUpperCase(),
      nome_arquivo_capa: capa?.name || "",
      capa: capa ? cleanBase64(capa.base64) : "",
      galeria: newPhotos.map(p => ({
        nome_arquivo: p.name,
        itemFoto: cleanBase64(p.base64)
      })),
      // na edição, só envia o vídeo se o GET já trouxe o campo (tarefa B1); senão apagaria o vídeo salvo
      ...((!isEditing || spot?.url_video !== undefined) && { url_video: form.url_video })
    };

    try {
      if (isEditing) {
        await updateSpot(payload);
        setCapa(null);
        setNewPhotos([]);
        // O React Query invalidará e trará as novas URLs
        alert("Ponto turístico atualizado com sucesso!");
      } else {
        const result = await createSpot(payload);
        setSpotUuid(result.uuid);
        localStorage.setItem("id_ponto_turistico", result.uuid);
        setIsSuccess(true);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.message || "Erro desconhecido";
      alert(`Erro ao salvar ponto turístico: ${msg}`);
      if (msg.includes("Imagem inválida")) {
        alert("Dica: Use fotos JPG, PNG ou WEBP de até 5 MB.");
      }
    }
  };

  const handleDeletePhoto = async () => {
    if (!photoToDelete) return;
    
    if (photoToDelete.isSaved) {
      try {
        await removeSpotPhoto(photoToDelete.id);
        setSavedPhotos(prev => prev.filter(p => p.id !== photoToDelete.id));
      } catch (error) {
        // Erro já logado no hook
      }
    } else {
      setNewPhotos(prev => prev.filter(p => p.localId !== photoToDelete.localId));
    }
    setPhotoToDelete(null);
  };

  // Cálculo de progresso
  const statusIdentidade = useMemo(() => {
    const hasCapa = !!capa || (isEditing && !!spot?.capa);
    return (form.nome && form.id_categoria && hasCapa) ? "complete" : "pending";
  }, [form.nome, form.id_categoria, capa, isEditing, spot]);

  const statusDescricao = useMemo(() => {
    return form.resumo ? "complete" : "pending";
  }, [form.resumo]);

  const statusLocalizacao = useMemo(() => {
    const lat = parseFloat(form.latitude.replace(',', '.'));
    const lng = parseFloat(form.longitude.replace(',', '.'));
    const validCoords = !isNaN(lat) && lat >= -90 && lat <= 90 && !isNaN(lng) && lng >= -180 && lng <= 180;
    return (validCoords && form.cidade && form.uf.length === 2) ? "complete" : "pending";
  }, [form.latitude, form.longitude, form.cidade, form.uf]);

  const statusFotos = useMemo(() => {
    return (savedPhotos.length + newPhotos.length >= MIN_GALLERY_PHOTOS) ? "complete" : "pending";
  }, [savedPhotos, newPhotos]);

  const progressPercent = useMemo(() => {
    let completed = 0;
    if (statusIdentidade === "complete") completed++;
    if (statusDescricao === "complete") completed++;
    if (statusLocalizacao === "complete") completed++;
    if (statusFotos === "complete") completed++;
    return Math.round((completed / 4) * 100);
  }, [statusIdentidade, statusDescricao, statusLocalizacao, statusFotos]);

  if (isEditing && isLoadingSpot) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin h-12 w-12 text-[#2563eb]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <VendorHeader />

      <main className="flex-1">
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
            {/* 1. Card de Identidade */}
            <Card className="relative p-6 md:p-8 bg-white border border-slate-200/80 rounded-[2.5rem] flex flex-row items-center gap-6 overflow-hidden min-h-[220px] shadow-xs hover:border-blue-200/80 transition-all duration-300">
              <div className="absolute inset-0 z-0">
                {capa ? (
                  <img src={capa.base64} alt="Capa" className="w-full h-full object-cover" />
                ) : spot?.capa ? (
                  <img src={getImageUrl(spot.capa)} alt="Capa" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-50" />
                )}
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]" />
              </div>

              <label className={cn(
                "absolute bottom-6 right-6 flex items-center justify-center w-10 h-10 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full cursor-pointer shadow-lg z-20 hover:scale-110 transition-all",
                validationErrors.capa && "ring-4 ring-red-500 ring-offset-2 animate-bounce"
              )}>
                <Camera className="h-5 w-5" />
                <input type="file" className="hidden" accept="image/*" onChange={handleCapaChange} />
              </label>

              <div className="relative z-10 flex-1 py-2">
                <SpotEditableField
                  label="Nome"
                  value={form.nome}
                  maxLength={100}
                  error={validationErrors.nome}
                  onSave={(val) => handleFieldChange("nome", val)}
                />
                <SpotEditableSelect
                  label="Categoria"
                  value={form.id_categoria}
                  options={categories.map(c => ({ id: c.id_categoria, name: c.nome }))}
                  error={validationErrors.id_categoria}
                  onSave={(val) => handleFieldChange("id_categoria", parseInt(val))}
                />
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Progresso</span>
                  <div className="bg-blue-50 border border-blue-100 text-[#2563eb] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tight">
                    {progressPercent}%
                  </div>
                </div>
              </div>
            </Card>

            {/* 2. Acordeões */}
            <Accordion type="single" collapsible className="w-full space-y-3">
              {/* Descrição */}
              <AccordionItem value="descricao" className="rounded-3xl border border-slate-200/80 bg-white px-6 overflow-hidden shadow-xs hover:border-blue-200/80 transition-colors">
                <AccordionTrigger className="py-5 hover:no-underline">
                  <div className="flex flex-1 items-center gap-4 pr-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-[#2563eb]" />
                    </div>
                    <span className="flex-1 text-left text-lg font-bold text-slate-900">Descrição</span>
                    <SpotSectionStatusIcon status={statusDescricao} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2 border-t border-slate-100">
                  <div className="space-y-4 pt-4">
                    <SpotEditableField 
                      label="Resumo" 
                      value={form.resumo} 
                      multiline 
                      maxLength={300}
                      placeholder="Texto curto que aparece nos cards de busca"
                      error={validationErrors.resumo}
                      onSave={(val) => handleFieldChange("resumo", val)}
                    />
                    <SpotEditableField 
                      label="História" 
                      value={form.historia} 
                      multiline 
                      placeholder="Texto completo com detalhes sobre o local"
                      onSave={(val) => handleFieldChange("historia", val)}
                    />
                    <VideoUrlField
                      value={form.url_video}
                      onSave={handleVideoSave}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Localização */}
              <AccordionItem value="localizacao" className="rounded-3xl border border-slate-200/80 bg-white px-6 overflow-hidden shadow-xs hover:border-blue-200/80 transition-colors">
                <AccordionTrigger className="py-5 hover:no-underline">
                  <div className="flex flex-1 items-center gap-4 pr-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-[#2563eb]" />
                    </div>
                    <span className="flex-1 text-left text-lg font-bold text-slate-900">Endereço e Localização</span>
                    <SpotSectionStatusIcon status={statusLocalizacao} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2 border-t border-slate-100">
                  <div className="pt-4 space-y-4">
                    <div className="flex justify-end">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleGetCurrentLocation}
                        className="text-xs font-bold text-blue-600 border-blue-100 hover:bg-blue-50 rounded-xl"
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        Usar minha localização atual
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SpotEditableField 
                        label="CEP" 
                        value={form.cep} 
                        onSave={handleCepBlur} 
                        placeholder="Opcional"
                      />
                      <SpotEditableField 
                        label="Endereço" 
                        value={form.endereco} 
                        onSave={(val) => handleFieldChange("endereco", val)} 
                      />
                      <SpotEditableField 
                        label="Número" 
                        value={form.numero} 
                        onSave={(val) => handleFieldChange("numero", val)} 
                      />
                      <SpotEditableField 
                        label="Bairro" 
                        value={form.bairro} 
                        onSave={(val) => handleFieldChange("bairro", val)} 
                      />
                      <SpotEditableField 
                        label="Cidade" 
                        value={form.cidade} 
                        error={validationErrors.cidade}
                        onSave={(val) => handleFieldChange("cidade", val)} 
                      />
                      <SpotEditableField 
                        label="Estado (UF)" 
                        value={form.uf} 
                        maxLength={2}
                        uppercase
                        error={validationErrors.uf}
                        onSave={(val) => handleFieldChange("uf", val)} 
                      />
                      <SpotEditableField 
                        label="Latitude" 
                        value={form.latitude} 
                        decimal
                        error={validationErrors.latitude}
                        onSave={(val) => handleFieldChange("latitude", val)} 
                      />
                      <SpotEditableField 
                        label="Longitude" 
                        value={form.longitude} 
                        decimal
                        error={validationErrors.longitude}
                        onSave={(val) => handleFieldChange("longitude", val)} 
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Fotos */}
              <AccordionItem value="fotos" className="rounded-3xl border border-slate-200/80 bg-white px-6 overflow-hidden shadow-xs hover:border-blue-200/80 transition-colors">
                <AccordionTrigger className="py-5 hover:no-underline">
                  <div className="flex flex-1 items-center gap-4 pr-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <Images className="h-5 w-5 text-[#2563eb]" />
                    </div>
                    <div className="flex-1 flex flex-col items-start">
                      <span className="text-lg font-bold text-slate-900">Fotos</span>
                      <span className={cn(
                        "text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border",
                        statusFotos === "complete" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-[#2563eb] border-blue-200/70",
                        validationErrors.galeria && "bg-red-50 text-red-600 border-red-200"
                      )}>
                        {savedPhotos.length + newPhotos.length} / {MIN_GALLERY_PHOTOS} fotos (min)
                      </span>
                    </div>
                    <SpotSectionStatusIcon status={statusFotos} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-3 pt-4">
                    {/* Fotos Salvas */}
                    {savedPhotos.map((photo) => (
                      <div key={`saved-${photo.id}`} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group shadow-2xs">
                        <img src={getImageUrl(photo.url)} alt="Galeria" className="w-full h-full object-cover" />
                        <Button 
                          variant="secondary" size="icon" 
                          className="absolute bottom-2 left-2 h-7 w-7 rounded-full bg-slate-900/80 hover:bg-red-600 text-white border-none"
                          onClick={() => setPhotoToDelete({ id: photo.id, isSaved: true })}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                    {/* Fotos Novas */}
                    {newPhotos.map((photo) => (
                      <div key={`new-${photo.localId}`} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group shadow-2xs">
                        <img src={photo.base64} alt="Nova" className="w-full h-full object-cover" />
                        <Button 
                          variant="secondary" size="icon" 
                          className="absolute bottom-2 left-2 h-7 w-7 rounded-full bg-slate-900/80 hover:bg-red-600 text-white border-none"
                          onClick={() => setPhotoToDelete({ id: 0, isSaved: false, localId: photo.localId })}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                    {/* Botão Adicionar */}
                    {(savedPhotos.length + newPhotos.length < MAX_GALLERY_PHOTOS) && (
                      <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-[#2563eb] hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer transition-all shadow-2xs">
                        <Plus className="w-6 h-6" />
                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleGalleryChange} />
                      </label>
                    )}
                  </div>
                  {validationErrors.galeria && (
                    <p className="text-[10px] text-red-500 font-bold mt-2 uppercase tracking-tight text-center">{validationErrors.galeria}</p>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Publicação (Só na edição) */}
              {isEditing && (
                <AccordionItem value="publicacao" className="rounded-3xl border border-slate-200/80 bg-white px-6 overflow-hidden shadow-xs hover:border-blue-200/80 transition-colors">
                  <AccordionTrigger className="py-5 hover:no-underline">
                    <div className="flex flex-1 items-center gap-4 pr-2">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <Settings className="h-5 w-5 text-[#2563eb]" />
                      </div>
                      <span className="flex-1 text-left text-lg font-bold text-slate-900">Publicação</span>
                      <SpotSectionStatusIcon status="complete" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-2 border-t border-slate-100">
                    <div className="pt-4">
                      <SpotVisibilityToggle 
                        label="Visível no catálogo" 
                        checked={spot?.ativo ?? false}
                        onChange={(checked) => spotUuid && setSpotActive(spotUuid, checked)}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>

            {/* 3. Rodapé */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              {isSuccess ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                    <p className="text-emerald-800 font-bold text-sm">Ponto turístico cadastrado com sucesso!</p>
                  </div>
                  <Button 
                    onClick={() => navigate(`/vendedor/pontos/${spotUuid}`, { replace: true })}
                    className="w-full h-12 gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg"
                  >
                    Continuar editando
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={() => navigate('/vendedor')}
                    className="w-full h-12 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl"
                  >
                    Voltar ao painel
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full h-12 gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                  {isEditing ? "Salvar Alterações" : "Confirmar Cadastro"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Confirmação de Exclusão de Foto */}
      <Dialog open={photoToDelete !== null} onOpenChange={(open) => !open && setPhotoToDelete(null)}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 rounded-[2rem] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-xl font-bold">Excluir foto</DialogTitle>
            <DialogDescription className="text-slate-500">Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t border-slate-100 pt-4 flex flex-row gap-3">
            <Button variant="ghost" className="flex-1 text-slate-600" onClick={() => setPhotoToDelete(null)}>Cancelar</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold" onClick={handleDeletePhoto}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
