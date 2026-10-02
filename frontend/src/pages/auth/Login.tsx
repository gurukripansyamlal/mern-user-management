import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Store, ShieldCheck, UserCheck, Lock, Mail, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        const storedUser = localStorage.getItem('pos_user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        if (user?.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/staff/pos');
        }
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'staff') => {
    setError(null);
    setIsLoading(true);
    try {
      await quickDemoLogin(role);
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/staff/pos');
      }
    } catch (err: any) {
      setError('Failed to log in with demo account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 items-center justify-center shadow-xl shadow-emerald-500/20 mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            CloudHouse POS & Billing
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Enterprise Textile, Apparel & Retail Point of Sale
          </p>
        </div>

        {/* Card Box */}
        <div className="mt-8 bg-slate-800/80 backdrop-blur-xl border border-slate-700/70 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-200 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@posdemo.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full py-3 mt-2 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25"
            >
              Sign In to Terminal
            </Button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-6 border-t border-slate-700/60">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>One-Click Evaluator Demo Logins</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600/60 text-slate-200 hover:text-white transition text-xs font-semibold text-left"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="text-[11px] leading-tight font-bold">Admin Portal</div>
                  <div className="text-[9px] text-slate-400">Full Access</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('staff')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600/60 text-slate-200 hover:text-white transition text-xs font-semibold text-left"
              >
                <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-[11px] leading-tight font-bold">Staff Billing</div>
                  <div className="text-[9px] text-slate-400">POS & Sales</div>
                </div>
              </button>
            </div>

            <div className="mt-3 p-2 bg-slate-900/40 rounded-lg border border-slate-800 text-[10px] text-slate-400 font-mono space-y-0.5">
              <div>Admin: admin@posdemo.com | Admin@123</div>
              <div>Staff: staff@posdemo.com | Staff@123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
