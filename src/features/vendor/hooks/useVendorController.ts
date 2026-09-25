import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { vendorService } from '../services/vendorService';
import type { CreateMerchantDTO } from '../types';

export function useVendorController() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Query para buscar comerciantes
  const {
    data: merchantsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['vendor', 'merchants', page],
    queryFn: () => vendorService.getMerchants(page, pageSize),
  });

  // Mutation para criar comerciante
  const createMerchantMutation = useMutation({
    mutationFn: (data: CreateMerchantDTO) => vendorService.createMerchant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', 'merchants'] });
      navigate('/vendedor');
    },
  });

  // Lógica para selecionar e navegar para o perfil do comerciante
  const selectMerchant = (id: string) => {
    // A rota existente para edição é /loja/:id/editar
    navigate(`/loja/${id}/editar`);
  };

  const handleCreateMerchant = async (data: CreateMerchantDTO) => {
    try {
      await createMerchantMutation.mutateAsync(data);
    } catch (err) {
      console.error('Erro ao criar comerciante:', err);
      throw err;
    }
  };

  return {
    merchants: merchantsData?.items || [],
    total: merchantsData?.total || 0,
    page,
    setPage,
    isLoading,
    isCreating: createMerchantMutation.isPending,
    error,
    createMerchant: handleCreateMerchant,
    selectMerchant,
    reload: refetch,
  };
}
