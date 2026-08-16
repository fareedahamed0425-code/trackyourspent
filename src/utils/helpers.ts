import { Category, Expense } from '../types';

export const formatCurrency = (amount: number, symbol: string = '₹'): string => {
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDateDisplay = (dateStr: string): string => {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === -1) return 'Tomorrow';

    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateStr;
  }
};

export const evaluateMathExpression = (expr: string): { success: boolean; result: number; error?: string } => {
  if (!expr || expr.trim() === '') {
    return { success: false, result: 0, error: 'Empty expression' };
  }

  // Clean expression: allow numbers, decimal, +, -, *, /, %, (, ), spaces
  const sanitized = expr.replace(/[×xX]/g, '*').replace(/[÷]/g, '/').replace(/,/g, '');
  if (!/^[0-9+\-*/().%\s]+$/.test(sanitized)) {
    return { success: false, result: 0, error: 'Invalid characters in expression' };
  }

  try {
    // Safe mathematical evaluation without direct eval of arbitrary scripts
    // Convert percentage like '50%' to '(50/100)' or handles standard arithmetic
    const normalized = sanitized.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
    
    // Function constructor limited strictly to returning numeric math output
    const func = new Function(`"use strict"; return (${normalized})`);
    const val = func();

    if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
      return { success: true, result: Math.round(val * 100) / 100 };
    }
    return { success: false, result: 0, error: 'Cannot evaluate calculation' };
  } catch (err) {
    return { success: false, result: 0, error: (err as Error).message || 'Invalid syntax' };
  }
};

export const exportExpensesToCSV = (
  expenses: Expense[],
  categories: Category[],
  symbol: string = '₹',
  filenamePrefix: string = 'expenses'
) => {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = ['Date', 'Day', 'Time', 'Title', 'Category', 'Amount', 'Currency', 'Payment Method', 'Notes'];

  const rows = expenses.map((exp) => {
    const catName = categoryMap.get(exp.categoryId) || 'Uncategorized';
    const dayName = new Date(exp.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });

    const escapeCsv = (str?: string) => {
      if (!str) return '""';
      return `"${str.replace(/"/g, '""')}"`;
    };

    return [
      exp.date,
      dayName,
      exp.time || '12:00',
      escapeCsv(exp.title),
      escapeCsv(catName),
      exp.amount.toFixed(2),
      symbol,
      escapeCsv(exp.paymentMethod),
      escapeCsv(exp.notes || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportFullBackupJSON = (expenses: Expense[], categories: Category[]) => {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    expenses,
    categories,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `daywise_expenses_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printSummaryReport = (
  expenses: Expense[],
  categories: Category[],
  symbol: string = '₹',
  title: string = 'Expense Summary Report'
) => {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by date
  const dateGroups: { [date: string]: Expense[] } = {};
  expenses.forEach((e) => {
    if (!dateGroups[e.date]) dateGroups[e.date] = [];
    dateGroups[e.date].push(e);
  });

  const sortedDates = Object.keys(dateGroups).sort((a, b) => b.localeCompare(a));

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #1e293b; max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          h1 { margin: 0; font-size: 24px; font-weight: 700; color: #0f172a; }
          .date { color: #64748b; font-size: 14px; }
          .total-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; }
          .day-block { margin-bottom: 24px; }
          .day-title { font-size: 15px; font-weight: 600; color: #334155; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          th { text-align: left; padding: 8px; background: #f1f5f9; color: #475569; font-weight: 600; font-size: 12px; text-transform: uppercase; }
          td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
          .amount { text-align: right; font-weight: 600; font-family: monospace; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>${title}</h1>
            <div class="date">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
          </div>
          <div>
            <button onclick="window.print()" style="padding: 8px 16px; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;">Print / Save as PDF</button>
          </div>
        </div>

        <div class="total-card">
          <div>
            <div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Total Expenses</div>
            <div style="font-size: 28px; font-weight: 700; color: #0f172a;">${symbol}${totalAmount.toFixed(2)}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Transactions</div>
            <div style="font-size: 28px; font-weight: 700; color: #0f172a;">${expenses.length}</div>
          </div>
        </div>

        ${sortedDates
          .map((date) => {
            const list = dateGroups[date];
            const daySum = list.reduce((s, x) => s + x.amount, 0);
            return `
            <div class="day-block">
              <div class="day-title">
                <span>📅 ${date} (${new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })})</span>
                <span>${symbol}${daySum.toFixed(2)}</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Payment</th>
                    <th style="text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${list
                    .map(
                      (item) => `
                    <tr>
                      <td style="color: #64748b; font-size: 12px;">${item.time || '--:--'}</td>
                      <td><strong>${item.title}</strong>${item.notes ? `<br><small style="color: #64748b;">${item.notes}</small>` : ''}</td>
                      <td><span style="display:inline-block; padding: 2px 8px; border-radius: 4px; background: #f1f5f9; font-size: 12px;">${categoryMap.get(item.categoryId) || 'General'}</span></td>
                      <td style="color: #64748b; font-size: 12px;">${item.paymentMethod}</td>
                      <td class="amount">${symbol}${item.amount.toFixed(2)}</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          `;
          })
          .join('')}
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
