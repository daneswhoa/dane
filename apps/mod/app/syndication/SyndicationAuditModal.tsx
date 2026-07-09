import React, { useState } from 'react';
import { 
  X, Globe, MapPin, Shield, Ban, CheckCircle, Check, AlertTriangle, AlertCircle, 
  DollarSign, Wrench, FileText, User, Mail, Calendar, Compass, Star
} from 'lucide-react';

export interface ListedUnit {
  unitId: string;
  propertyName: string;
  propertyId: string;
  label: string;
  unitType: string;
  county: string;
  subcounty: string;
  propertyAddress: string;
  rent: number;
  deposit: number;
  moveInFees: number;
  status: 'Active' | 'Suspended' | 'Under Review' | 'Flagged';
  referralTraffic: 'Organic' | 'Paid Promo' | 'Social Share';
  amenities: string[];
  rules: string[];
  latitude?: string;
  longitude?: string;
  images: string[];
  inquiries: Array<{
    id: string;
    type: 'tour' | 'message';
    tenantName: string;
    tenantEmail: string;
    message: string;
    tourDate?: string;
    tourTime?: string;
    createdAt: string;
  }>;
}

interface SyndicationAuditModalProps {
  unit: ListedUnit;
  onClose: () => void;
  onSuspend: (unitId: string) => void;
  onApprove: (unitId: string) => void;
}

export default function SyndicationAuditModal({
  unit,
  onClose,
  onSuspend,
  onApprove
}: SyndicationAuditModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'inquiries'>('details');
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => {
          if (!showSuspendConfirm && !showApproveConfirm) onClose();
        }}
        className="absolute inset-0 bg-black/35 dark:bg-black/65 dark:backdrop-blur-sm transition-opacity"
      ></div>

      {/* Modal Card */}
      <div className="relative bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full flex flex-col z-10 animate-fade-in trans-theme max-h-[90vh]">
        
        {/* Banner with main image */}
        <div className="h-28 relative bg-ink-950 shrink-0">
          <img src={unit.images[0]} alt={unit.label} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-ink-900 to-transparent"></div>
          
          <div className="absolute top-4 right-4 z-20">
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="absolute bottom-2 left-6 z-10">
            <span className="px-2 py-0.5 rounded bg-coral-500 text-white text-[9px] font-bold uppercase tracking-wider">
              {unit.unitType}
            </span>
            <h3 className="text-base font-black text-paper-950 dark:text-white mt-1 leading-tight">
              {unit.propertyName} • Unit {unit.label}
            </h3>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-950/60 px-6 shrink-0 trans-theme">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 text-xs font-bold transition-all relative ${
              activeTab === 'details' 
                ? 'text-coral-500 border-b-2 border-coral-500' 
                : 'text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white'
            }`}
          >
            Listing Specifications
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-3 text-xs font-bold transition-all relative ${
              activeTab === 'inquiries' 
                ? 'text-coral-500 border-b-2 border-coral-500' 
                : 'text-paper-500 dark:text-ink-400 hover:text-paper-900 dark:hover:text-white'
            }`}
          >
            Lease Inquiries ({unit.inquiries.length})
          </button>
        </div>

        {/* Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {activeTab === 'details' && (
            <div className="space-y-5">
              
              {/* Financial Profile & Location Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location */}
                <div className="bg-paper-50 dark:bg-ink-950 p-4 rounded-xl border border-paper-200/60 dark:border-ink-800/80 space-y-1">
                  <p className="text-[9px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wide">Location Metadata</p>
                  <p className="text-xs text-paper-800 dark:text-white font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-coral-500" /> {unit.subcounty}, {unit.county} County
                  </p>
                  <p className="text-[10px] text-paper-500 dark:text-ink-400 pl-4.5">{unit.propertyAddress}</p>
                  {(unit.latitude || unit.longitude) && (
                    <p className="text-[9px] text-paper-400 dark:text-ink-500 pl-4.5 font-mono">GPS: {unit.latitude}, {unit.longitude}</p>
                  )}
                </div>

                {/* Financial Ledger Specs */}
                <div className="bg-paper-50 dark:bg-ink-950 p-4 rounded-xl border border-paper-200/60 dark:border-ink-800/80 grid grid-cols-3 gap-2 text-center items-center">
                  <div>
                    <p className="text-[9px] text-paper-400 dark:text-ink-500 uppercase font-bold">Monthly Rent</p>
                    <p className="text-xs font-bold text-paper-900 dark:text-white font-mono mt-0.5">KES {unit.rent.toLocaleString()}</p>
                  </div>
                  <div className="border-l border-paper-200 dark:border-ink-800">
                    <p className="text-[9px] text-paper-400 dark:text-ink-500 uppercase font-bold">Deposit</p>
                    <p className="text-xs font-bold text-paper-900 dark:text-white font-mono mt-0.5">KES {unit.deposit.toLocaleString()}</p>
                  </div>
                  <div className="border-l border-paper-200 dark:border-ink-800">
                    <p className="text-[9px] text-paper-400 dark:text-ink-500 uppercase font-bold">Move In</p>
                    <p className="text-xs font-bold text-paper-900 dark:text-white font-mono mt-0.5">KES {unit.moveInFees.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Amenities & Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wide">Included Amenities</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {unit.amenities.map(amenity => (
                      <span key={amenity} className="px-2.5 py-0.5 bg-coral-500/10 text-coral-500 text-[10px] font-bold rounded-lg border border-coral-500/20">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wide">Tenancy Rules</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {unit.rules.map(rule => (
                      <span key={rule} className="px-2.5 py-0.5 bg-paper-100 dark:bg-ink-800 text-paper-600 dark:text-ink-300 text-[10px] font-semibold rounded-lg border border-paper-200 dark:border-ink-700">
                        {rule}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Referral details */}
              <div className="bg-paper-50 dark:bg-ink-950 p-3.5 rounded-xl border border-paper-200/60 dark:border-ink-800/80 flex items-center justify-between text-xs">
                <span className="text-paper-600 dark:text-ink-400">Referral Traffic Route:</span>
                <span className="px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-450 text-[10px] font-bold uppercase">
                  {unit.referralTraffic}
                </span>
              </div>

              {/* Policy Auditing Controls */}
              <div className="bg-red-50/50 dark:bg-red-500/5 border border-red-200/50 dark:border-red-500/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  <h4 className="text-xs font-bold uppercase tracking-wide">Ecosystem Moderation Policies</h4>
                </div>
                
                <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed">
                  Suspend active feeds to hide them from the resident portal if listing details violate tenant laws or match spam pattern benchmarks.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {unit.status !== 'Suspended' && (
                    <button 
                      onClick={() => setShowSuspendConfirm(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm trans-subtle flex items-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" /> Suspend Public Syndication
                    </button>
                  )}
                  {unit.status !== 'Active' && (
                    <button 
                      onClick={() => setShowApproveConfirm(true)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm trans-subtle flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve & List Active
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: LEASE INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-paper-100 dark:border-ink-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wide text-paper-900 dark:text-white">Recent Tenant Inquiries & Tours</h4>
                <span className="text-[10px] font-mono text-paper-400 dark:text-ink-500">{unit.inquiries.length} Messages</span>
              </div>

              <div className="space-y-3">
                {unit.inquiries.map(inq => (
                  <div key={inq.id} className="border border-paper-250/70 dark:border-ink-800 bg-white dark:bg-ink-950 p-4 rounded-xl space-y-2 trans-theme">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="text-xs font-black text-paper-900 dark:text-white">{inq.tenantName}</span>
                        <span className="text-[10px] text-paper-405 dark:text-ink-450 ml-2">({inq.tenantEmail})</span>
                      </div>
                      
                      {inq.type === 'tour' ? (
                        <span className="self-start sm:self-auto px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-bold uppercase tracking-wider rounded">
                          Tour Scheduled: {inq.tourDate} @ {inq.tourTime}
                        </span>
                      ) : (
                        <span className="self-start sm:self-auto px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase tracking-wider rounded">
                          General Inquiry
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-paper-700 dark:text-ink-200 leading-relaxed italic bg-paper-50 dark:bg-ink-900/60 p-2.5 rounded-lg">
                      "{inq.message}"
                    </p>

                    <p className="text-[9px] text-paper-400 dark:text-ink-500 text-right">
                      Received: {new Date(inq.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}

                {unit.inquiries.length === 0 && (
                  <p className="text-xs text-center py-10 text-paper-400 dark:text-ink-500">
                    No active inquiries or scheduling requests sent for this vacancy.
                  </p>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-paper-100 dark:border-ink-800 bg-paper-50 dark:bg-ink-950/40 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-paper-200 hover:bg-paper-300 dark:bg-ink-800 dark:hover:bg-ink-700 text-paper-700 dark:text-ink-100 text-xs font-bold rounded-lg trans-subtle"
          >
            Close
          </button>
        </div>

        {/* SUSPEND CONFIRMATION OVERLAY */}
        {showSuspendConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/75 dark:backdrop-blur-sm p-6 animate-fade-in">
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 trans-theme">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h5 className="font-bold text-sm">Deactivate Public Syndication</h5>
              </div>

              <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed">
                Are you sure you want to suspend syndication for unit <strong>{unit.label}</strong> in <strong>{unit.propertyName}</strong>? This takes the vacancy listing offline instantly.
              </p>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  onClick={() => setShowSuspendConfirm(false)}
                  className="px-3.5 py-1.5 bg-paper-100 hover:bg-paper-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-paper-700 dark:text-ink-200 text-xs font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onSuspend(unit.unitId);
                    setShowSuspendConfirm(false);
                  }}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Suspend Vacancy Listing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* APPROVE CONFIRMATION OVERLAY */}
        {showApproveConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/75 dark:backdrop-blur-sm p-6 animate-fade-in">
            <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 trans-theme">
              <div className="flex items-center gap-2 text-emerald-500">
                <Check className="w-5 h-5 shrink-0" />
                <h5 className="font-bold text-sm">Approve Syndicated Listing</h5>
              </div>

              <p className="text-xs text-paper-600 dark:text-ink-300 leading-relaxed">
                Approve unit <strong>{unit.label}</strong> in <strong>{unit.propertyName}</strong> for active syndication to the tenant portal.
              </p>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  onClick={() => setShowApproveConfirm(false)}
                  className="px-3.5 py-1.5 bg-paper-100 hover:bg-paper-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-paper-700 dark:text-ink-200 text-xs font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onApprove(unit.unitId);
                    setShowApproveConfirm(false);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Approve Listing
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
