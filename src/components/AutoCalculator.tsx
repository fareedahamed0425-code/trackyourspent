import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Calculator as CalcIcon,
  PlusCircle,
  RotateCcw,
  Delete,
  Users,
  Percent,
  TrendingDown,
  Sparkles,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Category, Expense, UserSettings, CalculatorHistory } from '../types';
import { evaluateMathExpression, formatCurrency, formatDateDisplay } from '../utils/helpers';
import { getTodayDateString } from '../utils/storage';

interface AutoCalculatorProps {
  expenses: Expense[];
  categories: Category[];
  settings: UserSettings;
  onAddCalculatedExpense: (expenseData: {
    title: string;
    amount: number;
    categoryId: string;
    notes?: string;
  }) => void;
}

export const AutoCalculator: React.FC<AutoCalculatorProps> = ({
  expenses,
  categories,
  settings,
  onAddCalculatedExpense,
}) => {
  const [expression, setExpression] = useState('');
  const [calcHistory, setCalcHistory] = useState<CalculatorHistory[]>([
    {
      id: 'h-1',
      expression: '15.50 + 24.00 * 1.08',
      result: 41.42,
      timestamp: Date.now() - 3600000 * 2,
      note: 'Dinner split + tax',
    },
    {
      id: 'h-2',
      expression: '120 / 4',
      result: 30.0,
      timestamp: Date.now() - 3600000 * 8,
      note: 'Grocery 4-way share',
    },
  ]);

  // Direct conversion form state
  const [expenseTitle, setExpenseTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || 'food');
  const [expenseNotes, setExpenseNotes] = useState('');
  const [splitCount, setSplitCount] = useState<number>(1);
  const [tipPercent, setTipPercent] = useState<number>(0);
  const [addedToast, setAddedToast] = useState(false);

  // Live evaluation of current expression
  const evalResult = evaluateMathExpression(expression);
  const rawCalculatedValue = evalResult.success ? evalResult.result : 0;

  // Apply split & tip if configured
  const finalAmount = Math.max(
    0,
    Math.round(((rawCalculatedValue * (1 + tipPercent / 100)) / (splitCount || 1)) * 100) / 100
  );

  // Today's expense stats ("what is going on")
  const todayStr = getTodayDateString();
  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const todaySpent = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const todayRemaining = Math.max(0, settings.dailyBudget - todaySpent);
  const dailyPercentUsed = Math.min(100, Math.round((todaySpent / (settings.dailyBudget || 1)) * 100));

  // Keypad actions
  const handleKeypadPress = (val: string) => {
    setExpression((prev) => prev + val);
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setExpression('');
  };

  const handleSaveToHistory = () => {
    if (!evalResult.success || evalResult.result <= 0) return;

    const newHistoryItem: CalculatorHistory = {
      id: 'calc-' + Date.now(),
      expression: expression,
      result: finalAmount,
      timestamp: Date.now(),
      note: expenseTitle ? `${expenseTitle} (${selectedCategory})` : undefined,
    };

    setCalcHistory([newHistoryItem, ...calcHistory.slice(0, 9)]);
  };

  const handleQuickAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount <= 0) return;

    const title = expenseTitle.trim() || `Expense (${expression})`;
    const noteDetails = [
      expenseNotes.trim(),
      splitCount > 1 ? `Split between ${splitCount} people` : '',
      tipPercent > 0 ? `Includes +${tipPercent}% tip/tax` : '',
      `Formula: ${expression}`,
    ]
      .filter(Boolean)
      .join(' | ');

    onAddCalculatedExpense({
      title,
      amount: finalAmount,
      categoryId: selectedCategory,
      notes: noteDetails,
    });

    handleSaveToHistory();
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);

    // Reset inputs
    setExpenseTitle('');
    setExpenseNotes('');
    setExpression('');
    setSplitCount(1);
    setTipPercent(0);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Live "What's Going On" Header Card */}
      <div className="bg-[#0d0d0d] text-[#e5e5e5] rounded-2xl p-6 border border-[#1a1a1a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#161616] text-[#c4b5a1] border border-[#262626] flex items-center justify-center">
              <CalcIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif italic text-white tracking-tight">Financial Math & Live Tally</h2>
              <p className="text-xs text-[#e5e5e5]/40 mt-0.5">Calculate math, split bills, and project day spending</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#141414] border border-[#222222] px-3.5 py-1.5 rounded-lg text-xs font-mono text-[#c4b5a1]">
            <Clock className="w-3.5 h-3.5 text-[#c4b5a1]" />
            <span>Today: {formatDateDisplay(todayStr)}</span>
          </div>
        </div>

        {/* Live Daily Runway Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="bg-[#141414] rounded-xl p-4 border border-[#222222]">
            <div className="text-[10px] uppercase font-semibold text-[#e5e5e5]/40 tracking-[0.2em]">Spent Today</div>
            <div className="text-2xl font-light text-white mt-1">
              {formatCurrency(todaySpent, settings.currencySymbol)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-[#e5e5e5]/40 mt-1 font-mono">
              {todayExpenses.length} transactions recorded
            </div>
          </div>

          <div className="bg-[#141414] rounded-xl p-4 border border-[#222222]">
            <div className="text-[10px] uppercase font-semibold text-[#e5e5e5]/40 tracking-[0.2em]">Daily Target</div>
            <div className="text-2xl font-light text-slate-200 mt-1">
              {formatCurrency(settings.dailyBudget, settings.currencySymbol)}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-full bg-[#222222] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    dailyPercentUsed > 90
                      ? 'bg-rose-500'
                      : dailyPercentUsed > 70
                      ? 'bg-amber-500'
                      : 'bg-[#c4b5a1]'
                  }`}
                  style={{ width: `${dailyPercentUsed}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-[#e5e5e5]/60">{dailyPercentUsed}%</span>
            </div>
          </div>

          <div className="bg-[#141414] rounded-xl p-4 border border-[#222222]">
            <div className="text-[10px] uppercase font-semibold text-[#e5e5e5]/40 tracking-[0.2em]">Remaining Runway</div>
            <div
              className={`text-2xl font-light mt-1 ${
                todayRemaining > 0 ? 'text-[#c4b5a1]' : 'text-rose-400'
              }`}
            >
              {formatCurrency(todayRemaining, settings.currencySymbol)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-[#e5e5e5]/40 mt-1 font-mono">
              {todayRemaining > 0 ? 'Within budget pace' : 'Exceeded daily goal'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Calculator & Conversion Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Keypad and Live Display (7 cols) */}
        <div className="lg:col-span-7 bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c4b5a1]">
                Expression Engine
              </span>
              <span className="text-[10px] text-[#e5e5e5]/40 font-mono">Supports (), +, -, *, /, %</span>
            </div>

            {/* Expression Screen */}
            <div className="bg-[#141414] rounded-xl p-5 mb-5 text-right font-mono border border-[#222222]">
              <input
                id="calculator-expression-input"
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="Type e.g. (24.50 * 2) + 15"
                className="w-full bg-transparent text-right text-[#e5e5e5]/70 text-lg font-mono focus:outline-hidden placeholder:text-[#e5e5e5]/20"
              />
              <div className="text-3xl font-light text-white mt-2 tracking-tight">
                {evalResult.success ? (
                  <span className="text-[#c4b5a1]">{formatCurrency(evalResult.result, settings.currencySymbol)}</span>
                ) : expression ? (
                  <span className="text-sm text-rose-400 font-sans">{evalResult.error || 'Invalid Math'}</span>
                ) : (
                  <span className="text-[#e5e5e5]/30 text-2xl">{settings.currencySymbol}0.00</span>
                )}
              </div>
            </div>

            {/* Quick Modifiers (Split Bill & Tip/Tax) */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#141414] p-3.5 rounded-xl border border-[#222222]">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#e5e5e5]/60 flex items-center gap-1.5 mb-2">
                  <Users className="w-3.5 h-3.5 text-[#c4b5a1]" />
                  <span>Split Bill (People)</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSplitCount((p) => Math.max(1, p - 1))}
                    className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-[#e5e5e5] font-bold flex items-center justify-center hover:bg-[#252525] cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono text-sm w-6 text-center text-white">{splitCount}</span>
                  <button
                    type="button"
                    onClick={() => setSplitCount((p) => p + 1)}
                    className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-[#e5e5e5] font-bold flex items-center justify-center hover:bg-[#252525] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-[#141414] p-3.5 rounded-xl border border-[#222222]">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#e5e5e5]/60 flex items-center gap-1.5 mb-2">
                  <Percent className="w-3.5 h-3.5 text-[#c4b5a1]" />
                  <span>Tip / Tax Multiplier</span>
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[0, 5, 10, 15, 18].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTipPercent(pct)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                        tipPercent === pct
                          ? 'bg-[#c4b5a1] text-[#0a0a0a] font-bold'
                          : 'bg-[#1a1a1a] border border-[#2a2a2a] text-[#e5e5e5]/70 hover:bg-[#252525]'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Numeric & Operator Keypad */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'C', action: handleClear, style: 'bg-rose-950/40 border border-rose-900/40 text-rose-400 hover:bg-rose-900/60' },
                { label: '(', action: () => handleKeypadPress('('), style: 'bg-[#141414] border border-[#222222] text-[#e5e5e5] hover:bg-[#1a1a1a]' },
                { label: ')', action: () => handleKeypadPress(')'), style: 'bg-[#141414] border border-[#222222] text-[#e5e5e5] hover:bg-[#1a1a1a]' },
                { label: '÷', action: () => handleKeypadPress('/'), style: 'bg-[#181818] border border-[#2a2a2a] text-[#c4b5a1] font-bold hover:bg-[#222222]' },

                { label: '7', action: () => handleKeypadPress('7'), style: 'bg-[#141414] border border-[#222222] text-white font-light hover:bg-[#1a1a1a]' },
                { label: '8', action: () => handleKeypadPress('8'), style: 'bg-[#141414] border border-[#222222] text-white font-light hover:bg-[#1a1a1a]' },
                { label: '9', action: () => handleKeypadPress('9'), style: 'bg-[#141414] border border-[#222222] text-white font-light hover:bg-[#1a1a1a]' },
                { label: '×', action: () => handleKeypadPress('*'), style: 'bg-[#181818] border border-[#2a2a2a] text-[#c4b5a1] font-bold hover:bg-[#222222]' },

                { label: '4', action: () => handleKeypadPress('4'), style: 'bg-[#141414] border border-[#222222] text-white font-light hover:bg-[#1a1a1a]' },
                { label: '5', action: () => handleKeypadPress('5'), style: 'bg-[#141414] border border-[#222222] text-white font-light hover:bg-[#1a1a1a]' },
                { label: '6', action: () => handleKeypadPress('6'), style: 'bg-[#141414] border border-[#222222] text-white font-light hover:bg-[#1a1a1a]' },
                { label: '-', action: () => handleKeypadPress('-'), style: 'bg-[#181818] border border-[#2a2a2a] text-[#c4b5a1] font-bold hover:bg-[#222222]' },

                { label: '1', action: () => handleKeypadPress('1'), style: 'bg-[#141414] border border-[#222222] text-white font-light hover:bg-[#1a1a1a]' },
                { label: '2', action: () => handleKeypadPress('2'), style: 'bg-[#141414] border border-[#222222] text-white font-light hover:bg-[#1a1a1a]' },
                { label: '3', action: () => handleKeypadPress('3'), style: 'bg-[#141414] border border-[#222222] text-white font-light hover:bg-[#1a1a1a]' },
                { label: '+', action: () => handleKeypadPress('+'), style: 'bg-[#181818] border border-[#2a2a2a] text-[#c4b5a1] font-bold hover:bg-[#222222]' },

                { label: '0', action: () => handleKeypadPress('0'), style: 'bg-[#141414] border border-[#222222] text-white font-light hover:bg-[#1a1a1a]' },
                { label: '.', action: () => handleKeypadPress('.'), style: 'bg-[#141414] border border-[#222222] text-white font-light hover:bg-[#1a1a1a]' },
                { label: '%', action: () => handleKeypadPress('%'), style: 'bg-[#141414] border border-[#222222] text-[#e5e5e5] hover:bg-[#1a1a1a]' },
                { label: '⌫', action: handleBackspace, style: 'bg-[#181818] border border-[#2a2a2a] text-[#c4b5a1] hover:bg-[#222222]' },
              ].map((btn, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={btn.action}
                  className={`h-12 rounded-lg flex items-center justify-center text-sm active:scale-95 transition-all cursor-pointer ${btn.style}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: 1-Click Convert to Expense (5 cols) */}
        <div className="lg:col-span-5 bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a] flex flex-col justify-between">
          <form onSubmit={handleQuickAddExpense} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#c4b5a1]" />
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c4b5a1]">
                  Quick Convert
                </h3>
              </div>
              <span className="text-[10px] uppercase tracking-widest bg-[#141414] border border-[#222222] text-[#c4b5a1] px-2 py-0.5 rounded-sm font-mono">
                Today
              </span>
            </div>

            {/* Result Amount Badge */}
            <div className="bg-[#141414] p-4 rounded-xl border border-[#222222]">
              <div className="text-[10px] uppercase font-semibold text-[#e5e5e5]/40 tracking-[0.2em]">Calculated Payable Amount</div>
              <div className="text-3xl font-light text-white mt-1">
                {formatCurrency(finalAmount, settings.currencySymbol)}
              </div>
              {(splitCount > 1 || tipPercent > 0) && (
                <div className="text-[11px] text-[#e5e5e5]/40 mt-1 font-mono">
                  Base: {formatCurrency(rawCalculatedValue, settings.currencySymbol)}
                  {tipPercent > 0 && ` + ${tipPercent}%`}
                  {splitCount > 1 && ` ÷ ${splitCount} person(s)`}
                </div>
              )}
            </div>

            {/* Expense Title */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#e5e5e5]/60 mb-1.5">
                Expense Name / Title *
              </label>
              <input
                id="calculator-expense-title"
                type="text"
                required
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                placeholder="e.g. Shared Team Dinner"
                className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#222222] rounded-lg text-xs text-[#e5e5e5] focus:outline-hidden focus:border-[#c4b5a1] placeholder:text-[#e5e5e5]/30"
              />
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#e5e5e5]/60 mb-1.5">
                Assign Category
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-2 rounded-lg text-xs flex items-center gap-2 text-left transition-colors border cursor-pointer ${
                      selectedCategory === c.id
                        ? 'bg-[#c4b5a1] text-[#0a0a0a] border-[#c4b5a1] font-semibold'
                        : 'bg-[#141414] text-[#e5e5e5]/70 border-[#222222] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#e5e5e5]/60 mb-1.5">
                Optional Notes
              </label>
              <input
                id="calculator-expense-notes"
                type="text"
                value={expenseNotes}
                onChange={(e) => setExpenseNotes(e.target.value)}
                placeholder="e.g. Paid via UPI, split 50/50"
                className="w-full px-3.5 py-2 bg-[#141414] border border-[#222222] rounded-lg text-xs text-[#e5e5e5] focus:outline-hidden focus:border-[#c4b5a1] placeholder:text-[#e5e5e5]/30"
              />
            </div>

            {/* Submit Button */}
            <button
              id="calculator-submit-expense-btn"
              type="submit"
              disabled={finalAmount <= 0}
              className={`w-full py-3 px-4 rounded-lg font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                finalAmount > 0
                  ? 'bg-[#c4b5a1] hover:bg-[#d8ccbc] text-[#0a0a0a] active:scale-98 cursor-pointer shadow-sm'
                  : 'bg-[#1a1a1a] text-[#e5e5e5]/30 cursor-not-allowed border border-[#222222]'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record ({formatCurrency(finalAmount, settings.currencySymbol)})</span>
            </button>

            {addedToast && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs font-semibold text-[#c4b5a1] bg-[#161616] p-2.5 rounded-lg border border-[#c4b5a1]/30"
              >
                <CheckCircle2 className="w-4 h-4 text-[#c4b5a1]" />
                <span>Recorded to today's ledger successfully!</span>
              </motion.div>
            )}
          </form>
        </div>
      </div>

      {/* Calculator History Tally */}
      {calcHistory.length > 0 && (
        <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#c4b5a1]" />
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c4b5a1]">
                Calculations Scratchpad
              </h3>
            </div>
            <button
              onClick={() => setCalcHistory([])}
              className="text-xs uppercase tracking-wider text-[#e5e5e5]/40 hover:text-white transition-colors cursor-pointer"
            >
              Clear Log
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {calcHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => setExpression(item.expression)}
                className="bg-[#141414] hover:bg-[#1a1a1a] p-3.5 rounded-xl border border-[#222222] hover:border-[#c4b5a1]/40 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#e5e5e5]/70 truncate max-w-[160px]">{item.expression}</span>
                  <span className="text-xs font-mono font-bold text-[#c4b5a1]">
                    = {formatCurrency(item.result, settings.currencySymbol)}
                  </span>
                </div>
                {item.note && <div className="text-[11px] text-[#e5e5e5]/40 mt-1 truncate">{item.note}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
