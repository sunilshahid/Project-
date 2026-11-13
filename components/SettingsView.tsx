'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Shield,
  Key,
  Lock,
  Download,
  Sparkles,
  Check,
  Eye,
  EyeOff,
  Clock,
  Database,
} from 'lucide-react';
import { toast } from 'sonner';

export function SettingsView() {
  const {
    autoLockMinutes,
    setAutoLockMinutes,
    changePassword,
    exportVaultJson,
    notes,
    userHash,
  } = useStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please enter both your current and new password.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    const success = await changePassword(currentPassword, newPassword);
    setIsChangingPassword(false);
    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleExportJson = () => {
    try {
      const data = exportVaultJson();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skeptic-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Vault backup exported successfully.');
    } catch (err) {
      toast.error('Failed to export vault.');
    }
  };

  const handleExportEncrypted = () => {
    if (!userHash) return;
    const encryptedRaw = localStorage.getItem(`vault_${userHash}`);
    const saltRaw = localStorage.getItem(`salt_${userHash}`);
    if (!encryptedRaw) {
      toast.error('No encrypted vault data found.');
      return;
    }
    const payload = JSON.stringify({
      version: 2,
      salt: saltRaw,
      vault: JSON.parse(encryptedRaw),
      exportedAt: new Date().toISOString(),
    });
    const blob = new Blob([payload], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skeptic-vault-encrypted-${new Date().toISOString().slice(0, 10)}.svault`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Zero-knowledge encrypted .svault file exported.');
  };

  return (
    <div className="flex flex-col h-full bg-black text-white p-4 sm:p-8 max-w-4xl mx-auto w-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Vault Settings</h1>
        <p className="text-sm text-zinc-400">
          Manage zero-knowledge cryptographic parameters, session timeouts, and AI integrations.
        </p>
      </div>

      <div className="space-y-6 pb-16">
        {/* Security Parameters Card */}
        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Cryptographic Standards</h2>
              <p className="text-xs text-zinc-400">Zero-knowledge client-side encryption specifications</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase font-mono">Symmetric Cipher</span>
              <span className="text-emerald-400 font-semibold font-mono mt-0.5 block">AES-256-GCM</span>
            </div>
            <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase font-mono">Key Derivation</span>
              <span className="text-emerald-400 font-semibold font-mono mt-0.5 block">PBKDF2-HMAC-SHA256</span>
            </div>
            <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase font-mono">KDF Iterations</span>
              <span className="text-emerald-400 font-semibold font-mono mt-0.5 block">600,000 Rounds</span>
            </div>
          </div>
        </div>

        {/* Inactivity Auto-Lock */}
        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Inactivity Auto-Lock</h2>
              <p className="text-xs text-zinc-400">
                Automatically purge decrypted keys and lock the vault after inactivity.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {[5, 15, 30, 60, 0].map((mins) => (
              <button
                key={mins}
                onClick={() => setAutoLockMinutes(mins)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  autoLockMinutes === mins
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {mins === 0 ? 'Never (Manual)' : `${mins} Minutes`}
              </button>
            ))}
          </div>
        </div>

        {/* Local Epistemic Logic Engine */}
        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Local Epistemic Logic Engine</h2>
              <p className="text-xs text-zinc-400">
                100% private, zero-knowledge argument analysis, steelmanning, and fallacy detection.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Execution Mode:</span>
              <span className="text-emerald-400 font-semibold font-mono">100% Client-Side / Offline</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">External Network Telemetry:</span>
              <span className="text-emerald-400 font-semibold font-mono">None (Zero Leaks)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Taxonomy Rules:</span>
              <span className="text-zinc-200 font-mono">21 Canonical Fallacies & Biases</span>
            </div>
          </div>
        </div>

        {/* Change Master Password */}
        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-300">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Change Master Password</h2>
              <p className="text-xs text-zinc-400">
                Re-encrypts the entire vault with a new salt and derived key.
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3 max-w-md pt-2">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Current Master Password</label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password..."
                className="bg-zinc-900 border-zinc-800 text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">New Master Password</label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters..."
                className="bg-zinc-900 border-zinc-800 text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Confirm New Password</label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password..."
                className="bg-zinc-900 border-zinc-800 text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPassword ? 'Hide characters' : 'Show characters'}
              </button>

              <Button
                type="submit"
                disabled={isChangingPassword}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
              >
                {isChangingPassword ? 'Re-encrypting Vault...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>

        {/* Vault Export & Backups */}
        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-900 text-zinc-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Vault Backup & Portability</h2>
              <p className="text-xs text-zinc-400">
                You own your data. Export your vault anytime ({notes.length} total items).
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleExportEncrypted}
              className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-200 gap-2 justify-start sm:justify-center"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Download Encrypted Backup (.svault)
            </Button>

            <Button
              variant="outline"
              onClick={handleExportJson}
              className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-200 gap-2 justify-start sm:justify-center"
            >
              <Download className="w-4 h-4 text-zinc-400" />
              Export Decrypted JSON
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
