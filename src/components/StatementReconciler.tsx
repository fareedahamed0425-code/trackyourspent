import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Expense, Category, UserSettings, PaymentMethod } from '../types';
import { Upload, Check, Trash2, ArrowRight, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { getTodayDateString } from '../utils/storage';

interface StatementReconcilerProps {
  bankId: string;
  categories: Category[];
  settings: UserSettings;
  onSaveExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

interface ProcessedTransaction {
  id: string;
  date: string;
  amount: number;
  title: string;
  categoryId?: string;
  status: 'pending' | 'saved' | 'skipped';
}

export function StatementReconciler({ bankId, categories, settings, onSaveExpense, onClose }: StatementReconcilerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  
  // Mapping State
  const [headers, setHeaders] = useState<string[]>([]);
  const [dateCol, setDateCol] = useState<string>('');
  const [amountCol, setAmountCol] = useState<string>('');
  const [descCol, setDescCol] = useState<string>('');
  const [csvData, setCsvData] = useState<any[]>([]);

  // Processing State
  const [transactions, setTransactions] = useState<ProcessedTransaction[]>([]);
  const [step, setStep] = useState<'upload' | 'mapping' | 'reconcile'>('upload');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length > 0) {
            setHeaders(Object.keys(results.data[0] as object));
            setCsvData(results.data);
            setStep('mapping');
          }
        }
      });
    }
  };

  const startReconciliation = () => {
    if (!dateCol || !amountCol || !descCol) return;

    const processed: ProcessedTransaction[] = csvData.map((row, index) => {
      // Very basic cleaning
      const rawAmt = String(row[amountCol]).replace(/[^0-9.-]+/g, "");
      const amount = Math.abs(parseFloat(rawAmt));
      
      // Try to parse date, fallback to today
      let date = getTodayDateString();
      try {
        const d = new Date(row[dateCol]);
        if (!isNaN(d.getTime())) {
          date = d.toISOString().split('T')[0];
        }
      } catch (e) {}

      return {
        id: `txn-${index}`,
        date: date,
        amount: isNaN(amount) ? 0 : amount,
        title: String(row[descCol]).substring(0, 50),
        status: 'pending'
      };
    }).filter(t => t.amount > 0); // Only positive amounts for expenses

    setTransactions(processed);
    setStep('reconcile');
  };

  const handleSaveTransaction = (txnId: string, categoryId: string) => {
    const txn = transactions.find(t => t.id === txnId);
    if (!txn) return;

    onSaveExpense({
      title: txn.title,
      amount: txn.amount,
      categoryId: categoryId,
      bankAccountId: bankId,
      date: txn.date,
      time: '12:00', // Default time
      paymentMethod: 'Bank Transfer',
      notes: 'Imported from bank statement'
    });

    setTransactions(prev => prev.map(t => t.id === txnId ? { ...t, status: 'saved', categoryId } : t));
  };

  const handleSkipTransaction = (txnId: string) => {
    setTransactions(prev => prev.map(t => t.id === txnId ? { ...t, status: 'skipped' } : t));
  };

  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Statement Reconciler</h2>
          <p className="text-gray-400">Import and categorize your bank transactions</p>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full">
          <Trash2 size={20} />
          <span className="sr-only">Close</span>
        </button>
      </div>

      {step === 'upload' && (
        <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-2xl">
          <Upload className="mx-auto text-blue-400 mb-4" size={48} />
          <h3 className="text-xl font-medium text-white mb-2">Upload CSV Statement</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Download your bank statement as a CSV file and upload it here to auto-import your expenses.
          </p>
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
          >
            Select CSV File
          </button>
        </div>
      )}

      {step === 'mapping' && (
        <div className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-200">
            Please select which columns in your CSV correspond to the required fields.
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Date Column</label>
              <select value={dateCol} onChange={e => setDateCol(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                <option value="">Select...</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Amount Column</label>
              <select value={amountCol} onChange={e => setAmountCol(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                <option value="">Select...</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Description Column</label>
              <select value={descCol} onChange={e => setDescCol(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                <option value="">Select...</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button 
              onClick={startReconciliation}
              disabled={!dateCol || !amountCol || !descCol}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              Start Sorting <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === 'reconcile' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium text-white">{pendingCount} Transactions Left</h3>
            {pendingCount === 0 && (
              <button onClick={onClose} className="px-6 py-2 bg-green-500 text-white rounded-xl font-medium">Done!</button>
            )}
          </div>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {transactions.map(txn => {
              if (txn.status !== 'pending') return null;
              
              return (
                <div key={txn.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between md:items-center">
                  <div>
                    <div className="text-lg font-medium text-white">{txn.title}</div>
                    <div className="text-sm text-gray-400">{txn.date}</div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-xl font-bold text-red-400">
                      {formatCurrency(txn.amount, settings.currencySymbol)}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <button onClick={() => handleSkipTransaction(txn.id)} className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg">
                        Skip
                      </button>
                      
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => handleSaveTransaction(txn.id, cat.id)}
                          className="px-3 py-1.5 text-sm font-medium rounded-lg text-white"
                          style={{ backgroundColor: cat.color }}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {pendingCount === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Check className="mx-auto text-green-500 mb-4" size={48} />
                <p className="text-xl">All transactions sorted!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
