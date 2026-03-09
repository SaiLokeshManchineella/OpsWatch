import React, { useState } from 'react';
import { LayoutDashboard, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (!success) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] login-blob-1 animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] login-blob-2 animate-pulse-glow" />

      <div className={cn(
        'w-full max-w-[440px] glass-panel rounded-3xl p-10 relative z-10 animate-fade-slide-up border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]',
        shaking && 'animate-shake'
      )}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 shadow-xl shadow-primary/20 rotate-3 transition-transform hover:rotate-6">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gradient outfit-font tracking-tight">OpsWatch</h1>
          <p className="text-sm font-medium text-muted-foreground mt-2 uppercase tracking-[0.2em]">Operations Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Username</label>
            <input
              type="text" value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border border-white/5 bg-white/5 text-sm text-foreground placeholder:text-muted-foreground focus:bg-white/10 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all outline-none"
              placeholder="admin"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 pr-12 rounded-2xl border border-white/5 bg-white/5 text-sm text-foreground placeholder:text-muted-foreground focus:bg-white/10 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all outline-none"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20">
              <p className="text-xs text-danger font-bold text-center tracking-wide">{error}</p>
            </div>
          )}

          <button
            type="submit" disabled={isLoading}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl text-sm font-bold btn-interact cursor-pointer disabled:opacity-70 flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]"
          >
            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</> : 'Sign In to Portal'}
          </button>
        </form>

        <div className="mt-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-white/5" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Demo Access</span>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          <p className="text-xs text-muted-foreground text-center">
            User: <span className="text-foreground font-bold ml-1">admin</span>
            <span className="mx-2 opacity-30">|</span>
            Pass: <span className="text-foreground font-bold ml-1">admin123</span>
          </p>

          <p className="text-sm text-muted-foreground text-center pt-2">
            New to the platform?{' '}
            <Link to="/register" className="font-bold text-primary hover:text-primary/80 transition-colors ml-1 underline underline-offset-4">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
