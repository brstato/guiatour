import { useEffect, useState } from "react";
import { CirclePlay, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { normalizarUrlYoutube, youtubeId, youtubeThumb } from "@/lib/youtube";

interface VideoUrlFieldProps {
  /** URL salva hoje ("" ou undefined = sem vídeo). */
  value: string | undefined;
  /**
   * Salva a URL já normalizada ("" remove o vídeo).
   * Devolve a mensagem de erro para mostrar, ou null se deu certo.
   */
  onSave: (url: string) => Promise<string | null> | string | null;
}

/**
 * Campo "Vídeo do YouTube" usado no painel do comerciante, no cadastro feito pelo
 * vendedor e no ponto turístico. Valida com a mesma regra das páginas públicas,
 * salva ao sair do campo e mostra a miniatura do vídeo salvo.
 */
export function VideoUrlField({ value, onSave }: VideoUrlFieldProps) {
  const [texto, setTexto] = useState(value || "");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setTexto(value || "");
  }, [value]);

  const id = youtubeId(value);

  const salvar = async (url: string) => {
    setSalvando(true);
    try {
      const msg = await onSave(url);
      setErro(msg);
      if (!msg) setTexto(url);
    } catch {
      setErro("Não foi possível salvar o vídeo. Tente de novo.");
    } finally {
      setSalvando(false);
    }
  };

  const handleBlur = () => {
    const url = normalizarUrlYoutube(texto);
    if (url === null) {
      setErro("Cole o link de um vídeo do YouTube (ex.: https://youtu.be/...).");
      return;
    }
    if (url === (value || "")) {
      setErro(null);
      setTexto(url);
      return;
    }
    void salvar(url);
  };

  return (
    <div className="mb-3.5 last:mb-0">
      <div className="flex justify-between items-center mb-1">
        <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">
          Vídeo do YouTube
        </p>
        {salvando && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
      </div>

      <Input
        type="url"
        inputMode="url"
        value={texto}
        maxLength={1000}
        placeholder="Opcional. Cole o link do vídeo (youtube.com ou youtu.be)"
        aria-label="Link do vídeo do YouTube"
        aria-invalid={erro ? true : undefined}
        disabled={salvando}
        onChange={(e) => {
          setTexto(e.target.value);
          if (erro) setErro(null);
        }}
        onBlur={handleBlur}
        className={cn(
          "bg-transparent border-none p-0 h-auto text-sm font-semibold focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-[#2563eb] rounded-none transition-none shadow-none text-slate-900 placeholder:text-slate-400",
          erro && "text-red-500 border-b-2 border-red-500"
        )}
      />

      {erro && (
        <p role="alert" className="text-[10px] text-red-500 font-bold mt-1">
          {erro}
        </p>
      )}

      {id && !erro && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2">
          <a
            href={`https://www.youtube.com/watch?v=${id}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir o vídeo no YouTube"
            className="relative block w-28 shrink-0 overflow-hidden rounded-xl bg-slate-200 aspect-video"
          >
            <img src={youtubeThumb(id)} alt="" loading="lazy" className="h-full w-full object-cover" />
            <CirclePlay className="absolute inset-0 m-auto h-8 w-8 text-white drop-shadow" />
          </a>
          <p className="flex-1 text-xs text-slate-500 leading-relaxed">
            O vídeo aparece na página pública e toca na própria página, sem sugerir outros vídeos no final.
          </p>
          <button
            type="button"
            onClick={() => void salvar("")}
            disabled={salvando}
            aria-label="Remover vídeo"
            title="Remover vídeo"
            className="p-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
