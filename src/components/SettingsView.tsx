import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Settings as SettingsIcon,
  DollarSign,
  Compass,
  Database,
  RotateCcw,
  Check,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { UserSettings } from '../types';

import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetData: () => void;
  onLoadSampleData: () => void;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar (AU$)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham (AED)' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
  onLoadSampleData,
}) => {
  const [totalBudget, setTotalBudget] = useState(String(settings.totalBudget));
  const [savedToast, setSavedToast] = useState(false);

  const handleSaveBudgets = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      totalBudget: parseFloat(totalBudget) || 15000,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Card */}
      <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#161616] text-[#c4b5a1] border border-[#262626] flex items-center justify-center">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-serif italic text-white tracking-tight">App Preferences & Sync</h2>
            <p className="text-xs text-[#e5e5e5]/40 mt-0.5">
              Customize currency, daily allowance target, and spin menu corner position
            </p>
          </div>
        </div>
      </div>

      {/* Currency & Financial Targets */}
      <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a]">
        <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c4b5a1] mb-4">Currency & Targets</h3>

        <div className="space-y-5">
          {/* Currency Selector */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#e5e5e5]/60 mb-2">
              Display Currency & Symbol
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      currency: c.code,
                      currencySymbol: c.symbol,
                    })
                  }
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    settings.currency === c.code
                      ? 'bg-[#c4b5a1] text-[#0a0a0a] border-[#c4b5a1] font-bold shadow-xs'
                      : 'bg-[#141414] text-[#e5e5e5]/70 border-[#222222] hover:bg-[#1c1c1c] hover:text-white'
                  }`}
                >
                  <div className="text-xs font-mono font-bold">{c.symbol}</div>
                  <div className="text-xs truncate mt-0.5">{c.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Daily and Monthly Target Form */}
          <form onSubmit={handleSaveBudgets} className="space-y-4 pt-4 border-t border-[#1a1a1a]">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="settings-total-budget-input" className="block text-[10px] uppercase tracking-wider font-semibold text-[#e5e5e5]/60 mb-1">
                  Total Budget ({settings.currencySymbol})
                </label>
                <input
                  id="settings-total-budget-input"
                  type="number"
                  step="1"
                  min="1"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#222222] rounded-lg text-xs text-[#e5e5e5] focus:outline-hidden focus:border-[#c4b5a1] font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="settings-save-budget-btn"
                type="submit"
                className="px-5 py-2.5 bg-[#c4b5a1] hover:bg-[#d8ccbc] text-[#0a0a0a] rounded-lg text-[11px] uppercase tracking-widest font-bold shadow-sm transition-all cursor-pointer"
              >
                Save Budget Targets
              </button>

              {savedToast && (
                <span className="text-xs font-mono font-medium text-emerald-400 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>Targets Saved!</span>
                </span>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Spin Menu Corner Position Preference */}
      <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a]">
        <div className="flex items-center gap-2 mb-4">
          <Compass className="w-5 h-5 text-[#c4b5a1]" />
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c4b5a1]">Spin-to-Open Menu Corner</h3>
        </div>
        <p className="text-xs text-[#e5e5e5]/40 mb-4">
          Choose which screen corner hosts the floating spin dial navigation button:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(
            [
              { pos: 'bottom-right', label: 'Bottom-Right' },
              { pos: 'bottom-left', label: 'Bottom-Left' },
              { pos: 'top-right', label: 'Top-Right' },
              { pos: 'top-left', label: 'Top-Left' },
            ] as const
          ).map((item) => (
            <button
              key={item.pos}
              type="button"
              onClick={() => onUpdateSettings({ cornerPosition: item.pos })}
              className={`p-3 rounded-xl border text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                settings.cornerPosition === item.pos
                  ? 'bg-[#c4b5a1] text-[#0a0a0a] border-[#c4b5a1] shadow-xs font-bold'
                  : 'bg-[#141414] text-[#e5e5e5]/60 border-[#222222] hover:bg-[#1a1a1a] hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Persistence & Data Health */}
      <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a]">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-5 h-5 text-[#c4b5a1]" />
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c4b5a1]">Cloud Sync & Account</h3>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 flex items-center gap-3 text-xs text-[#e5e5e5]/80 mb-5">
          <ShieldCheck className="w-5 h-5 text-[#c4b5a1] shrink-0" />
          <div className="flex flex-col gap-1">
            <span>
              Your data is securely synced to Firebase Cloud. All expense entries, custom categories, and calculations are
              automatically saved in real-time.
            </span>
            <span className="font-mono text-[10px] text-[#e5e5e5]/50 mt-1">
              Logged in as: {auth.currentUser?.email || 'Unknown User'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={async () => {
              if (confirm('Are you sure you want to log out?')) {
                await signOut(auth);
              }
            }}
            className="px-4 py-2.5 bg-[#161616] hover:bg-[#222222] text-[#c4b5a1] border border-[#2a2a2a] rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Log Out
          </button>

          <button
            onClick={() => {
              const confirmText = prompt("Are you sure you wanna delete? If yes, type below the sentence:\nyes i wanna delete");
              if (confirmText === 'yes i wanna delete') {
                onResetData();
              }
            }}
            className="px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-900/50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
};
