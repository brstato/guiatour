import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { billingService } from "../services/billingService";
import type { CheckoutPayload } from "../types";

const WAITING_PAYMENT = ["PENDENTE", "INADIMPLENTE"];

export function useBilling(lojaId?: string) {
  const queryClient = useQueryClient();
  const scope = lojaId ?? "me";

  const plans = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: () => billingService.listPlans(),
    staleTime: 1000 * 60 * 10,
  });

  const status = useQuery({
    queryKey: ["billing", "status", scope],
    queryFn: () => billingService.getStatus(lojaId),
    staleTime: 0,
    refetchInterval: (query) =>
      query.state.data && WAITING_PAYMENT.includes(query.state.data.status) ? 5000 : false,
  });

  const checkout = useMutation({
    mutationFn: (payload: Omit<CheckoutPayload, "id_loja">) =>
      billingService.checkout({ ...payload, id_loja: lojaId }),
    onSuccess: (data) => {
      if (data.pix) queryClient.setQueryData(["billing", "pix", scope], data.pix);
      queryClient.invalidateQueries({ queryKey: ["billing", "status", scope] });
    },
  });

  const cancel = useMutation({
    mutationFn: () => billingService.cancel(lojaId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["billing", "pix", scope] });
      queryClient.invalidateQueries({ queryKey: ["billing", "status", scope] });
    },
  });

  return { plans, status, checkout, cancel };
}

export function usePix(lojaId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["billing", "pix", lojaId ?? "me"],
    queryFn: () => billingService.getPix(lojaId),
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });
}
