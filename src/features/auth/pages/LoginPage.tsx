import { useState } from 'react';
import { useAuthController } from '../hooks/useAuthController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { MapPin } from 'lucide-react';

export function LoginPage() {
  const {
    isLoading,
    error,
    message,
    clearError,
    clearMessage,
    handleLogin,
    handleLoginGoogle,
  } = useAuthController();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-8 relative overflow-hidden text-slate-900">
      {/* Elemento gráfico sutil com degradê elegante */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-xs z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563eb]"></div>
        </div>
      )}

      <div className="w-full max-w-md flex flex-col items-center z-10">
        {/* Bloco de Identidade */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-white border border-blue-100 rounded-[2rem] flex items-center justify-center mb-4 shadow-md shadow-blue-500/5">
            <MapPin className="w-10 h-10 text-[#2563eb]" />
          </div>
          <h1 className="text-slate-900 text-[24px] font-extrabold tracking-tight">Guia Tour</h1>
          <p className="text-slate-500 text-center mt-2 max-w-[280px] leading-relaxed text-sm">
            Sua vitrine digital.
          </p>
        </div>

        <div className="w-full space-y-4">
          <Button
            onClick={() => handleLoginGoogle()}
            className="w-full h-[50px] bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-base rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/25 border-none cursor-pointer"
          >
            <div className="bg-white p-1 rounded-md flex items-center justify-center shadow-xs">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            Entrar com Google
          </Button>

          <button
            onClick={() => window.open('https://wa.me/5524998564421', '_blank')}
            className="w-full py-2 text-slate-500 hover:text-[#2563eb] transition-colors text-sm font-medium bg-transparent border-none cursor-pointer"
          >
            Suporte
          </button>
        </div>

        {/* Formulário tradicional oculto */}
        <div className="w-full hidden flex-col space-y-4 mt-8">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white text-slate-900 border-slate-200"
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white text-slate-900 border-slate-200"
          />
          <Button
            onClick={() => handleLogin(email, password)}
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold"
          >
            Entrar
          </Button>
        </div>

        <footer className="mt-auto pt-12">
          <a
            href="https://guiatour.online"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium"
          >
            guiatour.online
          </a>
        </footer>
      </div>

      <Dialog open={!!error} onOpenChange={(open) => !open && clearError()}>
        <DialogContent className="bg-white text-slate-900 border-slate-200 shadow-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">{error?.title}</DialogTitle>
            <DialogDescription className="text-slate-500">
              {error?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={clearError} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!message} onOpenChange={(open) => !open && clearMessage()}>
        <DialogContent className="bg-white text-slate-900 border-slate-200 shadow-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">{message?.title}</DialogTitle>
            <DialogDescription className="text-slate-500">
              {message?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={clearMessage} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
