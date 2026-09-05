import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { PortfolioPage } from "../features/portfolio/pages/PortfolioPage";
import { LoginPage } from "../features/auth/pages/LoginPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/portfolio",
        element: <PortfolioPage />,
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
