import React, { useState } from 'react';
import { LayoutDashboard, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const RegisterPage: React.FC = () => {
    const { register, isLoading } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await register(
            formData.username,
            formData.name,
            formData.email,
            formData.password
        );
        if (success) {
            toast.success("Account created successfully! You are now logged in.");
            navigate('/');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6">
            {/* Decorative Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] login-blob-1 animate-float" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] login-blob-2 animate-pulse-glow" />

            <div className={cn(
                'w-full max-w-[460px] glass-panel rounded-3xl p-10 relative z-10 animate-fade-slide-up border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]'
            )}>
                {/* Logo */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 shadow-xl shadow-primary/20 -rotate-3 transition-transform hover:rotate-0">
                        <LayoutDashboard className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gradient outfit-font tracking-tight text-center">Join OpsWatch</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-2 uppercase tracking-[0.2em] text-center">Intelligence Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Full Name</label>
                        <input
                            type="text" name="name" value={formData.name}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 rounded-2xl border border-white/5 bg-white/5 text-sm text-foreground placeholder:text-muted-foreground focus:bg-white/10 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all outline-none"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Username</label>
                        <input
                            type="text" name="username" value={formData.username}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 rounded-2xl border border-white/5 bg-white/5 text-sm text-foreground placeholder:text-muted-foreground focus:bg-white/10 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all outline-none"
                            placeholder="johndoe"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Email</label>
                        <input
                            type="email" name="email" value={formData.email}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 rounded-2xl border border-white/5 bg-white/5 text-sm text-foreground placeholder:text-muted-foreground focus:bg-white/10 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all outline-none"
                            placeholder="name@company.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 pr-12 rounded-2xl border border-white/5 bg-white/5 text-sm text-foreground placeholder:text-muted-foreground focus:bg-white/10 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all outline-none"
                                placeholder="••••••••"
                                minLength={6}
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

                    <button
                        type="submit" disabled={isLoading}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl text-sm font-bold btn-interact cursor-pointer disabled:opacity-70 flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] mt-4"
                    >
                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account...</> : 'Launch Your Workspace'}
                    </button>
                </form>

                <p className="text-sm text-muted-foreground text-center mt-8">
                    Already part of the team?{' '}
                    <Link to="/login" className="font-bold text-primary hover:text-primary/80 transition-colors ml-1 underline underline-offset-4">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
