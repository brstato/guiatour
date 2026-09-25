import { ExternalLink, Edit2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Merchant } from "../types";

interface MerchantCardProps {
  merchant: Merchant;
  onEdit: (id: string) => void;
}

export function MerchantCard({ merchant, onEdit }: MerchantCardProps) {
  const publicUrl = `https://${merchant.id}.guiatour.online`; // Ajustar se houver slug

  return (
    <Card className="overflow-hidden border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-bold text-slate-800 line-clamp-1">
            {merchant.nome}
          </CardTitle>
          <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            merchant.ativo ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'
          }`}>
            {merchant.ativo ? 'Ativo' : 'Inativo'}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{merchant.cidade} • {merchant.uf}</span>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="text-xs text-slate-400 font-medium uppercase tracking-tight">
          Categoria
        </div>
        <div className="text-sm text-slate-600 font-medium">
          {merchant.categoria || 'Não informada'}
        </div>
      </CardContent>

      <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-3 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 h-9 gap-2 text-slate-600 border-slate-200 hover:bg-white"
          onClick={() => onEdit(merchant.id)}
        >
          <Edit2 className="h-3.5 w-3.5" />
          Editar
        </Button>
        <a 
          href={publicUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-none"
        >
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 w-9 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
