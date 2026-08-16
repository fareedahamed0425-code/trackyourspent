import React, { useState, useRef } from 'react';
import { BankAccount, Expense, Category, UserSettings } from '../types';
import { Building2, Plus, ArrowRight, Trash2, Wallet, History, FileText, Upload, DownloadCloud, Loader2 } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { StatementReconciler } from './StatementReconciler';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebase';

interface BankManagerProps {
  bankAccounts: BankAccount[];
  expenses: Expense[];
  categories: Category[];
  settings: UserSettings;
  onAddBank: (bank: Omit<BankAccount, 'id' | 'createdAt'>) => void;
  onUpdateBank: (bank: BankAccount) => void;
  onDeleteBank: (id: string) => void;
  onSaveExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function BankManager({ 
  bankAccounts, 
  expenses, 
  categories, 
  settings, 
  onAddBank, 
  onUpdateBank, 
  onDeleteBank,
  onSaveExpense
}: BankManagerProps) {
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  
  const [newBankName, setNewBankName] = useState('');
  const [newBankAccountNum, setNewBankAccountNum] = useState('');
  const [newBankColor, setNewBankColor] = useState('#3B82F6');

  const selectedBank = bankAccounts.find(b => b.id === selectedBankId);
  const bankExpenses = expenses.filter(e => e.bankAccountId === selectedBankId);
  const bankTotal = bankExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleCreateBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName) return;
    
    onAddBank({
      name: newBankName,
      accountNumber: newBankAccountNum,
      color: newBankColor
    });
    
    setNewBankName('');
    setNewBankAccountNum('');
    setShowAddModal(false);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBank || !auth.currentUser) return;
    
    // Check if it's a valid file size (e.g. under 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Please upload files under 10MB.");
      return;
    }

    try {
      setIsUploadingPdf(true);
      
      const fileId = `stmt-${Date.now()}`;
      const storageRef = ref(storage, `users/${auth.currentUser.uid}/banks/${selectedBank.id}/${fileId}_${file.name}`);
      
      // Upload
      await uploadBytes(storageRef, file);
      
      // Get URL
      const downloadUrl = await getDownloadURL(storageRef);
      
      // Update Bank Account
      const newStatement = {
        id: fileId,
        fileName: file.name,
        fileUrl: downloadUrl,
        uploadDate: Date.now()
      };
      
      const updatedBank = {
        ...selectedBank,
        storedStatements: [...(selectedBank.storedStatements || []), newStatement]
      };
      
      onUpdateBank(updatedBank);
      
    } catch (err: any) {
      console.error("PDF Upload Failed:", err);
      if (err.message?.includes('unauthorized')) {
        alert("Upload blocked: Please enable Firebase Storage in your Firebase Console and set security rules to allow uploads.");
      } else {
        alert("Failed to upload statement: " + err.message);
      }
    } finally {
      setIsUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  if (isReconciling && selectedBankId) {
    return (
      <StatementReconciler 
        bankId={selectedBankId}
        categories={categories}
        settings={settings}
        onSaveExpense={onSaveExpense}
        onClose={() => setIsReconciling(false)}
      />
    );
  }

  if (selectedBank) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedBankId(null)} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4">
          <ArrowRight className="rotate-180" size={20} /> Back to Banks
        </button>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: selectedBank.color || '#3b82f6' }}></div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{selectedBank.name}</h2>
              {selectedBank.accountNumber && (
                <p className="text-gray-400 font-mono">**** {selectedBank.accountNumber.slice(-4)}</p>
              )}
            </div>
            <button onClick={() => {
              if (confirm('Delete this bank account? Expenses will remain but lose their link to this bank.')) {
                onDeleteBank(selectedBank.id);
                setSelectedBankId(null);
              }
            }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
              <Trash2 size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="col-span-1 md:col-span-1 bg-black/20 rounded-2xl p-6 border border-white/5 flex flex-col justify-center">
              <p className="text-gray-400 text-sm font-medium mb-1">Total Sorted Expenses</p>
              <p className="text-3xl font-bold text-white truncate">{formatCurrency(bankTotal, settings.currencySymbol)}</p>
            </div>
            
            <div className="col-span-1 md:col-span-2 bg-blue-500/10 rounded-2xl p-6 border border-blue-500/20 flex flex-col justify-center items-start">
              <h3 className="text-blue-100 font-medium mb-2">Statement Tools</h3>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setIsReconciling(true)}
                  className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
                >
                  <FileText size={18} /> Smart Sort CSV
                </button>
                
                <input 
                  type="file" 
                  accept=".pdf,image/*" 
                  className="hidden" 
                  ref={pdfInputRef} 
                  onChange={handlePdfUpload} 
                />
                <button 
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={isUploadingPdf}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-wait"
                >
                  {isUploadingPdf ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                  Store PDF/Receipt
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Expenses */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Linked Expenses</h3>
              {bankExpenses.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-black/20 rounded-2xl border border-white/5">
                  <History className="mx-auto mb-3 opacity-50" size={32} />
                  <p>No expenses linked to this bank yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bankExpenses.map(expense => {
                    const category = categories.find(c => c.id === expense.categoryId);
                    return (
                      <div key={expense.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: category?.color + '20' }}>
                            {category?.icon}
                          </div>
                          <div>
                            <p className="text-white font-medium">{expense.title}</p>
                            <p className="text-sm text-gray-400">{expense.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-red-400 font-bold">{formatCurrency(expense.amount, settings.currencySymbol)}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[80px]">{category?.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Stored Statements */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center justify-between">
                Stored Statements
                <span className="text-xs font-medium px-2 py-1 bg-white/10 rounded-md text-gray-400">{selectedBank.storedStatements?.length || 0} Files</span>
              </h3>
              
              {(!selectedBank.storedStatements || selectedBank.storedStatements.length === 0) ? (
                <div className="text-center py-12 text-gray-500 bg-black/20 rounded-2xl border border-white/5">
                  <DownloadCloud className="mx-auto mb-3 opacity-50" size={32} />
                  <p>No raw statements stored yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedBank.storedStatements.sort((a, b) => b.uploadDate - a.uploadDate).map(stmt => (
                    <a 
                      key={stmt.id} 
                      href={stmt.fileUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-blue-400 bg-blue-400/10 shrink-0 group-hover:bg-blue-400 group-hover:text-white transition-colors">
                          <FileText size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{stmt.fileName}</p>
                          <p className="text-xs text-gray-400">{new Date(stmt.uploadDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-gray-500 group-hover:text-white shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bank Accounts</h1>
          <p className="text-gray-400">Link expenses to your real-world bank statements</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bankAccounts.map(bank => {
          const bankTotal = expenses.filter(e => e.bankAccountId === bank.id).reduce((sum, e) => sum + e.amount, 0);
          
          return (
            <button
              key={bank.id}
              onClick={() => setSelectedBankId(bank.id)}
              className="text-left bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: bank.color || '#3b82f6' }}></div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white" style={{ backgroundColor: bank.color || '#3b82f6' }}>
                <Building2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{bank.name}</h3>
              {bank.accountNumber && <p className="text-sm text-gray-400 font-mono mb-4">**** {bank.accountNumber.slice(-4)}</p>}
              
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Expenses</p>
                  <p className="text-white font-medium">{formatCurrency(bankTotal, settings.currencySymbol)}</p>
                </div>
                <ArrowRight size={20} className="text-gray-600 group-hover:text-white transition-colors" />
              </div>
            </button>
          );
        })}

        {bankAccounts.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white/5 border border-white/10 rounded-3xl border-dashed">
            <Wallet className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-xl font-medium text-white mb-2">No Bank Accounts</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">Add your bank accounts to start importing statements and automatically sorting your expenses.</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
            >
              Add First Bank
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1e] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">Add Bank Account</h2>
            <form onSubmit={handleCreateBank} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Bank Name</label>
                <input 
                  type="text" 
                  value={newBankName} 
                  onChange={e => setNewBankName(e.target.value)} 
                  placeholder="e.g. Chase Checking" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Account Number (Optional)</label>
                <input 
                  type="text" 
                  value={newBankAccountNum} 
                  onChange={e => setNewBankAccountNum(e.target.value)} 
                  placeholder="Last 4 digits" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Theme Color</label>
                <div className="flex gap-3">
                  {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewBankColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${newBankColor === color ? 'border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors">
                  Add Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
