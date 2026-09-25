import { Navigate, Outlet } from 'react-router-dom';

export function VendorRoute() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role')?.trim().toLowerCase();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (role !== 'vendedor') {
    // Se for comerciante ou outro papel, redireciona para a home ou dashboard padrão
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
