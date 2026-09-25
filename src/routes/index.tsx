import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { PerfilLayout } from "../layouts/PerfilLayout";
import { PortfolioPage } from "../features/portfolio/pages/PortfolioPage";
import { MetricasPage } from "../features/portfolio/pages/MetricasPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { VendorRoute } from "../features/vendor/components/VendorRoute";
import VendorDashboardPage from "../features/vendor/pages/VendorDashboardPage";
import MerchantCreatePage from "../features/vendor/pages/MerchantCreatePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/vendedor",
    element: <VendorRoute />,
    children: [
      {
        index: true,
        element: <VendorDashboardPage />,
      },
      {
        path: "comerciantes/novo",
        element: <MerchantCreatePage />,
      },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/loja/:id",
        element: <PerfilLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="editar" replace />,
          },
          {
            path: "editar",
            element: <PortfolioPage />,
          },
          {
            path: "metricas",
            element: <MetricasPage />,
          },
        ],
      },
      {
        path: "/portfolio",
        element: <Navigate to="/loja/me/editar" replace />,
      },
      {
        path: "/dashboard",
        element: <Navigate to="/portfolio" replace />,
      },
      {
        path: "*",
        element: <Navigate to="/portfolio" replace />,
      },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
