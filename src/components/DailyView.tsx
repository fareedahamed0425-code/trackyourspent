import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  CreditCard,
  Tag,
  Clock,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import { Category, Expense, UserSettings } from '../types';
import { formatCurrency, formatDateDisplay } from '../utils/helpers';
import { CategoryIcon } from './CategoryIcon';

interface DailyViewProps {
  expenses: Expense[];
  categories: Category[];
  settings: UserSettings;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenAddExpense: (defaultDate?: string) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  expenses,
  categories,
  settings,
  selectedDate,
  onSelectDate,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'time-desc' | 'amount-desc' | 'amount-asc'>('time-desc');

  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  // Date shifting helpers
  const shiftDate = (days: number) => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    onSelectDate(`${y}-${m}-${dayStr}`);
  };

  const jumpToToday = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    onSelectDate(`${y}-${m}-${dayStr}`);
  };

  // Filter day expenses
  const dayExpenses = expenses.filter((e) => e.date === selectedDate);
  const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Filter with search
  const filteredExpenses = dayExpenses
    .filter((e) => {
      const matchTitle = e.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchNotes = e.notes?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      const catName = categoryMap.get(e.categoryId)?.name.toLowerCase() || '';
      const matchCategory = catName.includes(searchQuery.toLowerCase());
      return matchTitle || matchNotes || matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return (b.time || '').localeCompare(a.time || '');
    });

  // Calculate category distribution for this day
  const categoryTotals: { [catId: string]: number } = {};
  dayExpenses.forEach((e) => {
    categoryTotals[e.categoryId] = (categoryTotals[e.categoryId] || 0) + e.amount;
  });

  const dailyBudgetDiff = settings.dailyBudget - dayTotal;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Date Navigation Bar */}
      <div className="bg-[#0f0f0f] rounded-2xl p-4 sm:p-6 border border-[#1a1a1a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Day Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              id="daily-prev-day-btn"
              onClick={() => shiftDate(-1)}
              className="p-2.5 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] text-[#e5e5e5] border border-[#222222] transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 bg-[#141414] border border-[#262626] px-4 py-2 rounded-lg">
              <CalendarIcon className="w-4 h-4 text-[#c4b5a1]" />
              <input
                id="daily-date-picker-input"
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && onSelectDate(e.target.value)}
                className="font-mono text-[#e5e5e5] text-xs uppercase bg-transparent focus:outline-hidden cursor-pointer"
              />
            </div>

            <button
              id="daily-next-day-btn"
              onClick={() => shiftDate(1)}
              className="p-2.5 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] text-[#e5e5e5] border border-[#222222] transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              id="daily-jump-today-btn"
              onClick={jumpToToday}
              className="px-3.5 py-2 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] text-[#c4b5a1] border border-[#262626] text-[11px] uppercase tracking-wider font-semibold transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>

          {/* Quick Add For This Day */}
          <button
            id="daily-add-expense-button"
            onClick={() => onOpenAddExpense(selectedDate)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#c4b5a1] hover:bg-[#d8ccbc] text-[#0a0a0a] rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Day Entry</span>
          </button>
        </div>

        {/* Day Summary Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-[#1a1a1a]">
          <div className="bg-[#141414] rounded-xl p-4 border border-[#222222]">
            <div className="text-[10px] uppercase font-semibold text-[#e5e5e5]/40 tracking-[0.2em]">
              {formatDateDisplay(selectedDate)} Total
            </div>
            <div className="text-2xl font-light text-white mt-1.5">
              {formatCurrency(dayTotal, settings.currencySymbol)}
            </div>
            <div className="text-[10px] text-[#e5e5e5]/40 mt-1 uppercase tracking-wider font-mono">
              {dayExpenses.length} entries on this date
            </div>
          </div>

          <div className="bg-[#141414] rounded-xl p-4 border border-[#222222]">
            <div className="text-[10px] uppercase font-semibold text-[#e5e5e5]/40 tracking-[0.2em]">
              Daily Budget Variance
            </div>
            <div
              className={`text-2xl font-light mt-1.5 ${
                dailyBudgetDiff >= 0 ? 'text-[#c4b5a1]' : 'text-rose-400'
              }`}
            >
              {dailyBudgetDiff >= 0 ? '+' : ''}
              {formatCurrency(dailyBudgetDiff, settings.currencySymbol)}
            </div>
            <div className="text-[10px] text-[#e5e5e5]/40 mt-1 uppercase tracking-wider font-mono">
              {dailyBudgetDiff >= 0 ? 'Under target limit' : 'Above daily allowance'}
            </div>
          </div>

          <div className="bg-[#141414] rounded-xl p-4 border border-[#222222]">
            <div className="text-[10px] uppercase font-semibold text-[#e5e5e5]/40 tracking-[0.2em]">
              Primary Category
            </div>
            {Object.keys(categoryTotals).length > 0 ? (
              (() => {
                const topCatId = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0][0];
                const topCat = categoryMap.get(topCatId);
                return (
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: topCat?.color || '#c4b5a1' }}
                    />
                    <span className="text-base font-light text-[#e5e5e5] truncate">{topCat?.name}</span>
                    <span className="text-xs font-mono text-[#e5e5e5]/50">
                      ({formatCurrency(categoryTotals[topCatId], settings.currencySymbol)})
                    </span>
                  </div>
                );
              })()
            ) : (
              <div className="text-xs text-[#e5e5e5]/40 mt-2 font-mono uppercase tracking-wider">
                No items recorded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expenses List & Filter Bar */}
      <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c4b5a1]">
              Ledger on {formatDateDisplay(selectedDate)}
            </h3>
            <p className="text-xs text-[#e5e5e5]/40 mt-0.5">Itemized day transactions</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#e5e5e5]/40" />
              <input
                id="daily-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter day items..."
                className="pl-8 pr-3 py-1.5 bg-[#141414] border border-[#222222] rounded-lg text-xs text-[#e5e5e5] focus:outline-hidden focus:border-[#c4b5a1] w-44 placeholder:text-[#e5e5e5]/30"
              />
            </div>

            {/* Sort Toggle */}
            <select
              id="daily-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as unknown as typeof sortBy)}
              className="px-3 py-1.5 bg-[#141414] border border-[#222222] rounded-lg text-xs text-[#e5e5e5] focus:outline-hidden focus:border-[#c4b5a1] cursor-pointer"
            >
              <option value="time-desc">Latest Time</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#141414] rounded-xl border border-dashed border-[#222222]">
            <CalendarIcon className="w-8 h-8 text-[#e5e5e5]/20 mx-auto mb-3" />
            <div className="text-white font-light text-sm">No expenses recorded for this date</div>
            <p className="text-xs text-[#e5e5e5]/40 mt-1 max-w-xs mx-auto">
              Record a transaction or navigate through the ledger dates.
            </p>
            <button
              onClick={() => onOpenAddExpense(selectedDate)}
              className="mt-4 px-4 py-2 bg-[#c4b5a1] text-[#0a0a0a] rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#d8ccbc] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Add First Entry for {formatDateDisplay(selectedDate)}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a]">
            {filteredExpenses.map((expense) => {
              const cat = categoryMap.get(expense.categoryId);
              return (
                <motion.div
                  key={expense.id}
                  id={`daily-expense-row-${expense.id}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-3.5 flex items-center justify-between gap-4 group hover:bg-[#141414] -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-[#222222]"
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
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] uppercase tracking-wider text-[#e5e5e5]/40">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#e5e5e5]/40" />
                          {expense.time || '--:--'}
                        </span>
                        <span>•</span>
                        <span
                          className="font-semibold text-[9px] px-1.5 py-0.5 rounded-sm border border-[#222222] bg-[#161616]"
                          style={{
                            color: cat?.color || '#c4b5a1',
                          }}
                        >
                          {cat?.name || 'Uncategorized'}
                        </span>
                        <span>•</span>
                        <span>{expense.paymentMethod}</span>
                      </div>
                      {expense.notes && (
                        <div className="text-xs text-[#e5e5e5]/40 mt-1 italic line-clamp-1 font-light">
                          {expense.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-light text-white">
                        {formatCurrency(expense.amount, settings.currencySymbol)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditExpense(expense)}
                        title="Edit Expense"
                        className="p-1.5 rounded-md text-[#e5e5e5]/50 hover:text-[#c4b5a1] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        title="Delete Expense"
                        className="p-1.5 rounded-md text-[#e5e5e5]/50 hover:text-rose-400 hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
