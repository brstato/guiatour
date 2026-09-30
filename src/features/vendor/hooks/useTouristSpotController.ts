import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { touristSpotService } from '../services/touristSpotService';
import type { SaveTouristSpotDTO } from '../types';

export function useTouristSpotController(uuid?: string) {
  const queryClient = useQueryClient();

  // Lista de pontos para o dashboard
  const {
    data: spots,
    isLoading: isLoadingSpots,
    refetch: reloadSpots,
  } = useQuery({
    queryKey: ['vendor', 'spots'],
    queryFn: () => touristSpotService.listSpots(),
  });

  // Categorias (staleTime alto pois mudam pouco)
  const {
    data: categories,
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ['vendor', 'spot-categories'],
    queryFn: () => touristSpotService.listCategories(),
    staleTime: 1000 * 60 * 60, // 1 hora
  });

  // Detalhe de um ponto específico
  const {
    data: spot,
    isLoading: isLoadingSpot,
    refetch: reloadSpot,
  } = useQuery({
    queryKey: ['vendor', 'spot', uuid],
    queryFn: () => touristSpotService.getSpot(uuid!),
    enabled: !!uuid,
  });

  // Mutation para criar ponto
  const createSpotMutation = useMutation({
    mutationFn: (data: SaveTouristSpotDTO) => touristSpotService.createSpot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', 'spots'] });
    },
  });

  // Mutation para atualizar ponto
  const updateSpotMutation = useMutation({
    mutationFn: (data: SaveTouristSpotDTO) => touristSpotService.updateSpot(uuid!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', 'spots'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', 'spot', uuid] });
    },
  });

  // Mutation para ativar/desativar
  const setActiveMutation = useMutation({
    mutationFn: ({ uuid, ativo }: { uuid: string; ativo: boolean }) => 
      touristSpotService.setActive(uuid, ativo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor', 'spots'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', 'spot', variables.uuid] });
    },
  });

  // Mutation para remover foto
  const removePhotoMutation = useMutation({
    mutationFn: (photoId: number) => touristSpotService.removePhoto(uuid!, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', 'spot', uuid] });
    },
  });

  const handleCreate = async (data: SaveTouristSpotDTO) => {
    try {
      return await createSpotMutation.mutateAsync(data);
    } catch (err) {
      console.error('Erro ao criar ponto turístico:', err);
      throw err;
    }
  };

  const handleUpdate = async (data: SaveTouristSpotDTO) => {
    try {
      return await updateSpotMutation.mutateAsync(data);
    } catch (err) {
      console.error('Erro ao atualizar ponto turístico:', err);
      throw err;
    }
  };

  const handleSetActive = async (uuid: string, ativo: boolean) => {
    try {
      return await setActiveMutation.mutateAsync({ uuid, ativo });
    } catch (err) {
      console.error('Erro ao alterar status do ponto turístico:', err);
      throw err;
    }
  };

  const handleRemovePhoto = async (photoId: number) => {
    try {
      return await removePhotoMutation.mutateAsync(photoId);
    } catch (err) {
      console.error('Erro ao remover foto do ponto turístico:', err);
      throw err;
    }
  };

  return {
    spots: spots || [],
    isLoadingSpots,
    categories: categories || [],
    isLoadingCategories,
    spot,
    isLoadingSpot,
    createSpot: handleCreate,
    updateSpot: handleUpdate,
    setSpotActive: handleSetActive,
    removeSpotPhoto: handleRemovePhoto,
    isSaving: createSpotMutation.isPending || updateSpotMutation.isPending,
    isRemovingPhoto: removePhotoMutation.isPending,
    isSettingActive: setActiveMutation.isPending,
    reloadSpots,
    reloadSpot,
  };
}
