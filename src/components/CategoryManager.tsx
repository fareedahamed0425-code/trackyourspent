import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderPlus,
  Trash2,
  Edit3,
  Search,
  Plus,
  X,
  TrendingUp,
  CreditCard,
  Calendar,
  Check,
  FolderTree,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Category, Expense, UserSettings } from '../types';
import { formatCurrency, formatDateDisplay } from '../utils/helpers';
import { AVAILABLE_CATEGORY_ICONS, AVAILABLE_COLORS, CategoryIcon } from './CategoryIcon';

interface CategoryManagerProps {
  categories: Category[];
  expenses: Expense[];
  settings: UserSettings;
  onAddCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onOpenAddExpenseWithCategory: (categoryId: string) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  expenses,
  settings,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onOpenAddExpenseWithCategory,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State for Create/Edit Category
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('Folder');
  const [formColor, setFormColor] = useState('#3b82f6');
  const [formBudget, setFormBudget] = useState('');

  // Overall Total
  const totalAllExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Category totals lookup
  const categoryStats = categories.map((cat) => {
    const catExpenses = expenses.filter((e) => e.categoryId === cat.id);
    const totalSpent = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    const count = catExpenses.length;
    const percentage = totalAllExpenses > 0 ? Math.round((totalSpent / totalAllExpenses) * 100) : 0;
    return {
      category: cat,
      totalSpent,
      count,
      percentage,
      expenses: catExpenses,
    };
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormIcon('Folder');
    setFormColor('#3b82f6');
    setFormBudget('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormIcon(cat.icon);
    setFormColor(cat.color);
    setFormBudget(cat.budgetLimit ? String(cat.budgetLimit) : '');
    setIsModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingCategory) {
      onUpdateCategory({
        ...editingCategory,
        name: formName.trim(),
        icon: formIcon,
        color: formColor,
        budgetLimit: formBudget ? parseFloat(formBudget) : undefined,
      });
    } else {
      onAddCategory({
        name: formName.trim(),
        icon: formIcon,
        color: formColor,
        budgetLimit: formBudget ? parseFloat(formBudget) : undefined,
        isCustom: true,
      });
    }

    setIsModalOpen(false);
  };

  // If a category is selected, render Category Deep Dive
  const activeDetail = selectedCategoryId
    ? categoryStats.find((s) => s.category.id === selectedCategoryId)
    : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Category Deep-Dive View */}
      {activeDetail ? (
        <motion.div
          key="detail-view"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Header Bar */}
          <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  id="category-back-btn"
                  onClick={() => setSelectedCategoryId(null)}
                  className="p-2 rounded-lg bg-[#161616] hover:bg-[#222222] text-[#c4b5a1] border border-[#262626] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center border border-[#262626]"
                  style={{
                    backgroundColor: `${activeDetail.category.color}20`,
                    color: activeDetail.category.color,
                  }}
                >
                  <CategoryIcon name={activeDetail.category.icon} className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-serif italic text-white tracking-tight">{activeDetail.category.name}</h2>
                    {activeDetail.category.isCustom && (
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm bg-[#161616] text-[#c4b5a1] border border-[#2a2a2a] font-mono">
                        User Created
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#e5e5e5]/40 mt-0.5">
                    Category specific expense ledger and breakdown
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="category-add-expense-quick"
                  onClick={() => onOpenAddExpenseWithCategory(activeDetail.category.id)}
                  className="px-4 py-2.5 bg-[#c4b5a1] hover:bg-[#d8ccbc] text-[#0a0a0a] rounded-lg text-[11px] uppercase tracking-widest font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ Record in {activeDetail.category.name}</span>
                </button>

                <button
                  onClick={(e) => openEditModal(activeDetail.category, e)}
                  className="p-2.5 rounded-lg border border-[#262626] hover:bg-[#1a1a1a] text-[#e5e5e5]/60 hover:text-white transition-colors cursor-pointer"
                  title="Edit Category"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-[#1a1a1a]">
              <div className="bg-[#141414] rounded-xl p-4 border border-[#222222]">
                <div className="text-[10px] uppercase font-semibold text-[#e5e5e5]/40 tracking-[0.2em]">Total In Category</div>
                <div className="text-2xl font-light text-white mt-1">
                  {formatCurrency(activeDetail.totalSpent, settings.currencySymbol)}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-[#c4b5a1] mt-1 font-mono">
                  {activeDetail.percentage}% of overall expenses
                </div>
              </div>

              <div className="bg-[#141414] rounded-xl p-4 border border-[#222222]">
                <div className="text-[10px] uppercase font-semibold text-[#e5e5e5]/40 tracking-[0.2em]">Monthly Target Budget</div>
                <div className="text-2xl font-light text-white mt-1">
                  {activeDetail.category.budgetLimit
                    ? formatCurrency(activeDetail.category.budgetLimit, settings.currencySymbol)
                    : 'No Limit'}
                </div>
                {activeDetail.category.budgetLimit && (
                  <div className="text-[10px] uppercase tracking-wider text-[#e5e5e5]/40 mt-1 font-mono">
                    {Math.round((activeDetail.totalSpent / activeDetail.category.budgetLimit) * 100)}% utilized
                  </div>
                )}
              </div>

              <div className="bg-[#141414] rounded-xl p-4 border border-[#222222]">
                <div className="text-[10px] uppercase font-semibold text-[#e5e5e5]/40 tracking-[0.2em]">Recorded Transactions</div>
                <div className="text-2xl font-light text-white mt-1">
                  {activeDetail.count}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-[#e5e5e5]/40 mt-1 font-mono">
                  Avg{' '}
                  {formatCurrency(
                    activeDetail.count > 0 ? activeDetail.totalSpent / activeDetail.count : 0,
                    settings.currencySymbol
                  )}
                  /item
                </div>
              </div>
            </div>
          </div>

          {/* Expenses Under this Category */}
          <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a]">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c4b5a1] mb-4">
              All Expenses in {activeDetail.category.name}
            </h3>

            {activeDetail.expenses.length === 0 ? (
              <div className="text-center py-10 px-4 bg-[#141414] rounded-xl border border-dashed border-[#222222]">
                <p className="text-xs text-[#e5e5e5]/50">
                  No expenses currently assigned to {activeDetail.category.name}.
                </p>
                <button
                  onClick={() => onOpenAddExpenseWithCategory(activeDetail.category.id)}
                  className="mt-3 px-4 py-2 bg-[#c4b5a1] text-[#0a0a0a] rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#d8ccbc] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  Add First Expense
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#1a1a1a]">
                {activeDetail.expenses
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((expense) => (
                    <div
                      key={expense.id}
                      className="py-3 flex items-center justify-between gap-4 group hover:bg-[#141414] -mx-2 px-3 rounded-lg transition-colors"
                    >
                      <div>
                        <div className="font-light text-sm text-white">{expense.title}</div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[#e5e5e5]/40 mt-0.5">
                          <span className="text-[#c4b5a1]">{formatDateDisplay(expense.date)}</span>
                          <span>•</span>
                          <span>{expense.time || '--:--'}</span>
                          <span>•</span>
                          <span>{expense.paymentMethod}</span>
                        </div>
                        {expense.notes && (
                          <div className="text-[11px] text-[#e5e5e5]/40 mt-1 italic font-serif">{expense.notes}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-sm font-mono font-medium text-white">
                          {formatCurrency(expense.amount, settings.currencySymbol)}
                        </div>

                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditExpense(expense)}
                            className="p-1.5 rounded-md text-[#e5e5e5]/40 hover:text-[#c4b5a1] hover:bg-[#1a1a1a] cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(expense.id)}
                            className="p-1.5 rounded-md text-[#e5e5e5]/40 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        /* Main Category Grid View */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Header Card */}
          <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-[#c4b5a1]" />
                  <h2 className="text-xl font-serif italic text-white tracking-tight">Category Organizer</h2>
                </div>
                <p className="text-xs text-[#e5e5e5]/40 mt-0.5">
                  Organize expenses category-wise with custom user-created categories & budgets
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#e5e5e5]/40" />
                  <input
                    id="category-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search categories..."
                    className="pl-8 pr-3 py-2 bg-[#141414] border border-[#222222] rounded-lg text-xs text-[#e5e5e5] focus:outline-hidden focus:border-[#c4b5a1] placeholder:text-[#e5e5e5]/30 w-44 sm:w-56"
                  />
                </div>

                {/* Create Custom Category Button */}
                <button
                  id="category-create-new-button"
                  onClick={openCreateModal}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#c4b5a1] hover:bg-[#d8ccbc] text-[#0a0a0a] rounded-lg text-[11px] uppercase tracking-widest font-bold shadow-sm active:scale-98 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ Create Category</span>
                </button>
              </div>
            </div>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats
              .filter((stat) =>
                stat.category.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((stat) => {
                const { category, totalSpent, count, percentage } = stat;
                const isOverBudget =
                  category.budgetLimit && totalSpent > category.budgetLimit;

                return (
                  <motion.div
                    key={category.id}
                    id={`category-card-${category.id}`}
                    whileHover={{ y: -2 }}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className="bg-[#0f0f0f] rounded-2xl p-5 border border-[#1a1a1a] hover:border-[#c4b5a1]/40 cursor-pointer transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-[#262626]"
                            style={{
                              backgroundColor: `${category.color}15`,
                              color: category.color,
                            }}
                          >
                            <CategoryIcon name={category.icon} className="w-5 h-5" />
                          </div>

                          <div>
                            <div className="font-medium text-sm text-white group-hover:text-[#c4b5a1] transition-colors">
                              {category.name}
                            </div>
                            <div className="text-[10px] uppercase font-mono tracking-wider text-[#e5e5e5]/40">{count} transactions</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => openEditModal(category, e)}
                            title="Edit Category"
                            className="p-1.5 rounded-lg text-[#e5e5e5]/30 hover:text-[#c4b5a1] hover:bg-[#161616] transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {category.isCustom && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  confirm(
                                    `Delete category "${category.name}"? Expenses in this category will become uncategorized.`
                                  )
                                ) {
                                  onDeleteCategory(category.id);
                                }
                              }}
                              title="Delete Category"
                              className="p-1.5 rounded-lg text-[#e5e5e5]/30 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Total Spent in this Category */}
                      <div className="mt-4 pt-4 border-t border-[#1a1a1a] flex items-baseline justify-between">
                        <span className="text-[10px] uppercase font-semibold text-[#e5e5e5]/40 tracking-[0.2em]">Total Spend:</span>
                        <span className="text-lg font-light text-white font-mono">
                          {formatCurrency(totalSpent, settings.currencySymbol)}
                        </span>
                      </div>

                      {/* Budget Progress Bar if defined */}
                      {category.budgetLimit ? (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[10px] font-mono text-[#e5e5e5]/40">
                              Cap: {formatCurrency(category.budgetLimit, settings.currencySymbol)}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-semibold ${
                                isOverBudget ? 'text-rose-400' : 'text-[#c4b5a1]'
                              }`}
                            >
                              {Math.round((totalSpent / category.budgetLimit) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-[#1a1a1a] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, (totalSpent / category.budgetLimit) * 100)}%`,
                                backgroundColor: isOverBudget ? '#ef4444' : category.color,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 text-[10px] uppercase font-mono tracking-wider text-[#c4b5a1]">
                          {percentage}% of overall expenses
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1a1a1a] flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-[#c4b5a1] group-hover:text-white transition-colors">
                      <span>View ledger</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* Create / Edit Category Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f0f0f] rounded-2xl p-6 border border-[#1a1a1a] w-full max-w-md text-[#e5e5e5] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-[#c4b5a1]" />
                  <h3 className="font-serif italic text-base text-white">
                    {editingCategory ? 'Edit Category' : 'Create Custom Category'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#1a1a1a] text-[#e5e5e5]/40 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                {/* Category Name */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#e5e5e5]/60 mb-1">
                    Category Name *
                  </label>
                  <input
                    id="category-form-name-input"
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Freelance Tools, Pet Care, Fitness"
                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#222222] rounded-lg text-xs text-[#e5e5e5] focus:outline-hidden focus:border-[#c4b5a1] placeholder:text-[#e5e5e5]/30"
                  />
                </div>

                {/* Pick Icon */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#e5e5e5]/60 mb-1.5">
                    Choose Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1.5 bg-[#141414] rounded-lg border border-[#222222]">
                    {AVAILABLE_CATEGORY_ICONS.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormIcon(iconName)}
                        className={`p-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          formIcon === iconName
                            ? 'bg-[#c4b5a1] text-[#0a0a0a] shadow-xs'
                            : 'hover:bg-[#222222] text-[#e5e5e5]/60 hover:text-white'
                        }`}
                      >
                        <CategoryIcon name={iconName} className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pick Color */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#e5e5e5]/60 mb-1.5">
                    Accent Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormColor(color)}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative cursor-pointer"
                        style={{ backgroundColor: color }}
                      >
                        {formColor === color && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Monthly Budget */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#e5e5e5]/60 mb-1">
                    Monthly Budget Target ({settings.currencySymbol}) (Optional)
                  </label>
                  <input
                    id="category-form-budget-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    placeholder="e.g. 250"
                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#222222] rounded-lg text-xs text-[#e5e5e5] focus:outline-hidden focus:border-[#c4b5a1] placeholder:text-[#e5e5e5]/30"
                  />
                </div>

                {/* Live Preview */}
                <div className="p-3 bg-[#141414] rounded-xl border border-[#222222] flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#262626]"
                    style={{ backgroundColor: `${formColor}20`, color: formColor }}
                  >
                    <CategoryIcon name={formIcon} className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-mono text-[#e5e5e5]/40">Live Preview:</div>
                    <div className="text-xs font-semibold text-white">{formName || 'Category Name'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-xs text-[#e5e5e5]/60 hover:text-white hover:bg-[#1a1a1a] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="category-form-save-btn"
                    type="submit"
                    className="px-5 py-2.5 rounded-lg text-[11px] uppercase tracking-widest font-bold bg-[#c4b5a1] hover:bg-[#d8ccbc] text-[#0a0a0a] shadow-sm cursor-pointer"
                  >
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
