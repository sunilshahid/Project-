'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Lock, ShieldAlert, Key, User, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AuthView() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, signup, isUnlocking } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !identifier) return;
    if (mode === 'login') {
      await login(identifier, password);
    } else {
      await signup(identifier, password);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <ShieldAlert className="w-8 h-8 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">SkepticVault</h1>
          <p className="text-sm text-zinc-400">Zero-knowledge encrypted workspace.</p>
        </div>

        <Card className="bg-zinc-950 border-zinc-900 shadow-xl overflow-hidden p-1">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Username or Email</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter identifier..."
                    className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-zinc-100 h-10"
                    disabled={isUnlocking}
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Master Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'login' ? "Enter to decrypt..." : "Create a strong password..."}
                    className="pl-9 pr-10 bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-zinc-100 h-10"
                    disabled={isUnlocking}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white mt-4"
              disabled={isUnlocking || !password || !identifier}
            >
              {isUnlocking ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="mr-2"
                >
                  <Lock className="w-4 h-4" />
                </motion.div>
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              {isUnlocking ? (mode === 'login' ? 'Decrypting Vault...' : 'Creating Vault...') : (mode === 'login' ? 'Unlock Vault' : 'Create Vault')}
            </Button>
            
            <div className="pt-2 text-center">
              <button 
                type="button" 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
                disabled={isUnlocking}
              >
                {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
              </button>
            </div>
          </form>
        </Card>
        
        <p className="text-center text-xs text-zinc-600 mt-8 font-mono">
          AES-256-GCM • PBKDF2-HMAC-SHA256
        </p>
      </motion.div>
    </div>
  );
}
