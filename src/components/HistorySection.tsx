import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Calendar,
  Trash2,
  Edit2,
  Clock,
  ArrowUpDown,
  CreditCard,
  Tag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Category, Expense, UserSettings } from '../types';
import { formatCurrency, formatDateDisplay } from '../utils/helpers';
import { CategoryIcon } from './CategoryIcon';

interface HistorySectionProps {
  expenses: Expense[];
  categories: Category[];
  settings: UserSettings;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  expenses,
  categories,
  settings,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'all' | '7d' | '30d' | 'month'>('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [collapsedDates, setCollapsedDates] = useState<{ [date: string]: boolean }>({});

  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  // Date filtering logic
  const now = new Date();
  const filterDateCutoff = (() => {
    if (timeFilter === '7d') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d.toISOString().split('T')[0];
    }
    if (timeFilter === '30d') {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return d.toISOString().split('T')[0];
    }
    if (timeFilter === 'month') {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}-01`;
    }
    return '1970-01-01';
  })();

  // Filter expenses
  const filtered = expenses.filter((e) => {
    // Time filter
    if (e.date < filterDateCutoff) return false;

    // Category filter
    if (categoryFilter !== 'all' && e.categoryId !== categoryFilter) return false;

    // Payment method
    if (paymentFilter !== 'all' && e.paymentMethod !== paymentFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchNotes = e.notes?.toLowerCase().includes(q) || false;
      const catName = categoryMap.get(e.categoryId)?.name.toLowerCase() || '';
      const matchCat = catName.includes(q);
      const matchDate = e.date.includes(q);
      return matchTitle || matchNotes || matchCat || matchDate;
    }

    return true;
  });

  // Group by Date
  const dateGroups: { [date: string]: Expense[] } = {};
  filtered.forEach((e) => {
    if (!dateGroups[e.date]) dateGroups[e.date] = [];
    dateGroups[e.date].push(e);
  });

  const sortedDates = Object.keys(dateGroups).sort((a, b) => b.localeCompare(a));
  const totalFilteredSum = filtered.reduce((sum, e) => sum + e.amount, 0);

  const toggleDateCollapse = (date: string) => {
    setCollapsedDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header & Filter Card */}
      <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#161616] text-[#c4b5a1] border border-[#262626] flex items-center justify-center">
              <HistoryIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif italic text-white tracking-tight">Day-by-Day Archive</h2>
              <p className="text-xs text-[#e5e5e5]/40 mt-0.5">
                Detailed timeline of what was done on each day across all categories
              </p>
            </div>
          </div>

          <div className="bg-[#141414] border border-[#222222] px-4 py-2 rounded-xl flex items-center gap-3">
            <div>
              <div className="text-[10px] uppercase font-semibold text-[#e5e5e5]/40 tracking-[0.2em]">Total Filtered</div>
              <div className="text-lg font-light text-white font-mono">
                {formatCurrency(totalFilteredSum, settings.currencySymbol)}
              </div>
            </div>
            <div className="border-l border-[#222222] pl-3">
              <div className="text-[10px] uppercase font-semibold text-[#e5e5e5]/40 tracking-[0.2em]">Entries</div>
              <div className="text-lg font-light text-[#c4b5a1] font-mono">{filtered.length}</div>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#e5e5e5]/40" />
            <input
              id="history-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history, day, note..."
              className="w-full pl-8 pr-3 py-2 bg-[#141414] border border-[#222222] rounded-lg text-xs text-[#e5e5e5] focus:outline-hidden focus:border-[#c4b5a1] placeholder:text-[#e5e5e5]/30"
            />
          </div>

          {/* Time Filter */}
          <select
            id="history-time-filter"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as unknown as typeof timeFilter)}
            className="px-3 py-2 bg-[#141414] border border-[#222222] rounded-lg text-xs text-[#e5e5e5] focus:outline-hidden focus:border-[#c4b5a1] cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="month">This Month</option>
          </select>

          {/* Category Filter */}
          <select
            id="history-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#141414] border border-[#222222] rounded-lg text-xs text-[#e5e5e5] focus:outline-hidden focus:border-[#c4b5a1] cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            id="history-payment-filter"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-[#141414] border border-[#222222] rounded-lg text-xs text-[#e5e5e5] focus:outline-hidden focus:border-[#c4b5a1] cursor-pointer"
          >
            <option value="all">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="UPI / Online">UPI / Online</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Grouped Day Timeline */}
      {sortedDates.length === 0 ? (
        <div className="bg-[#0f0f0f] rounded-2xl p-12 text-center border border-[#1a1a1a]">
          <Calendar className="w-10 h-10 text-[#e5e5e5]/20 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-white">No matching expense history found</h3>
          <p className="text-xs text-[#e5e5e5]/40 mt-1">
            Try adjusting your search query or date range filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((dateStr) => {
            const dayList = dateGroups[dateStr];
            const daySum = dayList.reduce((sum, item) => sum + item.amount, 0);
            const isCollapsed = collapsedDates[dateStr] || false;

            return (
              <div
                key={dateStr}
                id={`history-day-card-${dateStr}`}
                className="bg-[#0f0f0f] rounded-2xl border border-[#1a1a1a] overflow-hidden"
              >
                {/* Day Header */}
                <div
                  onClick={() => toggleDateCollapse(dateStr)}
                  className="p-4 sm:p-5 bg-[#141414] border-b border-[#1a1a1a] flex items-center justify-between cursor-pointer hover:bg-[#181818] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-[#c4b5a1] flex items-center justify-center font-bold text-xs">
                      📅
                    </div>
                    <div>
                      <div className="font-medium text-sm text-white flex items-center gap-2">
                        <span>{formatDateDisplay(dateStr)}</span>
                        <span className="text-xs font-normal text-[#e5e5e5]/40 font-serif italic">
                          ({new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })})
                        </span>
                      </div>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-[#e5e5e5]/40">
                        {dayList.length} transaction{dayList.length > 1 ? 's' : ''} on this day
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-base font-light text-white font-mono">
                        {formatCurrency(daySum, settings.currencySymbol)}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-[#c4b5a1]">Day Total</div>
                    </div>
                    <div className="p-1 rounded-lg text-[#e5e5e5]/40">
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Day Transactions List */}
                {!isCollapsed && (
                  <div className="p-4 sm:p-5 divide-y divide-[#1a1a1a]">
                    {dayList
                      .sort((a, b) => (b.time || '').localeCompare(a.time || ''))
                      .map((expense) => {
                        const cat = categoryMap.get(expense.categoryId);
                        return (
                          <div
                            key={expense.id}
                            className="py-3 flex items-center justify-between gap-4 group hover:bg-[#141414] -mx-2 px-3 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-[#262626]"
                                style={{
                                  backgroundColor: `${cat?.color || '#c4b5a1'}15`,
                                  color: cat?.color || '#c4b5a1',
                                }}
                              >
                                <CategoryIcon name={cat?.icon || 'Folder'} className="w-4 h-4" />
                              </div>

                              <div className="min-w-0">
                                <div className="font-light text-sm text-white truncate">
                                  {expense.title}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-[#e5e5e5]/40">
                                  <span className="flex items-center gap-1 text-[#c4b5a1]">
                                    <Clock className="w-3 h-3 text-[#c4b5a1]" />
                                    {expense.time || '--:--'}
                                  </span>
                                  <span>•</span>
                                  <span
                                    className="font-medium px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-wider"
                                    style={{
                                      backgroundColor: `${cat?.color || '#c4b5a1'}15`,
                                      color: cat?.color || '#c4b5a1',
                                    }}
                                  >
                                    {cat?.name || 'General'}
                                  </span>
                                  <span>•</span>
                                  <span className="text-[#e5e5e5]/60">{expense.paymentMethod}</span>
                                </div>
                                {expense.notes && (
                                  <div className="text-[11px] text-[#e5e5e5]/40 mt-1 italic font-serif line-clamp-1">
                                    {expense.notes}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right font-light font-mono text-sm text-white">
                                {formatCurrency(expense.amount, settings.currencySymbol)}
                              </div>

                              <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => onEditExpense(expense)}
                                  className="p-1.5 rounded-md text-[#e5e5e5]/40 hover:text-[#c4b5a1] hover:bg-[#1a1a1a] cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteExpense(expense.id)}
                                  className="p-1.5 rounded-md text-[#e5e5e5]/40 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
