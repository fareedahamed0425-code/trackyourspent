import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  CalendarDays,
  FolderTree,
  Calculator,
  History,
  Download,
  Settings,
  Plus,
  Compass,
  Wallet,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { ActiveTab, Category, Expense, PaymentMethod, UserSettings } from './types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SETTINGS,
  generateSampleExpenses,
  getTodayDateString,
} from './utils/storage';
import { SpinMenu } from './components/SpinMenu';
import { DashboardView } from './components/DashboardView';
import { DailyView } from './components/DailyView';
import { CategoryManager } from './components/CategoryManager';
import { AutoCalculator } from './components/AutoCalculator';
import { HistorySection } from './components/HistorySection';
import { ExportSection } from './components/ExportSection';
import { SettingsView } from './components/SettingsView';
import { ExpenseModal } from './components/ExpenseModal';
import { LoginView } from './components/LoginView';

import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // 1. Core State Initialization
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);
  const [modalDefaultCategory, setModalDefaultCategory] = useState<string | undefined>(undefined);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.expenses) setExpenses(data.expenses);
            if (data.categories) setCategories(data.categories);
            if (data.settings) setSettings(data.settings);
          } else {
            // First time login, init with defaults
            setExpenses(generateSampleExpenses());
            setCategories(DEFAULT_CATEGORIES);
            setSettings(DEFAULT_SETTINGS);
          }
        } catch (e) {
          console.error("Error fetching user data", e);
        }
        setDataLoaded(true);
      } else {
        setDataLoaded(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Persistence Synchronization
  useEffect(() => {
    if (!user || !dataLoaded) return;
    const saveToCloud = async () => {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          expenses,
          categories,
          settings
        }, { merge: true });
      } catch (e) {
        console.error('Failed to save to cloud', e);
      }
    };
    
    // Add a small debounce
    const timeoutId = setTimeout(saveToCloud, 500);
    return () => clearTimeout(timeoutId);
  }, [expenses, categories, settings, user, dataLoaded]);

  // 3. Expense Actions
  const handleSaveExpense = (expenseData: {
    id?: string;
    title: string;
    amount: number;
    categoryId: string;
    date: string;
    time: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => {
    if (expenseData.id) {
      // Update existing
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === expenseData.id
            ? {
                ...item,
                title: expenseData.title,
                amount: expenseData.amount,
                categoryId: expenseData.categoryId,
                date: expenseData.date,
                time: expenseData.time,
                paymentMethod: expenseData.paymentMethod,
                notes: expenseData.notes,
                updatedAt: Date.now(),
              }
            : item
        )
      );
    } else {
      // Add new
      const newExpense: Expense = {
        id: 'exp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        title: expenseData.title,
        amount: expenseData.amount,
        categoryId: expenseData.categoryId,
        date: expenseData.date,
        time: expenseData.time,
        paymentMethod: expenseData.paymentMethod,
        notes: expenseData.notes,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setExpenses((prev) => [newExpense, ...prev]);
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setModalDefaultDate(expense.date);
    setModalDefaultCategory(expense.categoryId);
    setIsExpenseModalOpen(true);
  };

  const handleOpenAddExpense = (defaultDateStr?: string, defaultCatId?: string) => {
    setEditingExpense(null);
    setModalDefaultDate(defaultDateStr || selectedDate);
    setModalDefaultCategory(defaultCatId);
    setIsExpenseModalOpen(true);
  };

  // 4. Calculator Quick Add
  const handleAddCalculatedExpense = (expenseData: {
    title: string;
    amount: number;
    categoryId: string;
    notes?: string;
  }) => {
    const today = getTodayDateString();
    const d = new Date();
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    const newExpense: Expense = {
      id: 'exp-calc-' + Date.now(),
      title: expenseData.title,
      amount: expenseData.amount,
      categoryId: expenseData.categoryId,
      date: today,
      time: time,
      paymentMethod: 'UPI / Online',
      notes: expenseData.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setExpenses((prev) => [newExpense, ...prev]);
  };

  // 5. Category Management Handlers
  const handleAddCategory = (categoryData: Omit<Category, 'id' | 'createdAt'>) => {
    const newCat: Category = {
      ...categoryData,
      id: 'cat-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const handleUpdateCategory = (updatedCat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  // 6. Settings & Data Restore
  const handleUpdateSettings = (newPartial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newPartial }));
  };

  const handleResetData = () => {
    setExpenses([]);
  };

  const handleLoadSampleData = () => {
    // Generate empty data based on our previous logic change
    setExpenses(generateSampleExpenses());
    setCategories(DEFAULT_CATEGORIES);
  };

  const handleRestoreData = (backup: { expenses: Expense[]; categories?: Category[] }) => {
    if (backup.expenses) setExpenses(backup.expenses);
    if (backup.categories && backup.categories.length > 0) setCategories(backup.categories);
  };

  // Navigation Items for Top Header Bar
  const navTabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'daily', label: 'Day-Wise', icon: CalendarDays },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'calculator', label: 'Auto-Calc', icon: Calculator },
    { id: 'history', label: 'History', icon: History },
    { id: 'export', label: 'Download', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c4b5a1]/30 border-t-[#c4b5a1] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c4b5a1]/30 border-t-[#c4b5a1] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] flex flex-col antialiased selection:bg-[#c4b5a1] selection:text-[#0a0a0a]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#262626] text-[#c4b5a1] flex items-center justify-center group-hover:border-[#c4b5a1] transition-colors">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-serif italic text-[#c4b5a1] tracking-tight">
                  trackyourspent
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#e5e5e5]/40 mt-0.5">
                Personal Expense Architect
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#111111] p-1.5 rounded-xl border border-[#222222]">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-lg text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#c4b5a1] text-[#0a0a0a] shadow-xs'
                      : 'text-[#e5e5e5]/60 hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => signOut(auth)}
              className="hidden md:flex items-center gap-2 px-3 py-2.5 hover:bg-rose-950/30 text-rose-300 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
            <button
              id="header-quick-add-btn"
              onClick={() => handleOpenAddExpense()}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#c4b5a1] hover:bg-[#d8ccbc] active:scale-95 text-[#0a0a0a] rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Expense</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Horizontal Navigation Scroll */}
      <div className="md:hidden bg-[#0d0d0d] border-b border-[#1a1a1a] px-4 py-2 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                isActive
                  ? 'bg-[#c4b5a1] text-[#0a0a0a] shadow-xs'
                  : 'bg-[#141414] text-[#e5e5e5]/70 hover:bg-[#1f1f1f] border border-[#222222]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="tab-dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DashboardView
                expenses={expenses}
                categories={categories}
                settings={settings}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onSelectDate={(date) => setSelectedDate(date)}
                onOpenAddExpense={() => handleOpenAddExpense()}
              />
            </motion.div>
          )}

          {activeTab === 'daily' && (
            <motion.div
              key="tab-daily"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <DailyView
                expenses={expenses}
                categories={categories}
                settings={settings}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onOpenAddExpense={(defaultDate) => handleOpenAddExpense(defaultDate)}
                onEditExpense={handleEditExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            </motion.div>
          )}

          {activeTab === 'categories' && (
            <motion.div
              key="tab-categories"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <CategoryManager
                categories={categories}
                expenses={expenses}
                settings={settings}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onOpenAddExpenseWithCategory={(catId) => handleOpenAddExpense(undefined, catId)}
                onEditExpense={handleEditExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            </motion.div>
          )}

          {activeTab === 'calculator' && (
            <motion.div
              key="tab-calculator"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <AutoCalculator
                expenses={expenses}
                categories={categories}
                settings={settings}
                onAddCalculatedExpense={handleAddCalculatedExpense}
              />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="tab-history"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <HistorySection
                expenses={expenses}
                categories={categories}
                settings={settings}
                onEditExpense={handleEditExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            </motion.div>
          )}

          {activeTab === 'export' && (
            <motion.div
              key="tab-export"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <ExportSection
                expenses={expenses}
                categories={categories}
                settings={settings}
                onRestoreData={handleRestoreData}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="tab-settings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <SettingsView
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onResetData={handleResetData}
                onLoadSampleData={handleLoadSampleData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sophisticated Dark Global Status Footer */}
      <footer className="px-6 py-4 border-t border-[#1a1a1a] bg-[#050505] text-[10px] tracking-[0.2em] uppercase text-[#e5e5e5]/40 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-6">
          <span>DAY-WISE CALCULATION ENGINE</span>
          <span className="hidden sm:inline opacity-30">•</span>
          <span>CLOUD-SYNCED FIREBASE ARCHITECTURE</span>
        </div>
        <div className="flex items-center gap-2 text-[#c4b5a1]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c4b5a1] animate-pulse" />
          <span>ACTIVE EXPENSE LEDGER</span>
        </div>
      </footer>

      {/* Floating Corner "Spin to Open" Tab Navigation Menu */}
      <SpinMenu
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenAddExpense={() => handleOpenAddExpense()}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Expense Modal (Add / Edit) */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        categories={categories}
        settings={settings}
        editingExpense={editingExpense}
        defaultDate={modalDefaultDate}
        defaultCategoryId={modalDefaultCategory}
      />
    </div>
  );
}
