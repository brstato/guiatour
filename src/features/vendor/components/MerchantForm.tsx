import { useState } from "react";
import { Loader2, Store, MapPin, Contact } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateMerchantDTO } from "../types";
import type { Categoria } from "@/types/api";

interface MerchantFormProps {
  onSubmit: (data: CreateMerchantDTO) => Promise<void>;
  isLoading: boolean;
  categorias?: Categoria[];
}

export function MerchantForm({ onSubmit, isLoading, categorias = [] }: MerchantFormProps) {
  const [formData, setFormData] = useState<Partial<CreateMerchantDTO>>({
    nome: "",
    email: "",
    telefone: "",
    id_categoria: undefined,
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'id_categoria' ? (value ? parseInt(value) : undefined) : value 
    }));
    
    // Limpa erro ao digitar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome) newErrors.nome = "Nome é obrigatório";
    if (!formData.id_categoria) newErrors.id_categoria = "Categoria é obrigatória";
    if (!formData.email) newErrors.email = "E-mail é obrigatório";
    if (!formData.telefone) newErrors.telefone = "Telefone é obrigatório";
    if (!formData.cep) newErrors.cep = "CEP é obrigatório";
    if (!formData.endereco) newErrors.endereco = "Endereço é obrigatório";
    if (!formData.numero) newErrors.numero = "Número é obrigatório";
    if (!formData.bairro) newErrors.bairro = "Bairro é obrigatório";
    if (!formData.cidade) newErrors.cidade = "Cidade é obrigatório";
    if (!formData.estado) newErrors.estado = "Estado é obrigatório";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await onSubmit(formData as CreateMerchantDTO);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Bloco: Identificação */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <Contact className="h-5 w-5" />
          <h3 className="font-bold text-lg">Identificação e Contato</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Comércio *</Label>
            <Input 
              id="nome" 
              name="nome"
              placeholder="Ex: Pizzaria do Bairro"
              value={formData.nome}
              onChange={handleChange}
              className={errors.nome ? "border-red-500" : ""}
            />
            {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="id_categoria">Categoria *</Label>
            <select
              id="id_categoria"
              name="id_categoria"
              value={formData.id_categoria || ""}
              onChange={handleChange}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.id_categoria ? "border-red-500" : ""}`}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((cat) => (
                <option key={cat.categoria_id} value={cat.categoria_id}>
                  {cat.categoria_nome}
                </option>
              ))}
            </select>
            {errors.id_categoria && <p className="text-xs text-red-500">{errors.id_categoria}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail de Contato *</Label>
            <Input 
              id="email" 
              name="email"
              type="email"
              placeholder="comercio@email.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone / WhatsApp *</Label>
            <Input 
              id="telefone" 
              name="telefone"
              placeholder="(00) 00000-0000"
              value={formData.telefone}
              onChange={handleChange}
              className={errors.telefone ? "border-red-500" : ""}
            />
            {errors.telefone && <p className="text-xs text-red-500">{errors.telefone}</p>}
          </div>
        </div>
      </div>

      {/* Bloco: Endereço */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <MapPin className="h-5 w-5" />
          <h3 className="font-bold text-lg">Endereço</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 space-y-2">
            <Label htmlFor="cep">CEP *</Label>
            <Input 
              id="cep" 
              name="cep"
              placeholder="00000-000"
              value={formData.cep}
              onChange={handleChange}
              className={errors.cep ? "border-red-500" : ""}
            />
            {errors.cep && <p className="text-xs text-red-500">{errors.cep}</p>}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="endereco">Logradouro (Rua/Av) *</Label>
            <Input 
              id="endereco" 
              name="endereco"
              placeholder="Rua das Flores"
              value={formData.endereco}
              onChange={handleChange}
              className={errors.endereco ? "border-red-500" : ""}
            />
            {errors.endereco && <p className="text-xs text-red-500">{errors.endereco}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero">Número *</Label>
            <Input 
              id="numero" 
              name="numero"
              placeholder="123"
              value={formData.numero}
              onChange={handleChange}
              className={errors.numero ? "border-red-500" : ""}
            />
            {errors.numero && <p className="text-xs text-red-500">{errors.numero}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="complemento">Complemento</Label>
            <Input 
              id="complemento" 
              name="complemento"
              placeholder="Sala 101"
              value={formData.complemento}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bairro">Bairro *</Label>
            <Input 
              id="bairro" 
              name="bairro"
              placeholder="Centro"
              value={formData.bairro}
              onChange={handleChange}
              className={errors.bairro ? "border-red-500" : ""}
            />
            {errors.bairro && <p className="text-xs text-red-500">{errors.bairro}</p>}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="cidade">Cidade *</Label>
            <Input 
              id="cidade" 
              name="cidade"
              placeholder="Nome da Cidade"
              value={formData.cidade}
              onChange={handleChange}
              className={errors.cidade ? "border-red-500" : ""}
            />
            {errors.cidade && <p className="text-xs text-red-500">{errors.cidade}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">UF *</Label>
            <Input 
              id="estado" 
              name="estado"
              placeholder="SP"
              maxLength={2}
              value={formData.estado}
              onChange={handleChange}
              className={errors.estado ? "border-red-500" : ""}
            />
            {errors.estado && <p className="text-xs text-red-500">{errors.estado}</p>}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full md:w-auto md:min-w-[200px] gap-2 bg-blue-600 hover:bg-blue-700 h-12 shadow-md shadow-blue-100"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Store className="h-4 w-4" />
              Cadastrar Comerciante
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
