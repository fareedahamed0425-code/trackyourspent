import React from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Calendar,
  Wallet,
  Plus,
  ArrowRight,
  Download,
  Calculator,
  FolderTree,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Category, Expense, UserSettings } from '../types';
import { formatCurrency, formatDateDisplay } from '../utils/helpers';
import { getTodayDateString } from '../utils/storage';
import { CategoryIcon } from './CategoryIcon';

interface DashboardViewProps {
  expenses: Expense[];
  categories: Category[];
  settings: UserSettings;
  onNavigateToTab: (tab: 'daily' | 'categories' | 'calculator' | 'history' | 'export') => void;
  onSelectDate: (date: string) => void;
  onOpenAddExpense: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  expenses,
  categories,
  settings,
  onNavigateToTab,
  onSelectDate,
  onOpenAddExpense,
}) => {
  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));
  const todayStr = getTodayDateString();

  // Today's total
  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const todaySpent = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Month-to-date total
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthPrefix));
  const monthSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Last 7 days breakdown
  const last7Days: { date: string; label: string; spent: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Yest' : d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const daySum = expenses.filter((e) => e.date === dateStr).reduce((sum, e) => sum + e.amount, 0);
    last7Days.push({ date: dateStr, label: dayName, spent: daySum });
  }

  const max7DaySpend = Math.max(...last7Days.map((d) => d.spent), settings.dailyBudget, 1);

  // Category totals for this month
  const categoryTotals: { [catId: string]: number } = {};
  monthExpenses.forEach((e) => {
    categoryTotals[e.categoryId] = (categoryTotals[e.categoryId] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Welcome / Architecture Banner */}
      <div className="bg-[#0d0d0d] rounded-2xl p-6 sm:p-8 text-[#e5e5e5] border border-[#1a1a1a] relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#c4b5a1]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase font-semibold tracking-[0.2em] text-[#c4b5a1] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Expense Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif italic text-white tracking-tight">
              trackyourspent Ledger
            </h1>
            <p className="text-xs sm:text-sm text-[#e5e5e5]/60 mt-1.5 max-w-lg font-light leading-relaxed">
              Track day-by-day cashflow, organize personal categories, calculate projections, and generate financial reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dashboard-record-expense-btn"
              onClick={onOpenAddExpense}
              className="px-5 py-2.5 bg-[#c4b5a1] hover:bg-[#d8ccbc] active:scale-98 text-[#0a0a0a] font-bold text-[11px] uppercase tracking-widest rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Record Expense</span>
            </button>

            <button
              id="dashboard-open-calc-btn"
              onClick={() => onNavigateToTab('calculator')}
              className="px-4 py-2.5 bg-[#141414] hover:bg-[#1a1a1a] text-[#e5e5e5] font-semibold text-[11px] uppercase tracking-wider rounded-lg border border-[#262626] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-[#c4b5a1]" />
              <span>Auto Calculator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Today's Spend */}
        <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold text-[#e5e5e5]/40 tracking-[0.2em]">
                Daily Expenditure
              </span>
              <span className="text-[10px] bg-[#141414] border border-[#222222] text-[#c4b5a1] px-2 py-0.5 rounded-sm font-mono">
                {formatDateDisplay(todayStr)}
              </span>
            </div>
            <div className="text-3xl font-light text-white mt-3 tracking-tight">
              {formatCurrency(todaySpent, settings.currencySymbol)}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#1a1a1a] flex items-center justify-between text-xs text-[#e5e5e5]/50">
            <span>Budget: {formatCurrency(settings.dailyBudget, settings.currencySymbol)}</span>
            <span
              className={`font-medium ${
                todaySpent <= settings.dailyBudget ? 'text-[#c4b5a1]' : 'text-rose-400'
              }`}
            >
              {todaySpent <= settings.dailyBudget
                ? `${formatCurrency(settings.dailyBudget - todaySpent, settings.currencySymbol)} under`
                : 'Over budget'}
            </span>
          </div>
        </div>

        {/* This Month's Total */}
        <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold text-[#e5e5e5]/40 tracking-[0.2em]">
                Monthly Total
              </span>
              <span className="text-[10px] bg-[#141414] border border-[#222222] text-[#c4b5a1] px-2 py-0.5 rounded-sm font-mono">
                {now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="text-3xl font-light text-[#c4b5a1] mt-3 tracking-tight">
              {formatCurrency(monthSpent, settings.currencySymbol)}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#1a1a1a] flex items-center justify-between text-xs text-[#e5e5e5]/50">
            <span>{monthExpenses.length} entries</span>
            <span>Target: {formatCurrency(settings.monthlyBudget, settings.currencySymbol)}</span>
          </div>
        </div>

        {/* Quick Export / Download Launcher */}
        <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold text-[#e5e5e5]/40 tracking-[0.2em]">
                Data & Ledger
              </span>
              <Download className="w-4 h-4 text-[#c4b5a1]" />
            </div>
            <div className="text-lg font-light text-white mt-3">
              {expenses.length} Records Documented
            </div>
            <p className="text-xs text-[#e5e5e5]/40 mt-1 font-light">
              Export CSV spreadsheets, print ledger statements, or sync JSON.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-[#1a1a1a]">
            <button
              onClick={() => onNavigateToTab('export')}
              className="w-full py-2 bg-[#141414] hover:bg-[#1a1a1a] text-[#c4b5a1] border border-[#222222] rounded-lg text-[11px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Download Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 7-Day Interactive Bar Chart & Category Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Day-wise Chart (7 cols) */}
        <div className="lg:col-span-7 bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c4b5a1]">
                Daily Variance (7 Days)
              </h3>
              <p className="text-xs text-[#e5e5e5]/40 mt-0.5">Click any day to inspect itemized ledger</p>
            </div>
            <button
              onClick={() => onNavigateToTab('daily')}
              className="text-xs uppercase tracking-wider font-semibold text-[#c4b5a1] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Day View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bar Chart Representation */}
          <div className="flex items-end justify-between gap-2 h-44 pt-6 px-2">
            {last7Days.map((item) => {
              const heightPercent = Math.min(100, Math.max(10, Math.round((item.spent / max7DaySpend) * 100)));
              const isToday = item.date === todayStr;

              return (
                <div
                  key={item.date}
                  onClick={() => {
                    onSelectDate(item.date);
                    onNavigateToTab('daily');
                  }}
                  className="flex-1 flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <div className="text-[10px] font-mono text-[#e5e5e5]/40 group-hover:text-[#c4b5a1] transition-colors">
                    {formatCurrency(item.spent, settings.currencySymbol)}
                  </div>

                  <div className="w-full bg-[#161616] rounded-md h-28 flex items-end p-1 overflow-hidden border border-[#222222]/40">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`w-full rounded-sm transition-all ${
                        isToday
                          ? 'bg-[#c4b5a1] group-hover:bg-[#d8ccbc] shadow-xs'
                          : 'bg-[#2a2a2a] group-hover:bg-[#c4b5a1]/70'
                      }`}
                    />
                  </div>

                  <span
                    className={`text-[11px] font-medium ${
                      isToday ? 'text-[#c4b5a1] font-semibold' : 'text-[#e5e5e5]/40 group-hover:text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Month Categories (5 cols) */}
        <div className="lg:col-span-5 bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c4b5a1]">
                Category Share
              </h3>
              <button
                onClick={() => onNavigateToTab('categories')}
                className="text-xs uppercase tracking-wider font-semibold text-[#e5e5e5]/40 hover:text-white transition-colors"
              >
                All
              </button>
            </div>

            {sortedCategories.length === 0 ? (
              <div className="text-xs text-[#e5e5e5]/40 py-8 text-center">
                No categorical expenses recorded for this month yet.
              </div>
            ) : (
              <div className="space-y-4">
                {sortedCategories.map(([catId, amount]) => {
                  const cat = categoryMap.get(catId);
                  const pct = monthSpent > 0 ? Math.round((amount / monthSpent) * 100) : 0;

                  return (
                    <div key={catId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat?.color || '#c4b5a1' }}
                          />
                          <span className="font-light text-[#e5e5e5]">{cat?.name || 'General'}</span>
                        </div>
                        <span className="font-mono text-white text-xs">
                          {formatCurrency(amount, settings.currencySymbol)} <span className="text-[#e5e5e5]/40 text-[10px]">({pct}%)</span>
                        </span>
                      </div>

                      <div className="w-full bg-[#161616] h-1.5 rounded-full overflow-hidden border border-[#222222]/30">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: cat?.color || '#c4b5a1',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateToTab('categories')}
            className="mt-6 w-full py-2.5 bg-[#141414] hover:bg-[#1a1a1a] text-[#e5e5e5] rounded-lg text-[11px] uppercase tracking-wider font-semibold flex items-center justify-center gap-2 border border-[#222222] transition-colors"
          >
            <FolderTree className="w-3.5 h-3.5 text-[#c4b5a1]" />
            <span>Manage Categories</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Mini-Feed */}
      <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#c4b5a1]" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c4b5a1]">
              Recent Activity
            </h3>
          </div>
          <button
            onClick={() => onNavigateToTab('history')}
            className="text-xs uppercase tracking-wider font-semibold text-[#c4b5a1] hover:text-white transition-colors"
          >
            View Full Timeline →
          </button>
        </div>

        <div className="divide-y divide-[#1a1a1a]">
          {expenses.slice(0, 5).map((expense) => {
            const cat = categoryMap.get(expense.categoryId);
            return (
              <div
                key={expense.id}
                className="py-3.5 flex items-center justify-between gap-3 group hover:bg-[#141414] -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-[#222222]"
                    style={{
                      backgroundColor: '#161616',
                      color: cat?.color || '#c4b5a1',
                    }}
                  >
                    <CategoryIcon name={cat?.icon || 'Folder'} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-light text-sm text-[#e5e5e5] truncate group-hover:text-white">
                      {expense.title}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-[#e5e5e5]/40 flex items-center gap-2 mt-0.5">
                      <span>{formatDateDisplay(expense.date)}</span>
                      <span>•</span>
                      <span>{cat?.name || 'General'}</span>
                    </div>
                  </div>
                </div>

                <div className="font-light text-sm text-white shrink-0">
                  {formatCurrency(expense.amount, settings.currencySymbol)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
