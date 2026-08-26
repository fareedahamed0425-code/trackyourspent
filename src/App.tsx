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
  Github,
  Globe,
  Bot
} from 'lucide-react';
import { Category, Expense, PaymentMethod, UserSettings, BankAccount } from './types';
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
import { BankManager } from './components/BankManager';
import { AIAdvisorView } from './components/AIAdvisorView';

import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = (location.pathname.substring(1) as ActiveTab) || 'dashboard';

  const setActiveTab = (tab: ActiveTab) => {
    navigate(`/${tab}`);
  };

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

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
            if (data.bankAccounts) setBankAccounts(data.bankAccounts);
          } else {
            // First time login, init with defaults, but attempt to migrate existing local storage data
            try {
              const localRawData = localStorage.getItem('daywise_expenses');
              if (localRawData) {
                const localData = JSON.parse(localRawData);
                if (localData.expenses && Array.isArray(localData.expenses)) setExpenses(localData.expenses);
                else setExpenses([]);
                
                if (localData.categories && Array.isArray(localData.categories)) setCategories(localData.categories);
                else setCategories(DEFAULT_CATEGORIES);
                
                if (localData.settings) setSettings({ ...DEFAULT_SETTINGS, ...localData.settings });
                else setSettings(DEFAULT_SETTINGS);
                
                // Clear the local storage after successful migration to prevent re-migrating
                localStorage.removeItem('daywise_expenses');
              } else {
                setExpenses([]);
                setCategories(DEFAULT_CATEGORIES);
                setSettings(DEFAULT_SETTINGS);
              }
            } catch (err) {
              setExpenses([]);
              setCategories(DEFAULT_CATEGORIES);
              setSettings(DEFAULT_SETTINGS);
            }
          }
        } catch (e: any) {
          console.error("Error fetching user data", e);
          alert('Failed to load your data from the cloud: ' + e.message + '\nContinuing with local defaults.');
          setExpenses([]);
          setCategories(DEFAULT_CATEGORIES);
          setSettings(DEFAULT_SETTINGS);
        } finally {
          setDataLoaded(true);
        }
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
        const payload = JSON.parse(JSON.stringify({
          expenses,
          categories,
          settings,
          bankAccounts
        }));
        await setDoc(doc(db, 'users', user.uid), payload, { merge: true });
      } catch (e: any) {
        console.error('Failed to save to cloud', e);
        // Only alert if it's a permission issue or quota issue to not spam the user
        if (e.message?.includes('permission')) {
          alert('Save failed: Database permissions error.');
        }
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
    bankAccountId?: string;
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
                bankAccountId: expenseData.bankAccountId,
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
        bankAccountId: expenseData.bankAccountId,
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

  // Bank Management Handlers
  const handleAddBank = (bank: Omit<BankAccount, 'id' | 'createdAt'>) => {
    const newBank: BankAccount = {
      ...bank,
      id: 'bank-' + Date.now(),
      createdAt: Date.now(),
    };
    setBankAccounts((prev) => [...prev, newBank]);
  };

  const handleUpdateBank = (updatedBank: BankAccount) => {
    setBankAccounts((prev) => prev.map((b) => (b.id === updatedBank.id ? updatedBank : b)));
  };

  const handleDeleteBank = (bankId: string) => {
    setBankAccounts((prev) => prev.filter((b) => b.id !== bankId));
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

  const handleRestoreData = (backup: { expenses: Expense[]; categories?: Category[]; bankAccounts?: BankAccount[] }) => {
    if (backup.expenses) setExpenses(backup.expenses);
    if (backup.categories && backup.categories.length > 0) setCategories(backup.categories);
    if (backup.bankAccounts) setBankAccounts(backup.bankAccounts);
  };

  // Navigation Items for Top Header Bar
  // Navigation Items for Top Header Bar
  const navTabs: { id: string; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'daily', label: 'Day-Wise', icon: CalendarDays },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'banks', label: 'Banks', icon: Wallet },
    { id: 'calculator', label: 'Auto-Calc', icon: Calculator },
    { id: 'history', label: 'History', icon: History },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'ai-advisor', label: 'AI Advisor', icon: Bot },
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
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] flex flex-col antialiased overflow-x-hidden w-full max-w-full selection:bg-[#c4b5a1] selection:text-[#0a0a0a]">
      {/* Skip to Main Content Link for Keyboard / Screen Readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#c4b5a1] focus:text-[#0a0a0a] focus:rounded-lg focus:font-bold focus:shadow-2xl focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Top Navigation Bar */}
      <header role="banner" className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1a1a1a] w-full">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 h-18 flex items-center justify-between gap-2 sm:gap-3">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('dashboard')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab('dashboard'); }}
            aria-label="TrackYourSpent Home Dashboard"
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0 focus-visible:ring-2 focus-visible:ring-[#c4b5a1] focus-visible:outline-none rounded-xl"
          >
            <div className="w-9 h-9 rounded-xl bg-[#141414] border border-[#262626] text-[#c4b5a1] flex items-center justify-center group-hover:border-[#c4b5a1] transition-colors" aria-hidden="true">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-serif italic text-[#c4b5a1] tracking-tight">
                  trackyourspent
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#e5e5e5]/40 -mt-0.5">
                Expense Architect
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav aria-label="Main Desktop Navigation" role="tablist" className="hidden lg:flex items-center gap-0.5 bg-[#111111] p-1 rounded-xl border border-[#222222] shrink-0">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-label={`${tab.label} View`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] xl:text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#c4b5a1] focus-visible:outline-none ${
                    isActive
                      ? 'bg-[#c4b5a1] text-[#0a0a0a] shadow-xs'
                      : 'text-[#e5e5e5]/60 hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => signOut(auth)}
              title="Sign Out"
              aria-label="Sign Out of Application"
              className="flex items-center gap-1.5 px-2.5 py-2 hover:bg-rose-950/30 text-rose-300 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Exit</span>
            </button>
            <button
              id="header-quick-add-btn"
              type="button"
              aria-label="Add a New Expense"
              onClick={() => handleOpenAddExpense()}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#c4b5a1] hover:bg-[#d8ccbc] active:scale-95 text-[#0a0a0a] rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm shrink-0 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sub-Header Horizontal Navigation Bar (for screens below LG) */}
      <nav aria-label="Mobile Navigation" className="lg:hidden bg-[#0d0d0d] border-b border-[#1a1a1a] px-3 py-2 overflow-x-auto flex items-center gap-1.5 scrollbar-none w-full">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-selected={isActive}
              aria-label={`${tab.label} View`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-[#c4b5a1] focus-visible:outline-none ${
                isActive
                  ? 'bg-[#c4b5a1] text-[#0a0a0a] shadow-xs'
                  : 'bg-[#141414] text-[#e5e5e5]/70 hover:bg-[#1f1f1f] border border-[#222222]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
        <div className="w-[1px] h-6 bg-[#222222] mx-1 shrink-0" aria-hidden="true" />
        <button
          type="button"
          aria-label="Exit Application"
          onClick={() => signOut(auth)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 border border-rose-900/30 shrink-0 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Exit</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main id="main-content" role="main" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={
              <motion.div
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
            } />

            <Route path="/daily" element={
              <motion.div
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
            } />

            <Route path="/categories" element={
              <motion.div
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
            } />

            <Route path="/banks" element={
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <BankManager
                  bankAccounts={bankAccounts}
                  expenses={expenses}
                  categories={categories}
                  settings={settings}
                  onAddBank={handleAddBank}
                  onUpdateBank={handleUpdateBank}
                  onDeleteBank={handleDeleteBank}
                  onSaveExpense={handleSaveExpense}
                />
              </motion.div>
            } />

            <Route path="/calculator" element={
              <motion.div
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
            } />

            <Route path="/history" element={
              <motion.div
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
            } />

            <Route path="/export" element={
              <motion.div
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
            } />

            <Route path="/settings" element={
              <motion.div
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
            } />

            <Route path="/ai-advisor" element={
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <AIAdvisorView
                  expenses={expenses}
                  categories={categories}
                  settings={settings}
                />
              </motion.div>
            } />

            {/* Catch-all route for unknown tabs */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Sophisticated Dark Global Status Footer */}
      <footer className="mt-8 px-6 py-10 border-t border-[#1a1a1a] bg-[#050505] flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 text-[#e5e5e5]/60 text-[13px] font-medium">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#262626]"></div>
            <span>Developed by <span className="text-white font-bold tracking-wide text-[14px]">B A Fareed Ahamed</span></span>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#262626]"></div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="https://github.com/fareedahamed0425-code"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-6 py-3 bg-[#111111] hover:bg-[#1a1a1a] active:scale-95 border border-[#222222] rounded-2xl text-[11px] font-bold tracking-[0.15em] text-[#e5e5e5] uppercase transition-all"
            >
              <Github className="w-4 h-4" />
              <span>Github</span>
            </a>
            <a
              href="https://bafareedahamedportfolio.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-6 py-3 bg-[#111111] hover:bg-[#1a1a1a] active:scale-95 border border-[#222222] rounded-2xl text-[11px] font-bold tracking-[0.15em] text-[#e5e5e5] uppercase transition-all"
            >
              <Globe className="w-4 h-4" />
              <span>Portfolio</span>
            </a>
          </div>
        </div>
        
        <div className="w-full max-w-7xl pt-8 border-t border-[#1a1a1a]/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] tracking-[0.2em] uppercase text-[#e5e5e5]/40">
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 sm:gap-6 text-center sm:text-left">
            <span>DAY-WISE CALCULATION ENGINE</span>
            <span className="hidden sm:inline opacity-30">•</span>
            <span>CLOUD-SYNCED FIREBASE ARCHITECTURE</span>
          </div>
          <div className="flex items-center gap-2 text-[#c4b5a1]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c4b5a1] animate-pulse" />
            <span>ACTIVE EXPENSE LEDGER</span>
          </div>
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
        bankAccounts={bankAccounts}
        settings={settings}
        editingExpense={editingExpense}
        defaultDate={modalDefaultDate}
        defaultCategoryId={modalDefaultCategory}
      />
    </div>
  );
}
