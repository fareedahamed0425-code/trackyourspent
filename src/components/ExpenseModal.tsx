import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Edit2,
  Calendar,
  Clock,
  CreditCard,
  Tag,
  DollarSign,
  Check,
} from 'lucide-react';
import { Category, Expense, PaymentMethod, UserSettings, BankAccount } from '../types';
import { formatTimeNow, getTodayDateString } from '../utils/storage';
import { CategoryIcon } from './CategoryIcon';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: {
    id?: string;
    title: string;
    amount: number;
    categoryId: string;
    date: string;
    time: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => void;
  categories: Category[];
  bankAccounts?: BankAccount[];
  settings: UserSettings;
  editingExpense?: Expense | null;
  defaultDate?: string;
  defaultCategoryId?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'UPI / Online',
  'Bank Transfer',
  'Other',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  bankAccounts = [],
  settings,
  editingExpense,
  defaultDate,
  defaultCategoryId,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [bankAccountId, setBankAccountId] = useState<string>('');
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState(formatTimeNow());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI / Online');
  const [notes, setNotes] = useState('');

  // Sync state when modal opens or editingExpense changes
  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(String(editingExpense.amount));
      setCategoryId(editingExpense.categoryId);
      setBankAccountId(editingExpense.bankAccountId || '');
      setDate(editingExpense.date);
      setTime(editingExpense.time || formatTimeNow());
      setPaymentMethod(editingExpense.paymentMethod || 'UPI / Online');
      setNotes(editingExpense.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setCategoryId(defaultCategoryId || categories[0]?.id || 'food');
      setBankAccountId('');
      setDate(defaultDate || getTodayDateString());
      setTime(formatTimeNow());
      setPaymentMethod('UPI / Online');
      setNotes('');
    }
  }, [editingExpense, isOpen, defaultDate, defaultCategoryId, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSave({
      id: editingExpense?.id,
      title: title.trim(),
      amount: parsedAmount,
      categoryId: categoryId || categories[0]?.id || 'food',
      bankAccountId: bankAccountId || undefined,
      date: date || getTodayDateString(),
      time: time || formatTimeNow(),
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a] w-full max-w-lg overflow-y-auto max-h-[90vh] text-[#e5e5e5] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#161616] text-[#c4b5a1] border border-[#262626] flex items-center justify-center">
              {editingExpense ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-serif italic text-base text-white tracking-tight">
                {editingExpense ? 'Edit Expense Record' : 'Record Day Expense'}
              </h3>
              <p className="text-[10px] uppercase font-mono tracking-wider text-[#e5e5e5]/40">Specify details for this ledger entry</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#1a1a1a] text-[#e5e5e5]/40 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount input */}
          <div className="bg-[#141414] p-4 rounded-xl border border-[#222222]">
            <label className="block text-[10px] uppercase font-semibold tracking-[0.2em] text-[#e5e5e5]/50 mb-1">
              Expense Amount ({settings.currencySymbol}) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-light text-[#c4b5a1] font-mono">
                {settings.currencySymbol}
              </span>
              <input
                id="expense-form-amount-input"
                type="number"
                step="0.01"
                min="0.01"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-2 bg-transparent border-0 rounded-lg text-2xl font-light font-mono text-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Expense Title */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#e5e5e5]/60 mb-1">
              Expense Title / What did you spend on? *
            </label>
            <input
              id="expense-form-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grocery Mart, Taxi to Office, Lunch"
              className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#222222] rounded-lg text-xs text-[#e5e5e5] focus:outline-hidden focus:border-[#c4b5a1] placeholder:text-[#e5e5e5]/30"
            />
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#e5e5e5]/60 mb-1.5">
              Select Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#c4b5a1] text-[#0a0a0a] border-[#c4b5a1] font-bold shadow-xs'
                        : 'bg-[#141414] text-[#e5e5e5]/70 border-[#222222] hover:bg-[#1c1c1c] hover:text-white'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border border-[#262626]"
                      style={{
                        backgroundColor: isSelected ? 'rgba(0,0,0,0.1)' : `${cat.color}20`,
                        color: isSelected ? '#0a0a0a' : cat.color,
                      }}
                    >
                      <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate text-xs">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#e5e5e5]/60 mb-1">
                Date (Day-wise) *
              </label>
              <div className="relative">
                <input
                  id="expense-form-date-input"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141414] border border-[#222222] rounded-lg text-xs text-[#e5e5e5] focus:outline-hidden focus:border-[#c4b5a1] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#e5e5e5]/60 mb-1">Time</label>
              <input
                id="expense-form-time-input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#141414] border border-[#222222] rounded-lg text-xs text-[#e5e5e5] focus:outline-hidden focus:border-[#c4b5a1] font-mono"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#e5e5e5]/60 mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPaymentMethod(pm)}
                  className={`px-2 py-1.5 rounded-lg text-xs transition-colors border cursor-pointer ${
                    paymentMethod === pm
                      ? 'bg-[#c4b5a1] text-[#0a0a0a] border-[#c4b5a1] font-bold'
                      : 'bg-[#141414] text-[#e5e5e5]/60 border-[#222222] hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {/* Linked Bank Account (Optional) */}
          {bankAccounts.length > 0 && (
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#e5e5e5]/60 mb-1">
                Link to Bank Account (Optional)
              </label>
              <select
                value={bankAccountId}
                onChange={(e) => setBankAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#222222] rounded-lg text-xs text-[#e5e5e5] focus:outline-hidden focus:border-[#c4b5a1]"
              >
                <option value="">No Bank Linked</option>
                {bankAccounts.map(bank => (
                  <option key={bank.id} value={bank.id}>{bank.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#e5e5e5]/60 mb-1">
              Optional Notes / Tags
            </label>
            <input
              id="expense-form-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Receipt #482, reimbursed from work"
              className="w-full px-3.5 py-2 bg-[#141414] border border-[#222222] rounded-lg text-xs text-[#e5e5e5] focus:outline-hidden focus:border-[#c4b5a1] placeholder:text-[#e5e5e5]/30 font-serif italic"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1a1a1a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-xs text-[#e5e5e5]/60 hover:text-white hover:bg-[#1a1a1a] cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="expense-form-submit-btn"
              type="submit"
              className="px-5 py-2.5 bg-[#c4b5a1] hover:bg-[#d8ccbc] text-[#0a0a0a] rounded-lg text-[11px] uppercase tracking-widest font-bold shadow-sm transition-all cursor-pointer active:scale-98"
            >
              {editingExpense ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
