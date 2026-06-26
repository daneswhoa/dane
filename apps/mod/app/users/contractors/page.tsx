'use client';

import React, { useState } from 'react';
import ModLayout from '../../components/ModLayout';
import { 
  HardHat, Search, Filter, Download, MoreVertical, ShieldCheck, 
  ShieldAlert, Shield, Star, MapPin, Mail, Phone, Calendar, 
  FileText, CheckCircle, XCircle, AlertTriangle, ChevronRight
} from 'lucide-react';

// --- MOCK DATA ---
const CONTRACTORS = [
  {
    id: 'con-01',
    name: 'Robert Miller',
    company: 'Miller Plumbing Services',
    email: 'robert@millerplumbing.com',
    phone: '+31 6 12345678',
    specialty: 'Plumbing',
    status: 'verified', // verified, pending, banned
    rating: 4.8,
    jobsCompleted: 142,
    location: 'Amsterdam, NL',
    joined: '2023-04-12',
    avatar: 'https://i.pravatar.cc/150?u=rob',
  },
  {
    id: 'con-02',
    name: 'Sarah Jenkins',
    company: 'Spark Electrical Masters',
    email: 'sarah@sparkelectrical.com',
    phone: '+31 6 87654321',
    specialty: 'Electrical',
    status: 'pending',
    rating: 0,
    jobsCompleted: 0,
    location: 'Rotterdam, NL',
    joined: '2024-01-05',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
  },
  {
    id: 'con-03',
    name: 'Michael Chen',
    company: 'Chen General Repairs',
    email: 'mike@chenrepairs.com',
    phone: '+31 6 11223344',
    specialty: 'General Maintenance',
    status: 'verified',
    rating: 4.5,
    jobsCompleted: 89,
    location: 'Utrecht, NL',
    joined: '2023-08-22',
    avatar: 'https://i.pravatar.cc/150?u=mike',
  },
  {
    id: 'con-04',
    name: 'David De Boer',
    company: 'De Boer HVAC',
    email: 'david@deboerhvac.nl',
    phone: '+31 6 99887766',
    specialty: 'HVAC',
    status: 'banned',
    rating: 2.1,
    jobsCompleted: 14,
    location: 'The Hague, NL',
    joined: '2023-11-10',
    avatar: 'https://i.pravatar.cc/150?u=david',
  },
  {
    id: 'con-05',
    name: 'Emma Visser',
    company: 'Visser Cleaning Experts',
    email: 'emma@vissercleaning.nl',
    phone: '+31 6 55443322',
    specialty: 'Cleaning',
    status: 'verified',
    rating: 4.9,
    jobsCompleted: 310,
    location: 'Amsterdam, NL',
    joined: '2022-09-15',
    avatar: 'https://i.pravatar.cc/150?u=emma',
  },
];

export default function ContractorsManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContractor, setSelectedContractor] = useState<typeof CONTRACTORS[0] | null>(null);

  const filteredData = CONTRACTORS.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'verified':
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" /> Verified
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3 h-3" /> Pending Review
          </div>
        );
      case 'banned':
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full border border-red-100 dark:border-red-500/20 text-[10px] font-bold uppercase tracking-wider">
            <Shield className="w-3 h-3" /> Suspended
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ModLayout>
      <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-8rem)]">
        
        {/* Main List Column */}
        <div className={`flex-1 flex flex-col space-y-6 transition-all duration-300 ${selectedContractor ? 'lg:w-2/3 lg:flex-none' : 'w-full'}`}>
          
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-ink-900 p-5 rounded-2xl border border-paper-200 dark:border-ink-800 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-paper-900 dark:text-white flex items-center gap-2">
                <HardHat className="w-6 h-6 text-indigo-500" /> Contractor Network
              </h1>
              <p className="text-xs text-paper-500 dark:text-ink-400 mt-1">Manage, verify, and monitor service providers across the platform.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-3 py-2 bg-paper-100 hover:bg-paper-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-paper-700 dark:text-ink-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-paper-400 dark:text-ink-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contractors by name, company, or email..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white shadow-sm"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl p-1 shadow-sm">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${statusFilter === 'all' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'text-paper-500 hover:bg-paper-50 dark:hover:bg-ink-800'}`}
              >
                All
              </button>
              <button 
                onClick={() => setStatusFilter('verified')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${statusFilter === 'verified' ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'text-paper-500 hover:bg-paper-50 dark:hover:bg-ink-800'}`}
              >
                Verified
              </button>
              <button 
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${statusFilter === 'pending' ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'text-paper-500 hover:bg-paper-50 dark:hover:bg-ink-800'}`}
              >
                Pending
              </button>
              <button 
                onClick={() => setStatusFilter('banned')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${statusFilter === 'banned' ? 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'text-paper-500 hover:bg-paper-50 dark:hover:bg-ink-800'}`}
              >
                Suspended
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-paper-50/50 dark:bg-ink-950/50 border-b border-paper-200 dark:border-ink-800 text-[10px] font-black uppercase tracking-wider text-paper-500 dark:text-ink-400">
                    <th className="px-5 py-4">Contractor Info</th>
                    <th className="px-5 py-4">Specialty & Rating</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-100 dark:divide-ink-800/60">
                  {filteredData.map(contractor => (
                    <tr 
                      key={contractor.id} 
                      onClick={() => setSelectedContractor(contractor)}
                      className={`group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 cursor-pointer transition-colors ${selectedContractor?.id === contractor.id ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''}`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={contractor.avatar} alt={contractor.name} className="w-10 h-10 rounded-full border border-paper-200 dark:border-ink-700 object-cover" />
                          <div>
                            <div className="text-sm font-bold text-paper-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {contractor.name}
                            </div>
                            <div className="text-[11px] text-paper-500 dark:text-ink-400 font-medium">
                              {contractor.company}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs font-semibold text-paper-800 dark:text-ink-200">{contractor.specialty}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className={`w-3.h h-3.5 ${contractor.rating > 0 ? 'text-amber-400 fill-amber-400' : 'text-paper-300 dark:text-ink-600'}`} />
                          <span className="text-[10px] font-bold text-paper-600 dark:text-ink-400">
                            {contractor.rating > 0 ? contractor.rating.toFixed(1) : 'No Ratings'}
                          </span>
                          <span className="text-[9px] text-paper-400 mx-1">•</span>
                          <span className="text-[10px] text-paper-500 dark:text-ink-400">{contractor.jobsCompleted} Jobs</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {getStatusBadge(contractor.status)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="p-1.5 rounded-lg text-paper-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-paper-500 dark:text-ink-400 text-xs">
                        No contractors found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-paper-200 dark:border-ink-800 bg-paper-50/50 dark:bg-ink-950/50 text-[10px] text-paper-500 dark:text-ink-400 flex justify-between items-center">
              <span>Showing {filteredData.length} of {CONTRACTORS.length} records</span>
            </div>
          </div>
        </div>

        {/* Slide-over Profile Inspector (Only visible when selected) */}
        {selectedContractor && (
          <div className="w-full lg:w-96 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-slide-left flex-shrink-0 relative">
            
            {/* Header Cover */}
            <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 relative flex-shrink-0">
              <button 
                onClick={() => setSelectedContractor(null)}
                className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-sm transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Avatar & Title */}
            <div className="px-6 pb-4 relative flex-shrink-0 border-b border-paper-100 dark:border-ink-800">
              <img 
                src={selectedContractor.avatar} 
                alt={selectedContractor.name} 
                className="w-20 h-20 rounded-full border-4 border-white dark:border-ink-900 object-cover absolute -top-10 shadow-md"
              />
              <div className="mt-12">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-black text-paper-900 dark:text-white">{selectedContractor.name}</h2>
                  {getStatusBadge(selectedContractor.status)}
                </div>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{selectedContractor.company}</p>
                <p className="text-xs text-paper-500 dark:text-ink-400 mt-0.5">{selectedContractor.specialty}</p>
              </div>
            </div>

            {/* Details Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              
              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wider">Contact Details</h3>
                <div className="bg-paper-50 dark:bg-ink-950/50 rounded-xl p-3 border border-paper-100 dark:border-ink-800 space-y-2.5">
                  <div className="flex items-center gap-3 text-xs text-paper-700 dark:text-ink-300">
                    <Mail className="w-4 h-4 text-paper-400" /> {selectedContractor.email}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-paper-700 dark:text-ink-300">
                    <Phone className="w-4 h-4 text-paper-400" /> {selectedContractor.phone}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-paper-700 dark:text-ink-300">
                    <MapPin className="w-4 h-4 text-paper-400" /> {selectedContractor.location}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-paper-50 dark:bg-ink-950/50 rounded-xl p-3 border border-paper-100 dark:border-ink-800 text-center">
                  <p className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase">Jobs Completed</p>
                  <p className="text-xl font-black text-paper-900 dark:text-white mt-1">{selectedContractor.jobsCompleted}</p>
                </div>
                <div className="bg-paper-50 dark:bg-ink-950/50 rounded-xl p-3 border border-paper-100 dark:border-ink-800 text-center">
                  <p className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase">Avg Rating</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-xl font-black text-paper-900 dark:text-white">{selectedContractor.rating > 0 ? selectedContractor.rating.toFixed(1) : 'N/A'}</span>
                    <Star className={`w-4 h-4 ${selectedContractor.rating > 0 ? 'text-amber-400 fill-amber-400' : 'text-paper-300'}`} />
                  </div>
                </div>
              </div>

              {/* Documents Verification section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-paper-400 dark:text-ink-500 uppercase tracking-wider">Verification Documents</h3>
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">3 Files</span>
                </div>
                <div className="space-y-2">
                  {['Business License (KVK)', 'Liability Insurance', 'Identity Document'].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 border border-paper-200 dark:border-ink-800 rounded-lg hover:bg-paper-50 dark:hover:bg-ink-800/50 cursor-pointer transition-colors group">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-paper-800 dark:text-ink-200">{doc}</p>
                          <p className="text-[9px] text-paper-400 mt-0.5">Uploaded {selectedContractor.joined}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-paper-300 group-hover:text-indigo-500" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-paper-400 dark:text-ink-600 flex items-center gap-1.5 pt-2 border-t border-paper-100 dark:border-ink-800">
                <Calendar className="w-3.5 h-3.5" /> Registered on {selectedContractor.joined}
              </div>

            </div>

            {/* Quick Actions Footer */}
            <div className="p-4 bg-paper-50 dark:bg-ink-950/80 border-t border-paper-200 dark:border-ink-800 grid grid-cols-2 gap-2 flex-shrink-0">
              {selectedContractor.status === 'pending' && (
                <button className="col-span-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
                  <CheckCircle className="w-4 h-4" /> Approve & Verify
                </button>
              )}
              
              <button className={`px-4 py-2.5 bg-white dark:bg-ink-900 border text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm ${
                selectedContractor.status === 'banned' 
                  ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  : 'border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 hover:bg-paper-50 dark:hover:bg-ink-800'
              } ${selectedContractor.status !== 'pending' ? 'col-span-2' : ''}`}>
                {selectedContractor.status === 'banned' ? (
                  <><ShieldCheck className="w-4 h-4" /> Unban Contractor</>
                ) : (
                  <><ShieldAlert className="w-4 h-4" /> Update Status</>
                )}
              </button>

              {selectedContractor.status !== 'banned' && (
                <button className="col-span-2 mt-1 px-4 py-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Suspend Account
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </ModLayout>
  );
}
