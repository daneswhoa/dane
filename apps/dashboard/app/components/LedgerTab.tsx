import React, { useState, useEffect, useRef } from 'react';
import {
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Landmark,
  Filter,
  ChevronDown,
  Calendar,
  Printer,
  Download,
  X,
  Paperclip,
  Loader2
} from 'lucide-react';

export default function LedgerTab() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'revenue' | 'expenses'>('all');
  
  // Filter States
  const [selectedProperty, setSelectedProperty] = useState('All Properties');
  const [selectedDate, setSelectedDate] = useState('All Time');
  
  // Dropdown UI States
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const propertyDropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (propertyDropdownRef.current && !propertyDropdownRef.current.contains(event.target as Node)) {
        setShowPropertyDropdown(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const txRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/ledger`, { credentials: 'include' });
        if (txRes.ok) {
          const txs = await txRes.json();
          if (Array.isArray(txs)) {
            setTransactions(txs);
          }
        }
      } catch (error) {
        console.error('Failed to fetch finance ledger data', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Helper: Extract Month-Year label (e.g. "Jun 2026") from transaction date string
  const getMonthYearLabel = (dateStr: string) => {
    if (!dateStr) return '';
    // Expected dateStr: "YYYY-MM-DD"
    const parts = dateStr.split('-');
    if (parts.length < 2) return '';
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[monthIndex]} ${year}`;
  };

  // Helper: Parse MMM YYYY back into comparable month/year indices
  const isTxInMonthYear = (dateStr: string, label: string) => {
    if (label === 'All Time') return true;
    return getMonthYearLabel(dateStr) === label;
  };

  // Dynamic filter options extracted from active transactions list
  const uniqueProperties = Array.from(new Set(transactions.map((tx) => tx.property).filter(Boolean)));
  const uniqueMonths = Array.from(
    new Set(transactions.map((tx) => getMonthYearLabel(tx.date)).filter(Boolean))
  ).sort((a, b) => {
    // Sort months descending
    const parseMonth = (mStr: string) => {
      const parts = mStr.split(' ');
      const idx = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(parts[0]);
      return new Date(parseInt(parts[1], 10), idx).getTime();
    };
    return parseMonth(b) - parseMonth(a);
  });

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    // 1. Property Filter
    const matchesProperty = selectedProperty === 'All Properties' || tx.property === selectedProperty;
    
    // 2. Date Filter
    const matchesDate = selectedDate === 'All Time' || isTxInMonthYear(tx.date, selectedDate);
    
    // 3. Tab filter (Revenue/Expenses)
    const matchesTab = 
      filterType === 'all' || 
      (filterType === 'revenue' && tx.credit !== null) || 
      (filterType === 'expenses' && tx.debit !== null);

    return matchesProperty && matchesDate && matchesTab;
  });

  // Calculate dynamic summary metrics based on filtered transactions
  const totalRevenue = transactions
    .filter((tx) => (selectedProperty === 'All Properties' || tx.property === selectedProperty) && (selectedDate === 'All Time' || isTxInMonthYear(tx.date, selectedDate)))
    .reduce((sum, tx) => sum + Number(tx.credit || 0), 0);

  const totalExpenses = transactions
    .filter((tx) => (selectedProperty === 'All Properties' || tx.property === selectedProperty) && (selectedDate === 'All Time' || isTxInMonthYear(tx.date, selectedDate)))
    .reduce((sum, tx) => sum + Number(tx.debit || 0), 0);

  const netOperatingIncome = totalRevenue - totalExpenses;
  const cashBalance = netOperatingIncome; // Simple representation of flow

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto w-full animate-fade-in">
      {/* Ledger Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: NOI */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-4 flex flex-col gap-2 transition-colors duration-200 shadow-sm relative overflow-hidden">
          {loading && <div className="absolute inset-0 bg-white/50 dark:bg-ink-900/50 flex items-center justify-center z-10"><Loader2 className="w-4 h-4 animate-spin text-coral-500" /></div>}
          <div className="flex items-center justify-between text-paper-700 dark:text-ink-300">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Operating Income</span>
            <Calculator className="w-4 h-4 text-paper-400 dark:text-ink-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-paper-900 dark:text-white font-mono">
              ${netOperatingIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] font-medium text-paper-500 dark:text-ink-400">
              Filtered
            </span>
          </div>
        </div>

        {/* Metric 2: Revenue */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-4 flex flex-col gap-2 transition-colors duration-200 shadow-sm relative overflow-hidden">
          {loading && <div className="absolute inset-0 bg-white/50 dark:bg-ink-900/50 flex items-center justify-center z-10"><Loader2 className="w-4 h-4 animate-spin text-emerald-500" /></div>}
          <div className="flex items-center justify-between text-paper-700 dark:text-ink-300">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-paper-900 dark:text-white font-mono">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20 flex items-center transition-colors">
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> Live
            </span>
          </div>
        </div>

        {/* Metric 3: Expenses */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-4 flex flex-col gap-2 transition-colors duration-200 shadow-sm relative overflow-hidden">
          {loading && <div className="absolute inset-0 bg-white/50 dark:bg-ink-900/50 flex items-center justify-center z-10"><Loader2 className="w-4 h-4 animate-spin text-coral-500" /></div>}
          <div className="flex items-center justify-between text-paper-700 dark:text-ink-300">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Expenses</span>
            <ArrowDownRight className="w-4 h-4 text-coral-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-paper-900 dark:text-white font-mono">
              ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] font-medium text-coral-700 dark:text-coral-400 bg-coral-50 dark:bg-coral-500/10 px-1.5 py-0.5 rounded border border-coral-100 dark:border-coral-500/20 flex items-center transition-colors">
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> Live
            </span>
          </div>
        </div>

        {/* Metric 4: Cash Balance */}
        <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-4 flex flex-col gap-2 transition-colors duration-200 shadow-sm relative overflow-hidden">
          {loading && <div className="absolute inset-0 bg-white/50 dark:bg-ink-900/50 flex items-center justify-center z-10"><Loader2 className="w-4 h-4 animate-spin text-paper-400" /></div>}
          <div className="flex items-center justify-between text-paper-700 dark:text-ink-300">
            <span className="text-xs font-semibold uppercase tracking-wider">Cash Balance</span>
            <Landmark className="w-4 h-4 text-paper-400 dark:text-ink-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-paper-900 dark:text-white font-mono">
              ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] font-medium text-paper-700 dark:text-ink-300 bg-paper-100 dark:bg-ink-900 px-1.5 py-0.5 rounded border border-paper-200 dark:border-ink-700 flex items-center transition-colors">
              All Operating Accts
            </span>
          </div>
        </div>
      </div>

      {/* Ledger Table Section */}
      <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl overflow-hidden transition-colors duration-200 shadow-sm">
        {/* Filters & Controls */}
        <div className="px-4 py-3 border-b border-paper-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-900/50 flex flex-col gap-3 transition-colors duration-200">
          {/* Advanced Filter Row */}
          <div className="flex flex-wrap items-center gap-2 relative">
            <div className="flex items-center gap-2 border-r border-paper-200 dark:border-ink-700 pr-3">
              <Filter className="w-4 h-4 text-paper-400 dark:text-ink-500" />
              <span className="text-xs font-bold text-paper-700 dark:text-ink-300 uppercase tracking-wider">Filters</span>
            </div>

            {/* Property Filter Dropdown */}
            <div className="relative" ref={propertyDropdownRef}>
              <button 
                onClick={() => {
                  setShowPropertyDropdown(!showPropertyDropdown);
                  setShowDateDropdown(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-ink-850 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-750 transition-all text-xs font-semibold shadow-sm"
              >
                <span className="text-paper-400 dark:text-ink-500 font-medium">Property:</span>
                <span className="text-paper-900 dark:text-white">{selectedProperty}</span>
                <ChevronDown className="w-3.5 h-3.5 text-paper-400" />
              </button>

              {showPropertyDropdown && (
                <div className="absolute left-0 mt-1.5 w-60 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-750 rounded-xl shadow-xl z-50 py-1.5 animate-slide-down">
                  <button
                    onClick={() => {
                      setSelectedProperty('All Properties');
                      setShowPropertyDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-paper-50 dark:hover:bg-ink-800 transition-colors ${
                      selectedProperty === 'All Properties' ? 'text-coral-500 bg-coral-50/20 dark:bg-coral-500/10' : 'text-paper-700 dark:text-ink-200'
                    }`}
                  >
                    All Properties
                  </button>
                  <div className="h-px bg-paper-100 dark:bg-ink-800 my-1" />
                  {uniqueProperties.length === 0 ? (
                    <div className="px-4 py-2 text-xs text-paper-400 dark:text-ink-500 italic">No properties found</div>
                  ) : (
                    uniqueProperties.map((prop: string) => (
                      <button
                        key={prop}
                        onClick={() => {
                          setSelectedProperty(prop);
                          setShowPropertyDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-paper-50 dark:hover:bg-ink-800 transition-colors ${
                          selectedProperty === prop ? 'text-coral-500 bg-coral-50/20 dark:bg-coral-500/10' : 'text-paper-700 dark:text-ink-200'
                        }`}
                      >
                        {prop}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Date Filter Dropdown */}
            <div className="relative" ref={dateDropdownRef}>
              <button 
                onClick={() => {
                  setShowDateDropdown(!showDateDropdown);
                  setShowPropertyDropdown(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-ink-850 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-750 transition-all text-xs font-semibold shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5 text-paper-400" />
                <span className="text-paper-900 dark:text-white">{selectedDate}</span>
                <ChevronDown className="w-3.5 h-3.5 text-paper-400" />
              </button>

              {showDateDropdown && (
                <div className="absolute left-0 mt-1.5 w-48 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-750 rounded-xl shadow-xl z-50 py-1.5 animate-slide-down">
                  <button
                    onClick={() => {
                      setSelectedDate('All Time');
                      setShowDateDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-paper-50 dark:hover:bg-ink-800 transition-colors ${
                      selectedDate === 'All Time' ? 'text-coral-500 bg-coral-50/20 dark:bg-coral-500/10' : 'text-paper-700 dark:text-ink-200'
                    }`}
                  >
                    All Time
                  </button>
                  <div className="h-px bg-paper-100 dark:bg-ink-800 my-1" />
                  {uniqueMonths.length === 0 ? (
                    <div className="px-4 py-2 text-xs text-paper-400 dark:text-ink-500 italic">No periods found</div>
                  ) : (
                    uniqueMonths.map((mStr: string) => (
                      <button
                        key={mStr}
                        onClick={() => {
                          setSelectedDate(mStr);
                          setShowDateDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-paper-50 dark:hover:bg-ink-800 transition-colors ${
                          selectedDate === mStr ? 'text-coral-500 bg-coral-50/20 dark:bg-coral-500/10' : 'text-paper-700 dark:text-ink-200'
                        }`}
                      >
                        {mStr}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="flex-1"></div>

            {/* Export & Print */}
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-lg text-paper-500 hover:text-paper-900 dark:hover:text-white hover:bg-paper-200 dark:hover:bg-ink-700 transition-all font-semibold" title="Print Ledger">
                <Printer className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-paper-700 dark:text-ink-200 hover:bg-paper-200 dark:hover:bg-ink-700 transition-all text-xs font-bold">
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${filterType === 'all' ? 'bg-paper-900 text-white dark:bg-white dark:text-ink-950 border-transparent shadow-sm' : 'bg-transparent border-paper-300 dark:border-ink-700 text-paper-600 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-800'}`}
            >
              All Transactions
            </button>
            <button 
              onClick={() => setFilterType('revenue')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${filterType === 'revenue' ? 'bg-emerald-500 text-white border-transparent shadow-sm shadow-emerald-500/20' : 'bg-transparent border-paper-300 dark:border-ink-700 text-paper-600 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-800'}`}
            >
              Payments Received
            </button>
            <button 
              onClick={() => setFilterType('expenses')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${filterType === 'expenses' ? 'bg-orange-500 text-white border-transparent shadow-sm shadow-orange-500/20' : 'bg-transparent border-paper-300 dark:border-ink-700 text-paper-600 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-800'}`}
            >
              Expenses
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-paper-50 dark:bg-ink-900/50 border-b border-paper-200 dark:border-ink-700 text-[10px] uppercase tracking-wider text-paper-700 dark:text-ink-400 font-semibold transition-colors duration-200">
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Ref / Txn ID</th>
                <th className="px-4 py-3 font-semibold">Details & Payee</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Property</th>
                <th className="px-4 py-3 font-semibold text-right">Debit (Expense)</th>
                <th className="px-4 py-3 font-semibold text-right">Credit (Revenue)</th>
                <th className="px-4 py-3 font-semibold text-center"></th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-paper-100 dark:divide-ink-700/50 transition-colors duration-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-paper-500 dark:text-ink-400">
                    <div className="flex flex-col items-center justify-center">
                       <Landmark className="w-10 h-10 mb-3 text-paper-300 dark:text-ink-600" />
                       <p className="font-semibold text-paper-900 dark:text-white text-sm">No transactions match filters</p>
                       <p className="text-xs mt-1">Try selecting a different property or date period above.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-paper-50 dark:hover:bg-ink-700/30 transition-all duration-150 group font-sans">
                    <td className="px-4 py-3 text-paper-600 dark:text-ink-300 font-mono text-[11px]">
                      {tx.date}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-coral-600 dark:text-coral-400 cursor-pointer hover:underline">{tx.ref}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-paper-900 dark:text-white text-xs">{tx.details}</div>
                      <div className="text-[10px] text-paper-500 dark:text-ink-400">{tx.payee}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-1.5 py-0.5 rounded border text-[10px] font-semibold transition-colors ${
                        tx.credit 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                          : 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20'
                      }`}>
                        {tx.account}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-paper-700 dark:text-ink-200 text-[11px] font-semibold">{tx.property}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-600 dark:text-orange-400 font-mono text-[11px]">
                      {tx.debit ? `$${tx.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                      {tx.credit ? `$${tx.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="p-1 rounded text-paper-400 hover:text-paper-900 dark:hover:text-white hover:bg-paper-200 dark:hover:bg-ink-700 transition-all">
                        <Paperclip className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}

              {/* Row Totals */}
              {filteredTransactions.length > 0 && (
                <tr className="bg-paper-100/50 dark:bg-ink-900/30 border-t border-paper-200 dark:border-ink-700 font-sans font-bold text-paper-900 dark:text-white">
                  <td colSpan={5} className="px-4 py-3 text-right text-xs uppercase tracking-wider text-paper-500 dark:text-ink-400">
                    Page Totals:
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[11px] text-orange-600 dark:text-orange-400">
                    ${filteredTransactions.reduce((sum, tx) => sum + (tx.debit || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                    ${filteredTransactions.reduce((sum, tx) => sum + (tx.credit || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="px-4 py-3 border-t border-paper-200 dark:border-ink-700 flex items-center justify-between text-[11px] text-paper-500 dark:text-ink-400 transition-colors">
            <span>Showing {filteredTransactions.length} transactions</span>
            <div className="flex gap-1">
              <button className="px-2 py-1 rounded hover:bg-paper-100 dark:hover:bg-ink-700 transition-all disabled:opacity-50" disabled>Previous</button>
              <button className="px-2 py-1 rounded bg-paper-200 dark:bg-ink-700 text-paper-900 dark:text-white transition-all">1</button>
              <button className="px-2 py-1 rounded hover:bg-paper-100 dark:hover:bg-ink-700 transition-all disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        )}
      </div>
      <div className="h-8"></div>
    </div>
  );
}
