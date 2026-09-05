import { AppRoutes } from './routes';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

function App() {
  // Substitua pelo seu CLIENT_ID real do Google
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "SEU_CLIENT_ID_AQUI";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AppRoutes />
    </GoogleOAuthProvider>
  );
}

export default App;
