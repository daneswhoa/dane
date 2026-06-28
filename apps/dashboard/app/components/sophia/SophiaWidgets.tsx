import React from 'react';
import { CheckCircle2, ArrowUpRight } from 'lucide-react';
import SophiaVisualization from './SophiaVisualization';
import SophiaPropertyDashboard from './SophiaPropertyDashboard';

interface SophiaWidgetsProps {
  widgetData: {
    type: string;
    data: any;
    title?: string;
    content?: string;
  };
  onSendMessage?: (msg: string) => void;
}

export function SophiaWidgets({ widgetData, onSendMessage }: SophiaWidgetsProps) {
  if (!widgetData) return null;

  switch (widgetData.type) {
    case 'portfolio': {
      const metrics = widgetData.data;
      return (
        <div className="mt-4 bg-paper-50 dark:bg-ink-900/85 border border-paper-200 dark:border-ink-700 rounded-xl p-3 shadow-inner">
          <div className="text-xs font-semibold text-paper-900 dark:text-white mb-2 pb-1 border-b border-paper-200 dark:border-ink-700">Portfolio Summary</div>
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-paper-500">Properties:</span>
              <span className="font-semibold text-paper-900 dark:text-white">{metrics.totalProperties}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-paper-500">Total Units:</span>
              <span className="font-semibold text-paper-900 dark:text-white">{metrics.totalUnits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-paper-500">Occupancy:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{metrics.occupancyRate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-paper-500">Arrears:</span>
              <span className="font-semibold text-amber-500">€{metrics.outstandingArrears}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-paper-500">Active Tickets:</span>
              <span className="font-semibold text-coral-500">{metrics.activeTickets}</span>
            </div>
          </div>
        </div>
      );
    }
    case 'finances': {
      const finances = widgetData.data;
      return (
        <div className="mt-4 bg-paper-50 dark:bg-ink-900/85 border border-paper-200 dark:border-ink-700 rounded-xl p-3 shadow-inner">
          <div className="text-xs font-semibold text-paper-900 dark:text-white mb-2 pb-1 border-b border-paper-200 dark:border-ink-700">Company Balance Sheet</div>
          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-paper-500">Gross Rent Collected:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">€{finances.grossCollections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-paper-500">Upkeep Expenses:</span>
              <span className="font-semibold text-coral-600 dark:text-coral-400">-€{finances.totalExpenses}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-paper-200 dark:border-ink-700 pt-1.5">
              <span className="text-paper-900 dark:text-white">Net Income:</span>
              <span className={finances.netOperatingIncome >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-coral-500"}>
                €{finances.netOperatingIncome}
              </span>
            </div>
          </div>
        </div>
      );
    }
    case 'notifications': {
      const notes = widgetData.data || [];
      return (
        <div className="mt-4 bg-paper-50 dark:bg-ink-900/85 border border-paper-200 dark:border-ink-700 rounded-xl p-3 shadow-inner">
          <div className="text-xs font-semibold text-paper-900 dark:text-white mb-2 pb-1 border-b border-paper-200 dark:border-ink-700">Notifications Log ({notes.length})</div>
          {notes.length === 0 ? (
            <p className="text-[10px] text-paper-400 italic">No notifications found.</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {notes.map((n: any) => (
                <div key={n.id} className="border-b border-paper-100 dark:border-ink-800 pb-1.5 last:border-none">
                  <p className="text-[11px] font-bold text-paper-800 dark:text-white">{n.title}</p>
                  <p className="text-[10px] text-paper-500 dark:text-ink-400 leading-tight mt-0.5">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    case 'ticket': {
      const tk = widgetData.data;
      return (
        <div className="mt-3 border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-500/5 rounded-lg p-3 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold text-paper-900 dark:text-emerald-100">Ticket Created</h4>
            <p className="text-[10px] text-paper-550 dark:text-ink-400">ID: {tk.ticketId} • {tk.message}</p>
          </div>
        </div>
      );
    }
    case 'contractors': {
      const contractors = widgetData.data || [];
      return (
        <div className="mt-4 space-y-2">
          <div className="text-xs font-semibold text-paper-900 dark:text-white mb-1">Marketplace Contractors</div>
          {contractors.length === 0 ? (
            <p className="text-[10px] text-paper-400 italic">No matching contractors found.</p>
          ) : (
            contractors.map((c: any) => (
              <div key={c.id} className="bg-paper-50 dark:bg-ink-900/80 border border-paper-200 dark:border-ink-700 p-2.5 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-paper-900 dark:text-white">{c.name}</h4>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Rate: €{c.hourlyRate}/hr • {c.specialty}</p>
                </div>
                {onSendMessage && (
                  <button 
                    onClick={() => onSendMessage(`Bookmark contractor ID ${c.id}`)}
                    className="px-2 py-1 bg-paper-200 dark:bg-ink-800 border border-paper-300 dark:border-ink-700 text-paper-700 dark:text-ink-200 text-[10px] font-medium rounded hover:bg-paper-300"
                  >
                    Bookmark
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      );
    }
    case 'invoices': {
      const invoices = widgetData.data || [];
      return (
        <div className="mt-4 bg-paper-50 dark:bg-ink-900/85 border border-paper-200 dark:border-ink-700 rounded-xl p-3 shadow-inner">
          <div className="text-xs font-semibold text-paper-900 dark:text-white mb-2 pb-1 border-b border-paper-200 dark:border-ink-700">Recent Invoices</div>
          {invoices.length === 0 ? (
            <p className="text-[10px] text-paper-400 italic">No invoices found.</p>
          ) : (
            <div className="space-y-1.5 text-[10px] font-mono">
              {invoices.slice(0, 5).map((inv: any) => (
                <div key={inv.id} className="flex justify-between border-b border-paper-100 dark:border-ink-850 pb-1 last:border-none">
                  <span>{inv.invoiceNumber}</span>
                  <span className={inv.status === 'paid' ? "text-emerald-500" : "text-amber-500 font-bold"}>
                    €{inv.amount} ({inv.status})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    case 'property-created': {
      const prop = widgetData.data;
      return (
        <div className="mt-4 space-y-4 max-w-sm">
          {/* Stepper Card */}
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl p-4 shadow-sm space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-coral-500 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Property Setup Pipeline
            </div>
            <div className="space-y-3 relative pl-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-emerald-500/30">
              {[
                { label: "Validating input parameters", desc: "Name, type, and unit checks completed" },
                { label: "Provisioning database record", desc: "Drizzle insertion completed successfully" },
                { label: "Generating photo fallback assets", desc: "Illustration dynamic reference attached" },
                { label: "Registering portfolio audit trail", desc: "Immutable security entry logged" }
              ].map((step, idx) => (
                <div key={idx} className="relative flex flex-col gap-0.5">
                  <span className="absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-ink-900 shadow-sm flex items-center justify-center" />
                  <span className="text-[11px] font-semibold text-paper-950 dark:text-white leading-none">{step.label}</span>
                  <span className="text-[9px] text-paper-500 dark:text-ink-400">{step.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Property Card */}
          <div className="bg-white dark:bg-ink-900 border border-coral-500/20 dark:border-coral-500/30 rounded-xl overflow-hidden shadow-md">
            <div className="relative h-36 bg-paper-100 dark:bg-ink-950 flex items-center justify-center overflow-hidden border-b border-paper-150 dark:border-ink-850">
              <img 
                src={prop.photoUrl || (prop.unitsCount > 1 ? '/default_apartment.png' : '/default_house.png')} 
                alt={prop.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-coral-500 text-white shadow-sm">
                Pending Setup
              </div>
            </div>
            <div className="p-3.5 space-y-2">
              <div>
                <h4 className="text-xs font-bold text-paper-900 dark:text-white leading-tight">{prop.name}</h4>
                <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">{prop.address}</p>
              </div>
              <div className="flex items-center justify-between text-[10px] bg-paper-50 dark:bg-ink-950/40 p-2 rounded-lg border border-paper-100 dark:border-ink-800">
                <span className="text-paper-500">Type: <span className="font-semibold text-paper-950 dark:text-white capitalize">{prop.type}</span></span>
                <span className="text-paper-500">Units: <span className="font-semibold text-paper-950 dark:text-white">{prop.unitsCount}</span></span>
              </div>
              <div className="text-[9px] font-mono text-paper-400 dark:text-ink-500 flex justify-between items-center">
                <span>ID: {prop.propertyId}</span>
                <a href={`/properties/${prop.propertyId}`} className="text-coral-500 hover:text-coral-600 font-bold hover:underline flex items-center gap-0.5">
                  View Details <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }
    case 'property-setup-completed': {
      const setup = widgetData.data;
      return (
        <div className="mt-4 space-y-4 max-w-sm">
          {/* Stepper Card */}
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl p-4 shadow-sm space-y-3 animate-fade-in">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> Property Setup Completed
            </div>
            <div className="space-y-3 relative pl-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-emerald-500/30">
              {[
                { label: "Verifying property configuration", desc: "Inspection of portfolio and ownership complete" },
                { label: "Reconciling unit structures", desc: "Units layout count and types aligned" },
                { label: "Writing monthly rent & fee rules", desc: "Recurring and move-in fees verified and saved" },
                { label: "Updating system status & security logs", desc: "Drizzle updates committed, audits registered" }
              ].map((step, idx) => (
                <div key={idx} className="relative flex flex-col gap-0.5 animate-fade-in" style={{ animationDelay: `${idx * 150}ms` }}>
                  <span className="absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-ink-900 shadow-sm flex items-center justify-center" />
                  <span className="text-[11px] font-semibold text-paper-950 dark:text-white leading-none">{step.label}</span>
                  <span className="text-[9px] text-paper-500 dark:text-ink-400">{step.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Property Status Info Card */}
          <div className="bg-white dark:bg-ink-900 border border-emerald-500/20 dark:border-emerald-500/30 rounded-xl overflow-hidden shadow-md animate-fade-in">
            <div className="relative h-20 bg-emerald-500/5 dark:bg-emerald-500/10 flex items-center justify-between px-4 border-b border-paper-150 dark:border-ink-850">
              <div>
                <h4 className="text-xs font-bold text-paper-900 dark:text-white leading-tight">Configured Successfully</h4>
                <p className="text-[9px] text-paper-500 dark:text-ink-400 mt-0.5">Rent rules & policies are now live</p>
              </div>
              <div className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-sm">
                Active
              </div>
            </div>
            <div className="p-3.5 space-y-2">
              <div className="text-[10px] space-y-1.5 text-paper-700 dark:text-ink-200">
                <div className="flex justify-between border-b border-paper-100 dark:border-ink-850 pb-1">
                  <span className="text-paper-400 dark:text-ink-500">Property ID</span>
                  <span className="font-mono">{setup.propertyId}</span>
                </div>
                <div className="flex justify-between border-b border-paper-100 dark:border-ink-850 pb-1">
                  <span className="text-paper-400 dark:text-ink-500">Status</span>
                  <span className="capitalize font-semibold text-emerald-600 dark:text-emerald-400">{setup.status}</span>
                </div>
              </div>
              <div className="text-[9px] font-mono text-paper-400 dark:text-ink-500 flex justify-end items-center pt-1">
                <a href={`/properties/${setup.propertyId}`} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-bold hover:underline flex items-center gap-0.5">
                  Manage Property <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Units Visualization Card */}
          {setup.units && setup.units.length > 0 && (
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl overflow-hidden shadow-sm animate-fade-in max-w-full">
              <div className="bg-paper-100 dark:bg-ink-950 px-3 py-2 border-b border-paper-200 dark:border-ink-800 flex justify-between items-center">
                <h4 className="text-[11px] font-bold text-paper-900 dark:text-white uppercase tracking-wider font-mono">
                  Units Configuration
                </h4>
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {setup.units.length} Units
                </span>
              </div>
              <div className="p-3 max-h-64 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                {Object.entries(
                  setup.units.reduce((acc: any, unit: any) => {
                    const f = unit.floor || 'Unassigned Floor';
                    if (!acc[f]) acc[f] = [];
                    acc[f].push(unit);
                    return acc;
                  }, {})
                ).map(([floorName, floorUnits]: [string, any]) => (
                  <div key={floorName} className="space-y-2">
                    <div className="text-[10px] font-bold text-paper-500 dark:text-ink-400 flex items-center gap-2">
                      <div className="h-px flex-1 bg-paper-200 dark:bg-ink-800"></div>
                      <span className="uppercase tracking-widest">{floorName}</span>
                      <div className="h-px flex-1 bg-paper-200 dark:bg-ink-800"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {floorUnits.map((u: any) => (
                        <div key={u.id} className="bg-paper-50 dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-lg p-2 hover:border-emerald-500/50 transition-colors">
                          <div className="flex justify-between items-center mb-1.5 border-b border-paper-200 dark:border-ink-850 pb-1">
                            <span className="text-xs font-bold text-paper-900 dark:text-white">{u.label}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-paper-200 dark:bg-ink-800 text-paper-600 dark:text-ink-300 font-semibold">{u.unitType}</span>
                          </div>
                          <div className="space-y-1 text-[9px] font-mono">
                            <div className="flex justify-between">
                              <span className="text-paper-500">Rent</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">€{u.rent}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-paper-500">Deposit</span>
                              <span className="font-semibold text-paper-900 dark:text-white">€{u.deposit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-paper-500">Recurring Fees</span>
                              <span className="text-coral-600 dark:text-coral-400">€{u.recurringFees}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-paper-500">Move-in Fees</span>
                              <span className="text-blue-500">€{u.moveInFees}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    case 'excel-visualization': {
      return <SophiaVisualization visualizationData={widgetData.data} />;
    }
    case 'properties-dashboard': {
      return (
        <SophiaPropertyDashboard 
          properties={widgetData.data.properties} 
          onSetupProperty={(propId) => {
            if (onSendMessage) {
              onSendMessage(`Setup property ID ${propId}`);
            }
          }}
        />
      );
    }
    case 'tenant-added': {
      const data = widgetData.data;
      return (
        <div className="mt-4 space-y-4 max-w-sm animate-fade-in">
          <div className="bg-white dark:bg-ink-900 border border-emerald-500/20 dark:border-emerald-500/30 rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3 border-b border-paper-100 dark:border-ink-850 pb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider font-mono">Tenant Added</h4>
                <p className="text-[10px] text-paper-500 dark:text-ink-400">Successfully assigned to {data.unit?.label}</p>
              </div>
            </div>
            
            <div className="pt-3 space-y-2">
              <div className="flex justify-between items-center bg-paper-50 dark:bg-ink-950 p-2 rounded-lg border border-paper-100 dark:border-ink-850">
                <span className="text-[10px] text-paper-500 font-medium">Tenant Name</span>
                <span className="text-[10px] font-bold text-paper-900 dark:text-white">{data.tenant?.name}</span>
              </div>
              <div className="flex justify-between items-center bg-paper-50 dark:bg-ink-950 p-2 rounded-lg border border-paper-100 dark:border-ink-850">
                <span className="text-[10px] text-paper-500 font-medium">Email</span>
                <span className="text-[10px] font-bold text-paper-900 dark:text-white truncate max-w-[150px]">{data.tenant?.email}</span>
              </div>
            </div>

            {data.invoices && data.invoices.length > 0 && (
              <div className="mt-3 pt-3 border-t border-paper-100 dark:border-ink-850">
                <span className="text-[10px] font-semibold text-paper-900 dark:text-white mb-2 block">Move-in Invoices Generated:</span>
                <div className="space-y-1.5">
                  {data.invoices.map((inv: any) => (
                    <div key={inv.id} className="flex justify-between text-[10px] font-mono text-paper-600 dark:text-ink-300">
                      <span>• {inv.description}</span>
                      <span className="font-bold text-coral-600 dark:text-coral-400">€{inv.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    case 'invoice-added': {
      const data = widgetData.data;
      const inv = data.invoice;
      return (
        <div className="mt-4 max-w-sm animate-fade-in">
          <div className="bg-white dark:bg-ink-900 border border-blue-500/20 dark:border-blue-500/30 rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3 border-b border-paper-100 dark:border-ink-850 pb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                <span className="text-sm font-bold">€</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider font-mono">Invoice Created</h4>
                <p className="text-[10px] text-paper-500 dark:text-ink-400">Billed to {inv?.tenantName}</p>
              </div>
            </div>
            
            <div className="pt-3 space-y-2">
              <div className="flex justify-between items-center bg-paper-50 dark:bg-ink-950 p-2 rounded-lg border border-paper-100 dark:border-ink-850">
                <span className="text-[10px] text-paper-500 font-medium">Invoice Number</span>
                <span className="text-[10px] font-bold text-paper-900 dark:text-white font-mono">{inv?.invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center bg-paper-50 dark:bg-ink-950 p-2 rounded-lg border border-paper-100 dark:border-ink-850">
                <span className="text-[10px] text-paper-500 font-medium">Amount Due</span>
                <span className="text-[10px] font-bold text-coral-600 dark:text-coral-400 font-mono">€{inv?.amount}</span>
              </div>
              <div className="flex justify-between items-center bg-paper-50 dark:bg-ink-950 p-2 rounded-lg border border-paper-100 dark:border-ink-850">
                <span className="text-[10px] text-paper-500 font-medium">Description</span>
                <span className="text-[10px] font-bold text-paper-900 dark:text-white truncate max-w-[150px]">{inv?.description}</span>
              </div>
            </div>
            
            <div className="text-[9px] font-mono text-paper-400 dark:text-ink-500 flex justify-between items-center pt-3">
              <span>Due: {new Date(inv?.dueDate).toLocaleDateString()}</span>
              <span className="text-blue-500 font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-500/10 rounded">Sent via Email</span>
            </div>
          </div>
        </div>
      );
    }
    case 'ticket-list': {
      const tickets = widgetData.data.tickets || [];
      return (
        <div className="mt-4 bg-paper-50 dark:bg-ink-900/85 border border-paper-200 dark:border-ink-700 rounded-xl p-3 shadow-inner">
          <div className="text-xs font-semibold text-paper-900 dark:text-white mb-2 pb-1 border-b border-paper-200 dark:border-ink-700">Maintenance Tickets ({tickets.length})</div>
          {tickets.length === 0 ? (
            <p className="text-[10px] text-paper-400 italic">No tickets found matching criteria.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {tickets.map((t: any) => (
                <div key={t.id} className="border border-paper-200 dark:border-ink-800 bg-white dark:bg-ink-950 p-2 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold text-paper-900 dark:text-white truncate">{t.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${t.status === 'open' ? 'bg-amber-500/10 text-amber-600' : 'bg-paper-200 text-paper-600'}`}>{t.status}</span>
                  </div>
                  <p className="text-[10px] text-paper-500 dark:text-ink-400 line-clamp-1">{t.description}</p>
                  <div className="flex justify-between items-center mt-1.5 pt-1 border-t border-paper-100 dark:border-ink-850 text-[9px] font-mono">
                    <span className={`${t.urgency === 'emergency' ? 'text-coral-500 font-bold' : 'text-paper-500'}`}>{t.urgency} priority</span>
                    <span className="text-paper-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    case 'ticket-created': {
      const t = widgetData.data.ticket;
      return (
        <div className="mt-3 border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-500/5 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-paper-900 dark:text-emerald-100 mb-1">Ticket Created Successfully</h4>
          <div className="space-y-1 text-[10px] text-paper-600 dark:text-ink-300">
            <p><span className="font-medium text-paper-900 dark:text-white">ID:</span> {t?.id}</p>
            <p><span className="font-medium text-paper-900 dark:text-white">Title:</span> {t?.title}</p>
            <p><span className="font-medium text-paper-900 dark:text-white">Urgency:</span> <span className="uppercase font-bold text-amber-600">{t?.urgency}</span></p>
          </div>
        </div>
      );
    }
    case 'contractor-list': {
      const contractors = widgetData.data.contractors || [];
      return (
        <div className="mt-4 space-y-2">
          <div className="text-xs font-semibold text-paper-900 dark:text-white mb-1">Marketplace Contractors</div>
          {contractors.length === 0 ? (
            <p className="text-[10px] text-paper-400 italic">No available contractors found.</p>
          ) : (
            contractors.map((c: any) => (
              <div key={c.id} className="bg-paper-50 dark:bg-ink-900/80 border border-paper-200 dark:border-ink-700 p-2.5 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-paper-900 dark:text-white">{c.name}</h4>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Rate: €{c.hourlyRate}/hr • {c.specialty}</p>
                  {c.locationName && <p className="text-[9px] text-paper-500">{c.locationName}</p>}
                </div>
                {onSendMessage && (
                  <button 
                    onClick={() => onSendMessage(`Bookmark contractor ID ${c.id}`)}
                    className="px-2 py-1 bg-paper-200 dark:bg-ink-800 border border-paper-300 dark:border-ink-700 text-paper-700 dark:text-ink-200 text-[10px] font-medium rounded hover:bg-paper-300"
                  >
                    Bookmark
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      );
    }
    case 'dispatch-receipt': {
      const res = widgetData.data;
      const args = res.args;
      return (
        <div className="mt-4 max-w-sm animate-fade-in">
          <div className="bg-white dark:bg-ink-900 border border-emerald-500/20 rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3 border-b border-paper-100 dark:border-ink-850 pb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider font-mono">Dispatch Success</h4>
                <p className="text-[10px] text-paper-500 dark:text-ink-400">Action: {args?.action}</p>
              </div>
            </div>
            <div className="pt-3 space-y-2 text-[10px] text-paper-700 dark:text-ink-200">
              <p>{res.message}</p>
              {args?.amount && <p><span className="font-semibold">Amount:</span> €{args.amount}</p>}
              {args?.contractorId && <p><span className="font-semibold">Contractor ID:</span> {args.contractorId}</p>}
              {args?.settleAction && <p><span className="font-semibold">Financial Routing:</span> <span className="font-mono text-blue-500">{args.settleAction}</span></p>}
            </div>
          </div>
        </div>
      );
    }
    case 'invoice-summary': {
      const summaryData = widgetData.data;
      const invoices = summaryData.invoices || [];
      const summary = summaryData.summary;
      
      return (
        <div className="mt-4 max-w-lg animate-fade-in">
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-paper-100 dark:bg-ink-950 px-4 py-3 border-b border-paper-200 dark:border-ink-800 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider font-mono">
                  Invoice Ledger
                </h4>
                <p className="text-[10px] text-paper-500 dark:text-ink-400 mt-0.5">
                  {summaryData.tenantName} {summaryData.unitLabel && `• ${summaryData.unitLabel}`}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                <span className="font-bold text-sm">€</span>
              </div>
            </div>

            {/* Invoices List */}
            <div className="p-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              {invoices.length === 0 ? (
                <p className="text-[10px] text-paper-400 italic text-center py-2">No invoices found for this tenant.</p>
              ) : (
                <div className="space-y-2">
                  {invoices.map((inv: any) => (
                    <div key={inv.id} className="flex justify-between items-center bg-paper-50 dark:bg-ink-950 p-2 rounded-lg border border-paper-100 dark:border-ink-850">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-paper-900 dark:text-white">{inv.description}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${inv.status === 'unpaid' ? 'bg-coral-500/10 text-coral-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                            {inv.status}
                          </span>
                        </div>
                        <div className="flex gap-2 text-[9px] font-mono text-paper-500 dark:text-ink-400">
                          <span>{inv.invoiceNumber || 'INV'}</span>
                          <span>•</span>
                          <span>Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'Immediate'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] font-bold text-paper-900 dark:text-white font-mono">€{inv.amount}</div>
                        {inv.amountPaid > 0 && <div className="text-[9px] text-emerald-500 font-medium">Paid: €{inv.amountPaid}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary Totals */}
            <div className="bg-paper-50 dark:bg-ink-950 border-t border-paper-200 dark:border-ink-800 p-3">
              <div className="flex justify-between items-center text-[10px] font-mono mb-1 text-paper-600 dark:text-ink-300">
                <span>Total Amount Billed</span>
                <span>€{summary?.totalAmount || 0}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono mb-2 text-paper-600 dark:text-ink-300">
                <span>Total Paid</span>
                <span className="text-emerald-600 dark:text-emerald-400">€{summary?.totalPaid || 0}</span>
              </div>
              <div className="flex justify-between items-center border-t border-paper-200 dark:border-ink-800 pt-2">
                <span className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider">Outstanding Balance</span>
                <span className={`text-sm font-bold font-mono ${(summary?.balance || 0) > 0 ? 'text-coral-600 dark:text-coral-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  €{summary?.balance || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    case 'invoice-managed': {
      const data = widgetData.data;
      const args = data.args;
      return (
        <div className="mt-3 border border-blue-100 dark:border-blue-500/20 bg-blue-50/40 dark:bg-blue-500/5 rounded-lg p-3 max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-semibold text-paper-900 dark:text-blue-100 uppercase tracking-wider font-mono">Invoice Updated</h4>
          </div>
          <div className="space-y-1.5 text-[10px] text-paper-700 dark:text-ink-200">
            <p>{data.message}</p>
            {args?.action === 'adjust_amount' && <p className="font-mono mt-1 text-emerald-600 dark:text-emerald-400 font-bold">New Amount: €{args.newAmount}</p>}
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}
