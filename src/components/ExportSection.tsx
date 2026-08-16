import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Download,
  FileSpreadsheet,
  Printer,
  FileJson,
  Upload,
  Calendar,
  CheckCircle,
  FolderTree,
  Eye,
  Sparkles,
} from 'lucide-react';
import { Category, Expense, UserSettings } from '../types';
import {
  exportExpensesToCSV,
  exportFullBackupJSON,
  formatCurrency,
  formatDateDisplay,
  printSummaryReport,
} from '../utils/helpers';
import { CategoryIcon } from './CategoryIcon';

interface ExportSectionProps {
  expenses: Expense[];
  categories: Category[];
  settings: UserSettings;
  onRestoreData: (backup: { expenses: Expense[]; categories?: Category[] }) => void;
}

export const ExportSection: React.FC<ExportSectionProps> = ({
  expenses,
  categories,
  settings,
  onRestoreData,
}) => {
  const [dateRange, setDateRange] = useState<'all' | 'today' | '7d' | '30d' | 'this_month' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  // Date filtering for export
  const now = new Date();
  const getFilteredExpenses = () => {
    return expenses.filter((e) => {
      // Category filter
      if (selectedCategory !== 'all' && e.categoryId !== selectedCategory) return false;

      // Date range filter
      if (dateRange === 'today') {
        const todayStr = now.toISOString().split('T')[0];
        return e.date === todayStr;
      }
      if (dateRange === '7d') {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        return e.date >= d.toISOString().split('T')[0];
      }
      if (dateRange === '30d') {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        return e.date >= d.toISOString().split('T')[0];
      }
      if (dateRange === 'this_month') {
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        return e.date >= `${y}-${m}-01`;
      }
      if (dateRange === 'custom') {
        if (customStart && e.date < customStart) return false;
        if (customEnd && e.date > customEnd) return false;
      }
      return true;
    });
  };

  const filteredForExport = getFilteredExpenses();
  const exportTotal = filteredForExport.reduce((sum, e) => sum + e.amount, 0);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadCSV = () => {
    exportExpensesToCSV(
      filteredForExport,
      categories,
      settings.currencySymbol,
      `daywise_expenses_${dateRange}`
    );
    triggerToast('CSV Spreadsheet downloaded successfully!');
  };

  const handleDownloadJSON = () => {
    exportFullBackupJSON(filteredForExport, categories);
    triggerToast('JSON Backup downloaded successfully!');
  };

  const handlePrintReport = () => {
    printSummaryReport(
      filteredForExport,
      categories,
      settings.currencySymbol,
      `Expense Ledger Report (${dateRange.toUpperCase()})`
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.expenses)) {
          onRestoreData(parsed);
          triggerToast('Data restored from JSON backup successfully!');
        } else if (Array.isArray(parsed)) {
          onRestoreData({ expenses: parsed });
          triggerToast('Data restored successfully!');
        } else {
          alert('Invalid backup JSON format. Missing expenses array.');
        }
      } catch (err) {
        alert('Failed to parse JSON file: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Download & Export Reports</h2>
              <p className="text-xs text-slate-500">
                Download your day-wise expense records at any time as CSV, PDF/Print, or JSON backup
              </p>
            </div>
          </div>

          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </div>

        {/* Filter Configuration for Export */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Time Range
            </label>
            <select
              id="export-date-range-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as unknown as typeof dateRange)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Expenses ({expenses.length} total)</option>
              <option value="today">Today Only</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="this_month">This Month</option>
              <option value="custom">Custom Date Range...</option>
            </select>
          </div>

          {dateRange === 'custom' ? (
            <div className="flex items-center gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Filter by Category
              </label>
              <select
                id="export-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Export Payload Overview */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Ready to Export</div>
              <div className="text-sm font-bold text-slate-800">
                {filteredForExport.length} items ({formatCurrency(exportTotal, settings.currencySymbol)})
              </div>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg font-semibold">
              Ready
            </span>
          </div>
        </div>
      </div>

      {/* 3 Download Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CSV Download Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xs border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">CSV Spreadsheet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Standard comma-separated table with Day, Date, Item, Category, Amount, and Payment details.
            </p>
          </div>

          <button
            id="export-download-csv-btn"
            onClick={handleDownloadCSV}
            disabled={filteredForExport.length === 0}
            className="mt-6 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV (.csv)</span>
          </button>
        </div>

        {/* Printable / PDF Report */}
        <div className="bg-white rounded-3xl p-6 shadow-2xs border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Printable Statement / PDF</h3>
            <p className="text-xs text-slate-500 mt-1">
              Generates a clean, high-contrast formal printable ledger report with day-wise group headers.
            </p>
          </div>

          <button
            id="export-print-report-btn"
            onClick={handlePrintReport}
            disabled={filteredForExport.length === 0}
            className="mt-6 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>

        {/* JSON Backup & Restore */}
        <div className="bg-white rounded-3xl p-6 shadow-2xs border border-slate-200 hover:border-cyan-300 hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
              <FileJson className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">JSON Backup & Restore</h3>
            <p className="text-xs text-slate-500 mt-1">
              Export complete structured JSON state or restore from an earlier backup anytime.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <button
              id="export-download-json-btn"
              onClick={handleDownloadJSON}
              disabled={filteredForExport.length === 0}
              className="flex-1 py-2.5 px-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-200 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup JSON</span>
            </button>

            <label className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Restore</span>
              <input
                id="export-restore-json-input"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Live Data Preview Table */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800">
              Export Data Preview ({filteredForExport.length} entries)
            </h3>
          </div>
          <span className="text-xs font-semibold text-indigo-600">
            Total: {formatCurrency(exportTotal, settings.currencySymbol)}
          </span>
        </div>

        {filteredForExport.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No expenses match the selected export criteria.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Date & Day</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Item Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredForExport.slice(0, 30).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium">{formatDateDisplay(item.date)}</td>
                    <td className="py-2 px-3 text-slate-400">{item.time || '--:--'}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{item.title}</td>
                    <td className="py-2 px-3">{categoryMap.get(item.categoryId) || 'General'}</td>
                    <td className="py-2 px-3 text-slate-500">{item.paymentMethod}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(item.amount, settings.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredForExport.length > 30 && (
              <div className="text-center text-[11px] text-slate-400 py-2 border-t border-slate-100">
                Showing first 30 rows out of {filteredForExport.length} entries. All will be included in the download.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
