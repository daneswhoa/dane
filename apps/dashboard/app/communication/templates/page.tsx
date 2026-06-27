'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Plus, Edit, Trash2, LayoutTemplate, HelpCircle, 
  Check, X, AlertTriangle, Loader2, Info, Search, Send,
  Sparkles, Code2, Copy, Braces, Wand2, Terminal
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  isSystem: boolean;
  createdAt: string;
}

export default function CommunicationTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Delete State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchTemplates = () => {
    setLoading(true);
    setError('');
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/email-templates`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to retrieve templates');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setTemplates(data);
        }
      })
      .catch((err) => {
        setError(err.message || 'An error occurred while loading templates.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleEditClick = (tpl: Template) => {
    setSelectedTemplate(tpl);
    setName(tpl.name);
    setSubject(tpl.subject);
    setBody(tpl.body);
    setSaveError('');
    setIsEditing(true);
  };

  const handleCreateClick = () => {
    setSelectedTemplate(null);
    setName('');
    setSubject('');
    setBody('');
    setSaveError('');
    setIsEditing(true);
  };

  const insertPlaceholder = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newBody = text.substring(0, start) + tag + text.substring(end);
    setBody(newBody);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + tag.length;
    }, 0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim() || !body.trim()) return;

    setIsSaving(true);
    setSaveError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/email-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: selectedTemplate?.id,
          name,
          subject,
          body,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to save template');
      }

      setIsEditing(false);
      fetchTemplates();
    } catch (err: any) {
      setSaveError(err.message || 'An error occurred while saving the template.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard/email-templates/${id}/delete`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to delete template');
      
      setConfirmDeleteId(null);
      fetchTemplates();
    } catch (err: any) {
      alert(err.message || 'Could not delete template.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Premium Header Row */}
        <div className="relative overflow-hidden bg-ink-950 border border-ink-800 p-6 sm:p-8 rounded-2xl shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-coral-500/10 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none transform -translate-x-1/3 translate-y-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
                Template Library
              </h2>
              <p className="text-sm text-ink-300 max-w-xl leading-relaxed">
                Design and manage your message templates. Use dynamic variables to personalize every outgoing message automatically.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleCreateClick}
                className="group relative px-5 py-2.5 bg-white text-ink-950 font-bold text-sm rounded-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-coral-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                <Plus className="w-4 h-4 relative z-10" /> 
                <span className="relative z-10">New Template</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-ink-950 p-2 rounded-2xl border border-paper-200 dark:border-ink-800 shadow-sm">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-3 w-4 h-4 text-paper-400 dark:text-ink-500 group-focus-within:text-coral-500 transition-colors" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by template name or subject..."
              className="w-full pl-11 pr-4 py-2.5 bg-paper-50 dark:bg-ink-900/50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-coral-500/50 dark:text-white transition-all placeholder:text-paper-400 dark:placeholder:text-ink-600"
            />
          </div>
          <div className="flex items-center gap-2 pr-2 text-xs text-paper-500 dark:text-ink-400 font-medium">
            <span className="px-2.5 py-1 bg-paper-100 dark:bg-ink-900 rounded-lg">{templates.length} Total</span>
            <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">{templates.filter(t => t.isSystem).length} System</span>
          </div>
        </div>

        {/* Main Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-coral-500" />
              <p className="text-xs text-paper-500 dark:text-ink-400 font-medium animate-pulse">Initializing template engine...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-2xl flex items-center justify-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-paper-50/50 dark:bg-ink-950/30 border border-dashed border-paper-200 dark:border-ink-800 rounded-3xl">
            <div className="w-16 h-16 bg-white dark:bg-ink-900 rounded-2xl shadow-sm flex items-center justify-center mb-4 text-paper-300 dark:text-ink-600">
              <LayoutTemplate className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-paper-900 dark:text-white mb-1">No templates found</h3>
            <p className="text-xs text-paper-500 dark:text-ink-400 mb-6">Create your first custom message template.</p>
            <button 
              onClick={handleCreateClick}
              className="px-4 py-2 bg-paper-900 dark:bg-white text-white dark:text-ink-950 text-xs font-bold rounded-xl hover:scale-105 transition-transform"
            >
              Create Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(tpl => (
              <div 
                key={tpl.id}
                className="group relative bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-2xl overflow-hidden hover:border-coral-500/40 hover:shadow-[0_8px_30px_-12px_rgba(244,114,182,0.2)] dark:hover:shadow-[0_8px_30px_-12px_rgba(244,114,182,0.15)] transition-all duration-300 flex flex-col"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-coral-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="p-6 flex-1 space-y-4 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${
                        tpl.isSystem 
                          ? 'bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-500/20 dark:to-purple-500/5 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20' 
                          : 'bg-gradient-to-br from-coral-100 to-coral-50 dark:from-coral-500/20 dark:to-coral-500/5 text-coral-600 dark:text-coral-400 border border-coral-200 dark:border-coral-500/20'
                      }`}>
                        {tpl.isSystem ? <Terminal className="w-4 h-4" /> : <LayoutTemplate className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${tpl.isSystem ? 'text-purple-600 dark:text-purple-400' : 'text-coral-600 dark:text-coral-400'}`}>
                          {tpl.isSystem ? 'System Template' : 'Custom Template'}
                        </span>
                      </div>
                    </div>
                    
                    {!tpl.isSystem && (
                      <button 
                        onClick={() => setConfirmDeleteId(tpl.id)}
                        className="p-1.5 text-paper-300 hover:text-red-500 dark:text-ink-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-paper-900 dark:text-white line-clamp-1 mb-1 group-hover:text-coral-500 transition-colors">{tpl.name}</h3>
                    <p className="text-[11px] text-paper-500 dark:text-ink-400 font-medium truncate flex items-center gap-1.5">
                      <span className="text-paper-400 dark:text-ink-500">Subject:</span> {tpl.subject}
                    </p>
                  </div>

                  {/* Code snippet preview */}
                  <div className="relative mt-4">
                    <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-paper-50 dark:from-ink-900 to-transparent z-10 rounded-t-lg" />
                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-paper-50 dark:from-ink-900 to-transparent z-10 rounded-b-lg" />
                    <div className="p-4 bg-paper-50 dark:bg-ink-900 border border-paper-100 dark:border-ink-800 rounded-xl h-[120px] overflow-hidden text-[11px] font-mono text-paper-600 dark:text-ink-400 leading-relaxed whitespace-pre-wrap">
                      {tpl.body}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-6 py-4 bg-paper-50/50 dark:bg-ink-950 border-t border-paper-100 dark:border-ink-800 flex justify-between items-center relative z-10">
                  <span className="text-[10px] text-paper-400 dark:text-ink-500 font-medium">
                    Updated {new Date(tpl.createdAt).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => handleEditClick(tpl)}
                    className="px-4 py-2 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-700 hover:border-coral-500/50 dark:hover:border-coral-500/50 text-paper-700 dark:text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all hover:shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Premium Editor Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-paper-900/60 dark:bg-ink-950/80 backdrop-blur-md" onClick={() => setIsEditing(false)} />
            
            <div className="relative bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-[24px] overflow-hidden shadow-2xl w-full max-w-3xl animate-slide-up flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="px-8 py-5 border-b border-paper-100 dark:border-ink-800 flex justify-between items-center bg-paper-50/50 dark:bg-ink-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-coral-500/10 rounded-xl border border-coral-500/20 flex items-center justify-center text-coral-500">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-paper-900 dark:text-white">
                      {selectedTemplate ? 'Edit Template' : 'Create Template'}
                    </h3>
                    <p className="text-[10px] text-paper-500 dark:text-ink-400 font-medium mt-0.5">
                      Configure dynamic variables and formatting.
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-paper-200 dark:hover:bg-ink-800 rounded-xl transition-colors text-paper-400 dark:text-ink-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
                {saveError && (
                  <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-3 font-medium">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-paper-600 dark:text-ink-400 uppercase tracking-widest flex items-center gap-1.5">
                      Template Name <span className="text-coral-500">*</span>
                    </label>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Winter Maintenance Alert"
                      className="w-full px-4 py-3 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-coral-500/50 focus:border-coral-500 dark:text-white transition-all placeholder:text-paper-300 dark:placeholder:text-ink-700"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-paper-600 dark:text-ink-400 uppercase tracking-widest flex items-center gap-1.5">
                      Default Email Subject <span className="text-coral-500">*</span>
                    </label>
                    <input 
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Notice: Inspection at {property}"
                      className="w-full px-4 py-3 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-coral-500/50 focus:border-coral-500 dark:text-white transition-all placeholder:text-paper-300 dark:placeholder:text-ink-700"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
                    <label className="text-[10px] font-bold text-paper-600 dark:text-ink-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Braces className="w-3.5 h-3.5 text-coral-500" /> Template Body
                    </label>
                    
                    {/* Placeholder tags - IDE style */}
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      {['{name}', '{property}', '{amount}', '{date}'].map((tag) => (
                        <button 
                          key={tag}
                          type="button" 
                          onClick={() => insertPlaceholder(tag)}
                          className="px-2.5 py-1.5 bg-paper-100 hover:bg-paper-200 dark:bg-ink-900 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 rounded-lg text-paper-700 dark:text-coral-400 font-mono font-medium transition-all active:scale-95 flex items-center gap-1 group"
                        >
                          <Plus className="w-3 h-3 text-paper-400 group-hover:text-paper-600 dark:text-ink-600 dark:group-hover:text-coral-400" />
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-coral-500/5 to-purple-500/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                    <textarea 
                      ref={textareaRef}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Type your message here... Use tags like {name} to personalize."
                      className="w-full px-5 py-4 bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-coral-500/50 focus:border-coral-500 dark:text-ink-100 font-mono min-h-[240px] leading-relaxed shadow-inner resize-y transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-end gap-3 pt-6 border-t border-paper-100 dark:border-ink-800/80">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 text-paper-700 dark:text-white text-xs font-bold rounded-xl hover:bg-paper-50 dark:hover:bg-ink-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-coral-500 hover:bg-coral-600 disabled:bg-coral-500/50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_-3px_rgba(244,114,182,0.4)] transition-all"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" /> Save Template
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-paper-900/60 dark:bg-ink-950/80 backdrop-blur-md" onClick={() => setConfirmDeleteId(null)} />
            
            <div className="relative bg-white dark:bg-ink-950 border border-paper-200 dark:border-ink-800 rounded-[24px] overflow-hidden shadow-2xl max-w-sm w-full animate-slide-up p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center text-red-500">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-center text-paper-900 dark:text-white mb-2">Delete Template?</h3>
              <p className="text-xs text-center text-paper-500 dark:text-ink-400 mb-8 leading-relaxed">
                This template will be permanently removed. Any automated flows relying on it will revert to defaults.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
                  disabled={isDeleting}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)] transition-all"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, delete it'}
                </button>
                <button 
                  onClick={() => setConfirmDeleteId(null)}
                  className="w-full py-3 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 text-paper-700 dark:text-white text-sm font-bold rounded-xl hover:bg-paper-50 dark:hover:bg-ink-800 transition-colors"
                >
                  Keep Template
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
