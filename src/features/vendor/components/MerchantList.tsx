import { MerchantCard } from "./MerchantCard";
import type { Merchant } from "../types";

interface MerchantListProps {
  merchants: Merchant[];
  onEdit: (id: string) => void;
}

export function MerchantList({ merchants, onEdit }: MerchantListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {merchants.map((merchant) => (
        <MerchantCard 
          key={merchant.id} 
          merchant={merchant} 
          onEdit={onEdit} 
        />
      ))}
    </div>
  );
}
