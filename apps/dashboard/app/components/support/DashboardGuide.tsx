'use client';

import React, { useState } from 'react';
import { 
  Search, BookOpen, ChevronRight, Home, Sparkles, Building, 
  Globe, Users, Wallet, Wrench, Shield, HardHat, Mail, 
  Megaphone, Cpu, ClipboardList, BarChart3, ShieldCheck, Settings,
  AlertCircle, CheckCircle2, Info
} from 'lucide-react';

interface Chapter {
  id: number;
  title: string;
  tab: string;
  icon: any;
  illustration: string;
  summary: string;
  details: string[];
  steps: string[];
}

export function DashboardGuide() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChapterId, setActiveChapterId] = useState(1);

  const chapters: Chapter[] = [
    {
      id: 1,
      title: 'Overview Dashboard',
      tab: 'overview',
      icon: Home,
      illustration: '/profile_identity_banner.png',
      summary: 'Get a quick, high-level preview of your entire rental portfolio, occupancy metrics, financial cashflow, and recent tenant logs.',
      details: [
        'Quick stats cards display your total units, active tenancies, overall occupancy rate, and estimated AUM (Assets Under Management) value.',
        'Interactive performance charts summarize month-over-month rental revenue, outstanding receivables, and paid expenses.',
        'Recent Activity feed lists live action items such as new tenant sign-ups, payment confirmations, and emergency contractor requests.'
      ],
      steps: [
        'Log in to view the Overview dashboard directly as your primary homepage.',
        'Use the top filter dropdowns to view data across all properties or select one specific building.',
        'Click on any recent activity log entry to go directly to that item\'s setup page.'
      ]
    },
    {
      id: 2,
      title: 'Sophia AI Chatbot',
      tab: 'sophia',
      icon: Sparkles,
      illustration: '/support_illustration.png',
      summary: 'Interact with Sophia AI, your automated workspace assistant, to query database info, create documents, and automate processes.',
      details: [
        'Sophia AI has read access to your organization database to answer questions about tenant lists, contractor schedules, or invoices.',
        'She can execute system tools directly if you ask her (e.g. creating rent invoices, updating property info, or geo-pinning units).',
        'In widget mode, Sophia provides short, conversational responses to help you complete tasks without leaving your current workspace.'
      ],
      steps: [
        'Click the "Sophia AI" link in the sidebar to open the main conversation workspace.',
        'Type natural questions, like "Who is currently behind on their rent?" or "Draft a payment reminder email for John."',
        'Approve or confirm tool actions when Sophia suggests automated database edits.'
      ]
    },
    {
      id: 3,
      title: 'Properties Portfolio',
      tab: 'properties',
      icon: Building,
      illustration: '/property_features_step_graphic.png',
      summary: 'Manage your buildings, apartments, and commercial units in one consolidated place. Keep track of address profiles and unit counts.',
      details: [
        'The main property directory displays building previews, geographic addresses, unit capacity, and listing states.',
        'Free plans are restricted to a maximum of 3 properties, while Premium accounts allow unlimited property listings.',
        'Each property maintains details about utility parameters, safety compliance status, and assigned property managers.'
      ],
      steps: [
        'Select the Properties tab and click the "List New Property" button.',
        'Fill in the property identity forms (building name, county location, and total floor levels).',
        'Add a primary banner photo to represent the property in tenant portal vacancy listings.'
      ]
    },
    {
      id: 4,
      title: 'Units Setup & Config',
      tab: 'properties/units',
      icon: Settings,
      illustration: '/fallback_one_bedroom.png',
      summary: 'Set up individual rental rooms, apartments, and suites. Define base rent rates, utility bills, and security deposit bounds.',
      details: [
        'Add individual units to a parent property by defining floor numbers, room labels, and square footage.',
        'Enforce default financial parameters for each unit, including expected monthly rent and mandatory security deposits.',
        'Tag specific unit types (e.g., Single Room, Bedsitter, 1-Bedroom, 2-Bedroom) to auto-resolve beautiful fallback illustrations.'
      ],
      steps: [
        'Open any active property from your directory and click the "Units & Floorplan" section.',
        'Click "Add Unit" and input the room identifier code (e.g., Apartment 4B).',
        'Select the unit configuration type and define the monthly rent price.'
      ]
    },
    {
      id: 5,
      title: 'Syndication Center',
      tab: 'syndication',
      icon: Globe,
      illustration: '/property_listing_promo_graphic.png',
      summary: 'Publish empty unit listings to vacancy marketplaces to find new tenants. Pin coordinates to attract local renters.',
      details: [
        'Mark any unrented unit as vacant to display it inside the public vacancy list.',
        'Input correct County and Subcounty parameters to help users filter vacancies geographically.',
        'Set precise map coordinates (longitude and latitude) to pin your property on search maps.'
      ],
      steps: [
        'Navigate to the Syndication tab to view all currently vacant units in your organization.',
        'Click "Sync Coordinates" and enter the exact map latitude and longitude.',
        'Toggle the "Publish to Marketplace" switch to instantly push the listing to the public portal.'
      ]
    },
    {
      id: 6,
      title: 'Tenants Roster',
      tab: 'tenants',
      icon: Users,
      illustration: '/fallback_bedsitter.png',
      summary: 'Maintain a direct list of active tenants, rental contracts, lease start dates, and contact profiles.',
      details: [
        'Track lease parameters, security deposit confirmations, emergency contacts, and active tenancy histories.',
        'View tenant payment habits directly from their user profiles, tracking monthly billing versus collection ratios.',
        'Click on any tenant row to access contact options, lease files, and logged utility tickets.'
      ],
      steps: [
        'Go to the Tenants section to view your active roster directory.',
        'Use the search bar to locate tenants by name, phone number, or unit ID.',
        'Click "Edit Tenancy" to adjust contract expiration dates or monthly rent rates.'
      ]
    },
    {
      id: 7,
      title: 'Tenant Invitations',
      tab: 'tenants/invites',
      icon: Mail,
      illustration: '/fallback_single_room.png',
      summary: 'Invite approved applicants to register on the Tenant Portal. Coordinate tenant onboarding securely.',
      details: [
        'Secure invites are sent via email to tenants, linking their profile to a specific property and unit.',
        'Once the tenant registers, their account changes from "Invited" to "Active" automatically.',
        'Track invite timelines to ensure links are resolved before the standard 7-day expiration.'
      ],
      steps: [
        'From the Tenants page, click "Invite New Tenant".',
        'Enter the tenant\'s email, select their assigned property, and specify their unit number.',
        'Click "Send Invitation" to dispatch a secure onboarding link.'
      ]
    },
    {
      id: 8,
      title: 'Payments & Expenses',
      tab: 'finance/expenses',
      icon: Wallet,
      illustration: '/credits_wallet_banner.png',
      summary: 'Monitor incoming rent collections and record property-related operational expenditures.',
      details: [
        'Incoming rent transactions from the Tenant Portal are matched and updated automatically.',
        'Manually record external payments (e.g. bank checks or cash deposits) to keep ledgers accurate.',
        'Log expenses such as utility bills, property taxes, structural repairs, and contractor payouts.'
      ],
      steps: [
        'Navigate to the Finance menu and select Payments & Expenses.',
        'Click "Record Expense" to log cash outflows, choosing categories like Maintenance, Tax, or Legal.',
        'Filter the log by date range to evaluate monthly net cashflow metrics.'
      ]
    },
    {
      id: 9,
      title: 'Invoices & Receipts',
      tab: 'finance/invoices',
      icon: ReceiptIcon,
      illustration: '/subscription_plan_banner.png',
      summary: 'Issue tenant invoices, track payment milestones, send reminders, and archive transaction receipts.',
      details: [
        'The system generates rent statements automatically on the 1st of every month.',
        'Track invoice statuses in real-time: Paid, Partially Paid, Overdue, or Pending Verification.',
        'Send reminders for overdue balances directly through the communication engine.'
      ],
      steps: [
        'Go to the Invoices tab to view the monthly billing ledger.',
        'Click "Create Manual Invoice" to bill custom fees, like repairs or late penalties.',
        'Click "Verify Payment" to manually match pending bank transfers to open invoices.'
      ]
    },
    {
      id: 10,
      title: 'Wallet Balance & Refills',
      tab: 'finance/wallet',
      icon: Wallet,
      illustration: '/credits_wallet_banner.png',
      summary: 'Top up your workspace credits balance using Stripe payments. Monitor token conversion rates.',
      details: [
        'Tokens are consumed by automated tasks (e.g., Sophia AI chat turns, tool calls, and email campaigns).',
        'The currency conversion is locked at 1 KES = 6 credits (tokens).',
        'Choose from quick-select refill packages or enter custom amounts for specific needs.'
      ],
      steps: [
        'Select the Plan & Credits tab, and navigate to the Wallet section.',
        'Review your available balance and quick-select a refill package (Starter, Standard, Pro).',
        'Submit card details via the secure Stripe Checkout form to complete your recharge.'
      ]
    },
    {
      id: 11,
      title: 'Teammate Consumption',
      tab: 'finance/usage',
      icon: Info,
      illustration: '/roles_matrix_banner.png',
      summary: 'Audit credit consumption logs across your organization team members to monitor expenses.',
      details: [
        'Every single token-consuming action is logged alongside the email of the teammate who triggered it.',
        'Filter usage lists by teammate email, start date, and end date to track allocations.',
        'Click any transaction row to inspect the secure SHA-256 block hash details.'
      ],
      steps: [
        'Open the Credits & Usage page and scroll to the Teammate Token Roster table.',
        'Select a team member from the dropdown list to view only their transaction history.',
        'Set date limits to verify token usage for specific billing periods.'
      ]
    },
    {
      id: 12,
      title: 'Maintenance Tickets',
      tab: 'maintenance',
      icon: Wrench,
      illustration: '/support_illustration.png',
      summary: 'Address repair requests reported by tenants. Set priority tags and track repair progress.',
      details: [
        'Tenants submit maintenance reports directly from their portal, which show up in your list instantly.',
        'Assign tickets to local contractors, defining maximum price limits for the job.',
        'Once work is complete, verify the repair and close the ticket to trigger payment.'
      ],
      steps: [
        'Navigate to the Maintenance Hub to check reported property issues.',
        'Select a ticket to review description details, photos, and priority levels (Low, Medium, High).',
        'Click "Assign Contractor" to dispatch the job to a contractor from the directory.'
      ]
    },
    {
      id: 13,
      title: 'Contractor Marketplace',
      tab: 'contractors',
      icon: HardHat,
      illustration: '/fallback_two_bedroom.png',
      summary: 'Browse and contact local, verified plumbers, electricians, painters, and general contractors.',
      details: [
        'The marketplace lists independent contractors registered in your operational county.',
        'Review contractor ratings, service specialties, hourly rates, and licensing details.',
        'Free plans block contractor marketplace assignments, requiring an active Premium subscription.'
      ],
      steps: [
        'Select the Contractors tab in the sidebar.',
        'Search the directory by trade category (e.g. Electrical, Plumbing).',
        'Click "Assign Ticket" on a contractor\'s profile to directly dispatch them to an active ticket.'
      ]
    },
    {
      id: 14,
      title: 'Announcements',
      tab: 'communication/announcements',
      icon: Megaphone,
      illustration: '/fallback_bedsitter.png',
      summary: 'Broadcast formal notices, policy updates, and emergency alerts to all properties or selected units.',
      details: [
        'Announcements are displayed on the main feed of tenant portal homepages.',
        'Choose to send announcements globally or select specific properties for local notices.',
        'Schedule updates in advance or publish emergency alerts immediately.'
      ],
      steps: [
        'Go to Communication and select Announcements.',
        'Click "Create Announcement", write your message, and select target properties.',
        'Select a priority tag (Normal, Urgent) and click "Publish Notice".'
      ]
    },
    {
      id: 15,
      title: 'Email Campaigns',
      tab: 'communication/broadcasts',
      icon: Mail,
      illustration: '/fallback_one_bedroom.png',
      summary: 'Compose custom email newsletters and send bulk updates to your tenant database.',
      details: [
        'Email dispatches consume credits from your wallet (determined by the price_email_broadcast config).',
        'Create recipient groups based on tenant lease states, properties, or active balances.',
        'Verify your sender email and credit balance before starting a campaign.'
      ],
      steps: [
        'Go to Communication and select Email Broadcasts.',
        'Click "New Campaign", write your email content, and select your recipient filters.',
        'Confirm the credit charge and click "Dispatch Campaign" to send.'
      ]
    },
    {
      id: 16,
      title: 'Workflow Automations',
      tab: 'communication/automations',
      icon: Cpu,
      illustration: '/roles_matrix_banner.png',
      summary: 'Set up automated alerts for rent invoices, late payment notices, and utility maintenance updates.',
      details: [
        'Automations use simple trigger-action rules (e.g., "Send warning email 3 days after invoice becomes overdue").',
        'Helps minimize manual follow-up tasks for your administrative staff.',
        'Requires an active Premium subscription plan to create new automation rules.'
      ],
      steps: [
        'Go to Communication and select Automations.',
        'Click "Create Automation Rule" and set the trigger event (e.g. Invoice Overdue).',
        'Select the action (e.g. Email Tenant) and click "Activate Rule".'
      ]
    },
    {
      id: 17,
      title: 'Message Templates',
      tab: 'communication/templates',
      icon: ClipboardList,
      illustration: '/fallback_single_room.png',
      summary: 'Save standard message drafts for quick reuse in email broadcasts or reminders.',
      details: [
        'Store recurring text patterns such as Lease Renewal Invitations or Late Rent Warnings.',
        'Insert dynamic placeholders (like tenant name, unit number, rent due) to personalize messages.',
        'Teammates can reuse saved templates to maintain consistent tenant communications.'
      ],
      steps: [
        'Go to Communication and select Templates.',
        'Click "Create Template" and compose your reusable draft.',
        'Save the template with a clear title for your team to easily select during campaigns.'
      ]
    },
    {
      id: 18,
      title: 'Business Analytics',
      tab: 'analytics',
      icon: BarChart3,
      illustration: '/profile_identity_banner.png',
      summary: 'Examine detailed reports on monthly rent collection rates, expense distributions, and portfolio yields.',
      details: [
        'Track lease renewals, tenant turnover rates, and average unit vacancy times.',
        'Compare gross rental income against maintenance costs to evaluate property yields.',
        'Export data tables to spreadsheet formats for advanced offline auditing.'
      ],
      steps: [
        'Select the Analytics tab to view financial graphs.',
        'Filter charts by property or date ranges to track trends.',
        'Click "Export Report" to download a summary spreadsheet file.'
      ]
    },
    {
      id: 19,
      title: 'Security & Audit Trail',
      tab: 'security',
      icon: ShieldCheck,
      illustration: '/roles_matrix_banner.png',
      summary: 'Audit workspace access logs and verify database transaction integrity via the cryptographic ledger.',
      details: [
        'Every structural change (role updates, invites, deletions) is logged in the audit trail.',
        'The security engine verifies cryptographic ledger chains to identify data tampering.',
        'Access details include IP addresses, browser agents, and timestamps for accountability.'
      ],
      steps: [
        'Select the Security & Audit tab in the sidebar.',
        'Review the Audit Trail log to track recent administrative changes.',
        'Run the Ledger Integrity scanner to confirm cryptographic signature validity.'
      ]
    },
    {
      id: 20,
      title: 'Team Roles & Scope',
      tab: 'team',
      icon: Settings,
      illustration: '/roles_matrix_banner.png',
      summary: 'Invite teammates, define permission roles, and scope access limits to specific properties.',
      details: [
        'Predefined roles (Accountant, Manager, Tech) offer quick, safe defaults for team access.',
        'Customize permission profiles for individual modules (Properties, Finance, Maintenance).',
        'Scope members to "Assigned properties only" to restrict their view to specific units.'
      ],
      steps: [
        'Select the Organization tab and click "Members & Security".',
        'Click "Invite Member", enter their email, choose a role, and select their property scope.',
        'For existing members, click "Manage Access" to adjust custom permission overrides.'
      ]
    }
  ];

  // Helper for receipt icon
  function ReceiptIcon(props: any) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
        <path d="M16 8H8" />
        <path d="M16 12H8" />
        <path d="M13 16H8" />
      </svg>
    );
  }

  const filteredChapters = chapters.filter(ch => 
    ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeChapter = chapters.find(ch => ch.id === activeChapterId) || chapters[0];
  const ActiveIcon = activeChapter.icon;

  return (
    <div className="space-y-6">
      
      {/* Search and Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-paper-50 dark:bg-ink-950/40 p-4 border border-paper-200 dark:border-ink-800 rounded-lg">
        <div>
          <h3 className="text-sm font-bold text-paper-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-coral-500" /> Interactive User Guide
          </h3>
          <p className="text-[11px] text-paper-500 dark:text-ink-400 mt-0.5">Select a chapter below to learn about each tab and its operational features.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search chapters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 rounded-md text-xs outline-none focus:ring-1 focus:ring-coral-500 focus:border-coral-500"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-paper-400 dark:text-ink-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left: Chapter Sidebar */}
        <div className="md:col-span-1 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg p-3 max-h-[600px] overflow-y-auto space-y-1">
          <div className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-widest px-2.5 pb-2 border-b border-paper-100 dark:border-ink-750 mb-2">
            Chapters
          </div>
          {filteredChapters.map((ch) => {
            const ChapterIcon = ch.icon;
            const isActive = ch.id === activeChapterId;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveChapterId(ch.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-all ${
                  isActive 
                    ? 'bg-coral-50 dark:bg-coral-500/10 text-coral-500 font-semibold' 
                    : 'text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-900/50'
                }`}
              >
                <ChapterIcon className="w-4 h-4 shrink-0" />
                <span className="text-[11.5px] truncate">{ch.id}. {ch.title}</span>
              </button>
            );
          })}
          {filteredChapters.length === 0 && (
            <div className="text-center py-6 text-xs text-paper-400 dark:text-ink-500">
              No matching chapters.
            </div>
          )}
        </div>

        {/* Right: Chapter Content Area */}
        <div className="md:col-span-3 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm flex flex-col min-h-[500px]">
          
          {/* Chapter Banner/Header */}
          <div 
            className="p-6 relative overflow-hidden border-b border-paper-200 dark:border-ink-700 bg-ink-950 dark:bg-black min-h-[140px] flex items-center"
            style={{
              backgroundImage: `linear-gradient(rgba(10, 15, 20, 0.82), rgba(5, 8, 11, 0.95)), url("${activeChapter.illustration}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-coral-500 font-bold text-[9px] uppercase tracking-wider">
                <ActiveIcon className="w-3.5 h-3.5" /> Chapter {activeChapter.id}
              </div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">{activeChapter.title}</h2>
              <p className="text-[11px] text-ink-300 max-w-xl leading-relaxed">{activeChapter.summary}</p>
            </div>
          </div>

          {/* Chapter Content Details */}
          <div className="p-6 space-y-6 flex-1 bg-paper-50/20 dark:bg-ink-800/10">
            
            {/* Detailed Explanations */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-4 h-4 text-coral-500" /> Operational Features
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {activeChapter.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3.5 rounded-lg bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-750 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-coral-500 mt-1.5 shrink-0"></div>
                    <p className="text-xs text-paper-700 dark:text-ink-200 leading-relaxed font-medium">
                      {detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3.5 pt-2 border-t border-paper-100 dark:border-ink-750">
              <h4 className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> How to use this Tab
              </h4>
              <ol className="space-y-2.5">
                {activeChapter.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-paper-700 dark:text-ink-200 font-medium">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

          </div>
          
        </div>

      </div>

    </div>
  );
}
