import { AppRoutes } from './routes';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';
import './App.css';

function App() {
  // Substitua pelo seu CLIENT_ID real do Google
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "SEU_CLIENT_ID_AQUI";

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={clientId}>
        <AppRoutes />
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
