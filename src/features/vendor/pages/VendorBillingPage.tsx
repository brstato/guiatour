import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VendorHeader } from "../components/VendorHeader";
import { BillingPage } from "@/features/billing/pages/BillingPage";

export default function VendorBillingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <VendorHeader />

      <div className="max-w-2xl mx-auto w-full px-6 pt-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/vendedor")}
          className="gap-2 text-slate-600 hover:text-slate-900 mb-2 pl-0"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao painel
        </Button>
      </div>

      <main className="flex-1">
        <BillingPage />
      </main>
    </div>
  );
}
