import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Home,
  Minus,
  AlertCircle,
  FileText,
  ArrowRight,
  Droplet,
  CreditCard,
  FileSignature,
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  Loader2,
  Sparkles,
  Building,
  User,
  Wrench,
  ChevronRight,
  Inbox,
  Check,
  Building2,
  BellRing
} from 'lucide-react';

export default function OverviewTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);

  // Todo Form states
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDate, setNewTodoDate] = useState(new Date().toISOString().split('T')[0]);
  const [addingTodo, setAddingTodo] = useState(false);
  const [showTodoForm, setShowTodoForm] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const host = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      const [revRes, propRes, notifRes, todoRes, invRes, maintRes, tenantRes] = await Promise.all([
        fetch(`${host}/api/dashboard/summary`, { credentials: 'include' }),
        fetch(`${host}/api/dashboard/properties`, { credentials: 'include' }),
        fetch(`${host}/api/notifications`, { credentials: 'include' }),
        fetch(`${host}/api/dashboard/todos`, { credentials: 'include' }),
        fetch(`${host}/api/dashboard/invoices`, { credentials: 'include' }),
        fetch(`${host}/api/dashboard/maintenance`, { credentials: 'include' }),
        fetch(`${host}/api/dashboard/tenants`, { credentials: 'include' }),
      ]);

      if (!revRes.ok || !propRes.ok || !notifRes.ok || !todoRes.ok || !invRes.ok || !maintRes.ok || !tenantRes.ok) {
        throw new Error('Failed to load dashboard data. Please make sure you are logged in.');
      }

      const [rev, props, notifs, todosList, invs, maint, tenantsList] = await Promise.all([
        revRes.json(),
        propRes.json(),
        notifRes.json(),
        todoRes.json(),
        invRes.json(),
        maintRes.json(),
        tenantRes.json(),
      ]);

      setRevenueData(rev);
      setProperties(props);
      setNotifications(notifs);
      setTodos(todosList);
      setInvoices(invs);
      setMaintenance(maint);
      setTenants(tenantsList);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'An unexpected error occurred while loading dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      setAddingTodo(true);
      const host = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${host}/api/dashboard/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTodoTitle.trim(),
          dueDate: new Date(newTodoDate).toISOString()
        }),
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to create task');
      }

      setNewTodoTitle('');
      setShowTodoForm(false);
      
      // Refresh to fetch latest tasks
      const todoRes = await fetch(`${host}/api/dashboard/todos`, { credentials: 'include' });
      if (todoRes.ok) {
        const freshTodos = await todoRes.json();
        setTodos(freshTodos);
      }
    } catch (err) {
      console.error(err);
      alert('Could not add task. Please try again.');
    } finally {
      setAddingTodo(false);
    }
  };

  const handleToggleTodo = async (id: string, isCompleted: boolean) => {
    try {
      const host = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${host}/api/dashboard/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isCompleted
        }),
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to toggle task');
      }

      // Optimistically toggle locally
      setTodos(prev => prev.map(t => t.id === id ? { ...t, isCompleted } : t));
    } catch (err) {
      console.error(err);
      alert('Could not update task status.');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const host = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${host}/api/dashboard/todos/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to delete task');
      }

      // Remove locally
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
      alert('Could not delete task.');
    }
  };

  // Calculations for Metrics Row
  const revenueVal = revenueData?.totalRevenue ? Number(revenueData.totalRevenue) : 0;
  
  // Occupancy Rate
  const totalUnits = properties.reduce((sum, p) => sum + (p.units || 0), 0);
  const totalOccupied = properties.reduce((sum, p) => {
    const rate = parseFloat(p.occupancy) || 0;
    return sum + Math.round((p.units * rate) / 100);
  }, 0);
  const occupancyRate = totalUnits > 0 ? (totalOccupied / totalUnits) * 100 : 100;

  // Open Tickets
  const openTicketsList = maintenance.filter(t => t.status !== 'completed' && t.status !== 'paid');
  const openTicketsCount = openTicketsList.length;
  const criticalTicketsCount = openTicketsList.filter(t => 
    ['high', 'critical', 'emergency'].includes(t.urgency?.toLowerCase() || '')
  ).length;

  // Lease Renewals (ending in next 30 days)
  const now = new Date();
  const next30Days = new Date();
  next30Days.setDate(now.getDate() + 30);
  const leaseRenewalsCount = tenants.filter(t => {
    if (!t.leaseEnd) return false;
    const end = new Date(t.leaseEnd);
    return end >= now && end <= next30Days;
  }).length;

  // Top 4 properties with high occupancy
  const topOccupancyProperties = [...properties]
    .sort((a, b) => parseFloat(b.occupancy) - parseFloat(a.occupancy))
    .slice(0, 4);

  // 4 recent notifications
  const recentNotifications = notifications.slice(0, 4);

  // 3 recent payments (PAID invoices)
  const recentPayments = invoices
    .filter(inv => ['paid', 'reconciled'].includes(inv.status?.toLowerCase() || ''))
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 3);

  // 3 recent maintenance requests
  const recentMaintenance = maintenance.slice(0, 3);

  // Filter Todos date-based rule
  const filteredTodos = todos.filter(todo => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todoDateStr = new Date(todo.dueDate).toISOString().split('T')[0];

    // Show if due today
    if (todoDateStr === todayStr) {
      return true;
    }

    // Show if in the past and NOT completed (overdue)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(todo.dueDate);
    due.setHours(0, 0, 0, 0);

    if (due < today && !todo.isCompleted) {
      return true;
    }

    return false;
  });

  const formatTodoDate = (dateStr: string, isCompleted: boolean) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const itemDateStr = new Date(dateStr).toISOString().split('T')[0];
    if (itemDateStr === todayStr) {
      return 'Today';
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);

    if (due < today) {
      return isCompleted ? 'Completed past due' : 'Overdue';
    }
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Dynamic Revenue vs Expenses Chart (sets final group data dynamically)
  const rev = revenueVal;
  const exp = revenueData?.totalExpenses ? Number(revenueData.totalExpenses) : 0;
  const maxChartVal = Math.max(rev, exp, 10000);
  const currentMonthRevHeight = `${Math.min(95, Math.max(12, (rev / maxChartVal) * 90))}%`;
  const currentMonthExpHeight = `${Math.min(95, Math.max(12, (exp / maxChartVal) * 90))}%`;

  // Dynamic Tasks Completion values
  const completedTickets = maintenance.filter(t => ['completed', 'paid'].includes(t.status?.toLowerCase() || '')).length;
  const totalTickets = maintenance.length;
  const ticketCompletionRate = totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 100;

  const activeTenants = tenants.filter(t => t.status === 'ACTIVE').length;
  const activeLeaseRate = tenants.length > 0 ? Math.round((activeTenants / tenants.length) * 100) : 100;

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6 w-full animate-pulse bg-paper-50/50 dark:bg-ink-950/20">
        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl p-4 h-24 flex flex-col justify-between shadow-sm">
              <div className="h-3 w-1/3 bg-paper-250 dark:bg-ink-800 rounded"></div>
              <div className="h-6 w-2/3 bg-paper-300 dark:bg-ink-700 rounded mt-2"></div>
            </div>
          ))}
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl p-5 h-64 shadow-sm">
              <div className="h-4 w-1/4 bg-paper-250 dark:bg-ink-800 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="h-10 bg-paper-150 dark:bg-ink-850 rounded"></div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl p-5 h-64 shadow-sm">
              <div className="h-4 w-1/4 bg-paper-250 dark:bg-ink-800 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="h-12 bg-paper-150 dark:bg-ink-850 rounded"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl p-5 h-72 shadow-sm">
              <div className="h-4 w-1/3 bg-paper-250 dark:bg-ink-800 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="h-10 bg-paper-150 dark:bg-ink-850 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 w-full animate-fade-in bg-paper-50/50 dark:bg-ink-950/20">
      {error && (
        <div className="bg-coral-500/10 border border-coral-500/20 text-coral-600 dark:text-coral-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-paper-300 dark:hover:border-ink-700 transition-all duration-200">
          <div className="flex items-center justify-between text-paper-500 dark:text-ink-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="p-1.5 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-paper-900 dark:text-white">
              ${revenueVal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 flex items-center bg-green-500/10 px-1.5 py-0.5 rounded">
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> Live
            </span>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-paper-300 dark:hover:border-ink-700 transition-all duration-200">
          <div className="flex items-center justify-between text-paper-500 dark:text-ink-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Occupancy Rate</span>
            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-paper-900 dark:text-white">
              {occupancyRate.toFixed(1)}%
            </span>
            <span className="text-[9px] text-paper-400 dark:text-ink-500 font-medium">
              {totalOccupied} of {totalUnits} Units occupied
            </span>
          </div>
        </div>

        {/* Open Tickets */}
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-paper-300 dark:hover:border-ink-700 transition-all duration-200">
          <div className="flex items-center justify-between text-paper-500 dark:text-ink-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Open Tickets</span>
            <div className="p-1.5 bg-coral-500/10 rounded-lg text-coral-600 dark:text-coral-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-paper-900 dark:text-white">
              {openTicketsCount}
            </span>
            {criticalTicketsCount > 0 ? (
              <span className="text-[10px] font-semibold text-coral-600 dark:text-coral-400 bg-coral-500/10 px-1.5 py-0.5 rounded">
                {criticalTicketsCount} urgent
              </span>
            ) : (
              <span className="text-[9px] text-paper-400 dark:text-ink-500 font-medium">All clear</span>
            )}
          </div>
        </div>

        {/* Lease Renewals */}
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-paper-300 dark:hover:border-ink-700 transition-all duration-200">
          <div className="flex items-center justify-between text-paper-500 dark:text-ink-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Lease Renewals</span>
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-paper-900 dark:text-white">
              {leaseRenewalsCount}
            </span>
            <span className="text-[9px] text-paper-400 dark:text-ink-500 font-medium">Next 30 days</span>
          </div>
        </div>
      </div>

      {/* Main Grid: col-span-2 & col-span-1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: col-span-2 */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Top Properties Occupancy Table */}
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-paper-150 dark:border-ink-800 flex items-center justify-between">
              <h2 className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-coral-500" />
                Portfolio occupancy leaders
              </h2>
              <span className="text-[10px] font-semibold text-paper-400 dark:text-ink-500">Top 4 Occupied</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-paper-200 dark:border-ink-800 bg-paper-50/50 dark:bg-ink-950/20">
                    <th className="py-2.5 px-5 text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wider">Property Name</th>
                    <th className="py-2.5 px-5 text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wider">Address</th>
                    <th className="py-2.5 px-5 text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wider text-right">Units</th>
                    <th className="py-2.5 px-5 text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wider text-right">Occupancy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-100 dark:divide-ink-800">
                  {topOccupancyProperties.length > 0 ? (
                    topOccupancyProperties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-paper-50/50 dark:hover:bg-ink-800/20 transition-colors">
                        <td className="py-3 px-5 text-xs font-semibold text-paper-900 dark:text-white">
                          {prop.name}
                        </td>
                        <td className="py-3 px-5 text-xs text-paper-500 dark:text-ink-400 max-w-[200px] truncate">
                          {prop.address}
                        </td>
                        <td className="py-3 px-5 text-xs text-paper-700 dark:text-ink-300 text-right font-medium">
                          {prop.units}
                        </td>
                        <td className="py-3 px-5 text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            parseInt(prop.occupancy) >= 90 
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                              : parseInt(prop.occupancy) >= 50 
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'bg-coral-500/10 text-coral-600 dark:text-coral-400'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {prop.occupancy}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-paper-400 dark:text-ink-500 font-medium">
                        No properties found. Add properties to populate this list.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Payments Panel */}
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-paper-150 dark:border-ink-800 flex items-center justify-between">
              <h2 className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-green-500" />
                Recent Payments Received
              </h2>
              <span className="text-[10px] font-semibold text-paper-400 dark:text-ink-500">Last 3 paid transactions</span>
            </div>

            <div className="divide-y divide-paper-100 dark:divide-ink-800">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-paper-50/50 dark:hover:bg-ink-800/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-paper-900 dark:text-white">
                          {payment.tenantName}
                        </div>
                        <div className="text-[10px] text-paper-400 dark:text-ink-500 flex items-center gap-1.5 mt-0.5">
                          <span>{payment.invoiceNumber}</span>
                          <span className="w-1 h-1 rounded-full bg-paper-300 dark:bg-ink-700"></span>
                          <span>{payment.type}</span>
                          {payment.propertyName && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-paper-300 dark:bg-ink-700"></span>
                              <span className="truncate max-w-[120px]">{payment.propertyName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-paper-900 dark:text-white">
                        +${Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[9px] text-paper-400 dark:text-ink-500 mt-0.5">
                        {payment.issueDate}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-paper-400 dark:text-ink-500 font-medium flex flex-col items-center gap-2">
                  <Inbox className="w-6 h-6 text-paper-300 dark:text-ink-700" />
                  <span>No recent payments found.</span>
                </div>
              )}
            </div>
          </div>

          {/* Priority Alerts & Notifications */}
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-paper-150 dark:border-ink-800 flex items-center justify-between">
              <h2 className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <BellRing className="w-4 h-4 text-coral-500" />
                Priority Alerts
              </h2>
              {recentNotifications.length > 0 && (
                <span className="bg-coral-500/10 text-coral-600 dark:text-coral-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Recent {recentNotifications.length}
                </span>
              )}
            </div>

            <div className="divide-y divide-paper-100 dark:divide-ink-800">
              {recentNotifications.length > 0 ? (
                recentNotifications.map((notif) => {
                  const isMaintenance = notif.title.toLowerCase().includes('maintenance') || notif.title.toLowerCase().includes('leak');
                  const isPayment = notif.title.toLowerCase().includes('pay') || notif.title.toLowerCase().includes('invoice');

                  return (
                    <div key={notif.id} className="p-4 flex gap-3.5 hover:bg-paper-50/50 dark:hover:bg-ink-800/20 transition-colors">
                      <div className={`p-2 h-fit rounded-lg ${
                        isMaintenance ? 'bg-coral-500/10 text-coral-600 dark:text-coral-400' :
                        isPayment ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                        'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}>
                        {isMaintenance ? <Wrench className="w-4 h-4" /> :
                         isPayment ? <CreditCard className="w-4 h-4" /> :
                         <Sparkles className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-paper-900 dark:text-white flex items-center gap-2">
                          {notif.title}
                          {!notif.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-coral-500 flex-shrink-0 animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[9px] text-paper-400 dark:text-ink-500 mt-2 block">
                          {new Date(notif.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-paper-400 dark:text-ink-500 font-medium flex flex-col items-center gap-2">
                  <Inbox className="w-6 h-6 text-paper-300 dark:text-ink-700" />
                  <span>No alerts or notifications.</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: col-span-1 */}
        <div className="space-y-6">
          
          {/* To-Do List Task Manager */}
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="px-5 py-4 border-b border-paper-150 dark:border-ink-800 flex items-center justify-between">
              <h2 className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-coral-500" />
                Active Tasks
              </h2>
              <button
                onClick={() => setShowTodoForm(!showTodoForm)}
                className="p-1 bg-coral-500 hover:bg-coral-600 text-white rounded-lg active:scale-95 transition-transform"
                title="Add Task"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Todo Form */}
            {showTodoForm && (
              <form onSubmit={handleAddTodo} className="p-4 border-b border-paper-150 dark:border-ink-800 bg-paper-50/50 dark:bg-ink-950/20 space-y-3 animate-slide-down">
                <div>
                  <label className="block text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter task item..."
                    className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-lg text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 transition-colors"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-lg text-paper-900 dark:text-white focus:outline-none focus:border-coral-500 transition-colors"
                    value={newTodoDate}
                    onChange={(e) => setNewTodoDate(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowTodoForm(false)}
                    className="px-2.5 py-1 text-[10px] font-semibold text-paper-500 hover:text-paper-700 dark:text-ink-400 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingTodo}
                    className="px-3 py-1 bg-coral-500 hover:bg-coral-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all shadow-sm"
                  >
                    {addingTodo ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Task'}
                  </button>
                </div>
              </form>
            )}

            {/* Todo Items List */}
            <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
              {filteredTodos.length > 0 ? (
                filteredTodos.map((todo) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isOverdue = new Date(todo.dueDate) < new Date() && !todo.isCompleted && new Date(todo.dueDate).toISOString().split('T')[0] !== todayStr;

                  return (
                    <div
                      key={todo.id}
                      className="group flex items-center justify-between p-2.5 bg-paper-50 dark:bg-ink-950/40 rounded-lg border border-paper-150 dark:border-ink-800 hover:border-paper-250 dark:hover:border-ink-700 transition-all duration-200"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleTodo(todo.id, !todo.isCompleted)}
                          className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
                            todo.isCompleted
                              ? 'bg-coral-500 border-coral-500 text-white shadow-sm'
                              : 'border-paper-300 dark:border-ink-700 hover:border-coral-500 bg-white dark:bg-ink-900'
                          }`}
                        >
                          {todo.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <div className="min-w-0">
                          <span className={`text-xs block truncate ${todo.isCompleted ? 'line-through text-paper-400 dark:text-ink-500' : 'text-paper-900 dark:text-white font-medium'}`}>
                            {todo.title}
                          </span>
                          <span className={`text-[9px] font-semibold mt-0.5 block ${isOverdue ? 'text-coral-500 dark:text-coral-400' : 'text-paper-400 dark:text-ink-500'}`}>
                            {formatTodoDate(todo.dueDate, todo.isCompleted)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="p-1 text-paper-400 hover:text-coral-500 dark:text-ink-500 dark:hover:text-coral-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity rounded hover:bg-paper-100 dark:hover:bg-ink-800"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-paper-400 dark:text-ink-500 font-medium flex flex-col items-center gap-1">
                  <CheckSquare className="w-6 h-6 text-paper-200 dark:text-ink-800" />
                  <span>All tasks completed!</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Maintenance Requests */}
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-paper-150 dark:border-ink-800 flex items-center justify-between">
              <h2 className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-coral-500" />
                Maintenance Requests
              </h2>
              <span className="text-[10px] font-semibold text-paper-400 dark:text-ink-500">Recent 3</span>
            </div>

            <div className="divide-y divide-paper-100 dark:divide-ink-800">
              {recentMaintenance.length > 0 ? (
                recentMaintenance.map((item) => {
                  const isUrgent = ['high', 'critical', 'emergency'].includes(item.urgency?.toLowerCase() || '');
                  
                  return (
                    <div key={item.id} className="p-4 hover:bg-paper-50/50 dark:hover:bg-ink-800/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                          isUrgent 
                            ? 'bg-coral-500/10 text-coral-600 dark:text-coral-400' 
                            : 'bg-paper-100 dark:bg-ink-800 text-paper-600 dark:text-ink-300'
                        }`}>
                          {item.urgency || 'Normal'}
                        </span>
                        <span className="text-[9px] font-semibold text-paper-400 dark:text-ink-500 uppercase tracking-wider">
                          {item.status || 'Open'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-paper-900 dark:text-white mt-1.5 line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="text-[9px] text-paper-400 dark:text-ink-500 mt-2 flex items-center justify-between">
                        <span>{item.propertyName}</span>
                        {item.createdAt && (
                          <span>
                            {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-paper-400 dark:text-ink-500 font-medium flex flex-col items-center gap-2">
                  <Wrench className="w-6 h-6 text-paper-300 dark:text-ink-700" />
                  <span>No maintenance requests found.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Secondary Row: Dynamic Charts & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dynamic Financial Overview Chart */}
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl p-5 shadow-sm hover:border-paper-300 dark:hover:border-ink-700 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider">Financial summary</span>
            <div className="flex items-center gap-4 text-[10px] font-bold text-paper-500 dark:text-ink-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-green-500"></span> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-coral-500"></span> Expenses
              </span>
            </div>
          </div>

          <div className="h-32 flex items-end justify-between gap-3 mt-4">
            <div className="w-full flex gap-1 h-full items-end justify-center">
              <div className="w-2.5 bg-green-500/20 dark:bg-green-500/10 rounded-t h-[40%]"></div>
              <div className="w-2.5 bg-coral-500/20 dark:bg-coral-500/10 rounded-t h-[20%]"></div>
            </div>
            <div className="w-full flex gap-1 h-full items-end justify-center">
              <div className="w-2.5 bg-green-500/20 dark:bg-green-500/10 rounded-t h-[65%]"></div>
              <div className="w-2.5 bg-coral-500/20 dark:bg-coral-500/10 rounded-t h-[35%]"></div>
            </div>
            <div className="w-full flex gap-1 h-full items-end justify-center">
              <div className="w-2.5 bg-green-500/20 dark:bg-green-500/10 rounded-t h-[50%]"></div>
              <div className="w-2.5 bg-coral-500/20 dark:bg-coral-500/10 rounded-t h-[40%]"></div>
            </div>
            <div className="w-full flex gap-1 h-full items-end justify-center">
              <div className="w-2.5 bg-green-500/20 dark:bg-green-500/10 rounded-t h-[75%]"></div>
              <div className="w-2.5 bg-coral-500/20 dark:bg-coral-500/10 rounded-t h-[30%]"></div>
            </div>
            <div className="w-full flex gap-1 h-full items-end justify-center">
              <div className="w-2.5 bg-green-500/20 dark:bg-green-500/10 rounded-t h-[60%]"></div>
              <div className="w-2.5 bg-coral-500/20 dark:bg-coral-500/10 rounded-t h-[50%]"></div>
            </div>
            {/* Current Month: dynamic based on live DB data */}
            <div className="w-full flex gap-1 h-full items-end justify-center bg-coral-500/5 dark:bg-coral-500/10 px-1 rounded-t border-t border-x border-paper-250 dark:border-ink-800">
              <div className="w-2.5 bg-green-500 rounded-t transition-all duration-500" style={{ height: currentMonthRevHeight }} title={`Revenue: $${rev}`}></div>
              <div className="w-2.5 bg-coral-500 rounded-t transition-all duration-500" style={{ height: currentMonthExpHeight }} title={`Expenses: $${exp}`}></div>
            </div>
          </div>
          <div className="flex justify-between text-[9px] text-paper-400 dark:text-ink-500 uppercase font-semibold mt-3.5">
            <span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span className="text-coral-500 font-bold">Current</span>
          </div>
        </div>

        {/* Dynamic Portfolio Task Progress list */}
        <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl p-5 shadow-sm hover:border-paper-300 dark:hover:border-ink-700 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider">Portfolio Health Indicators</span>
            <CheckSquare className="w-4 h-4 text-paper-400 dark:text-ink-500" />
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] text-paper-500 dark:text-ink-400 mb-1">
                <span>Completed Tickets Ratio</span>
                <span className="font-bold text-paper-900 dark:text-white">{ticketCompletionRate}%</span>
              </div>
              <div className="w-full bg-paper-100 dark:bg-ink-850 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${ticketCompletionRate}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-paper-500 dark:text-ink-400 mb-1">
                <span>Active Tenant Ratio</span>
                <span className="font-bold text-paper-900 dark:text-white">{activeLeaseRate}%</span>
              </div>
              <div className="w-full bg-paper-100 dark:bg-ink-850 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${activeLeaseRate}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-paper-500 dark:text-ink-400 mb-1">
                <span>Properties Occupancy</span>
                <span className="font-bold text-paper-900 dark:text-white">{Math.round(occupancyRate)}%</span>
              </div>
              <div className="w-full bg-paper-100 dark:bg-ink-850 h-1.5 rounded-full overflow-hidden">
                <div className="bg-coral-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.round(occupancyRate)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
