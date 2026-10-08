import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorService } from '../services/vendorService';
import type { CreateMerchantDTO } from '../types';

export function useVendorController() {
  const queryClient = useQueryClient();

  // Lista de comércios do vendedor (painel)
  const {
    data: vendorMerchants,
    isLoading: isLoadingVendorMerchants,
    refetch: refetchVendorMerchants,
  } = useQuery({
    queryKey: ['vendor', 'comercios'],
    queryFn: () => vendorService.listMerchants(),
  });

  // Mutation para criar comerciante
  const createMerchantMutation = useMutation({
    mutationFn: (data: CreateMerchantDTO) => vendorService.createMerchant(data),
    onSuccess: () => {
      // atualiza a lista "Comércios Criados" do painel
      queryClient.invalidateQueries({ queryKey: ['vendor', 'comercios'] });
    },
  });

  const handleCreateMerchant = async (data: CreateMerchantDTO) => {
    try {
      return await createMerchantMutation.mutateAsync(data);
    } catch (err) {
      console.error('Erro ao criar comerciante:', err);
      throw err;
    }
  };

  return {
    isLoadingVendorMerchants,
    vendorMerchants: vendorMerchants || [],
    isCreating: createMerchantMutation.isPending,
    createMerchant: handleCreateMerchant,
    reloadVendorMerchants: refetchVendorMerchants,
  };
}
