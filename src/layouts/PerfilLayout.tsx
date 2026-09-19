import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { usePortfolioController } from "@/features/portfolio/hooks/usePortfolioController";
import { useAccountController } from "@/features/settings/hooks/useAccountController";
import { TabBar } from "@/components/TabBar";

export function PerfilLayout() {
    const { id } = useParams();
    const {
        loadData: loadPortfolio,
        isLoading: loadingPortfolio,
    } = usePortfolioController();

    const {
        loadData: loadAccount,
        isLoading: loadingAccount,
    } = useAccountController();

    useEffect(() => {
        const userId = id === "me" ? localStorage.getItem("id") : id;
        if (userId) {
            loadAccount(userId);
            loadPortfolio(userId);
        }
    }, [id, loadAccount, loadPortfolio]);

    if (loadingPortfolio || loadingAccount) {
        return (
            <div className="flex items-center justify-center p-8 min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563eb]"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Conteúdo da Aba */}
            <div className="flex-1 overflow-y-auto">
                <Outlet />
            </div>

            {/* Tab Bar */}
            <TabBar />
        </div>
    );
}
