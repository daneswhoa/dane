'use client';
import React from 'react';
import { Check } from 'lucide-react';

export default function Step3Settings({ propertySettings, setPropertySettings, teamMembers, selectedTeam, setSelectedTeam }: any) {
  const toggleTeam = (id: string) => {
    setSelectedTeam((prev: string[]) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-ink-900 border border-paper-200 p-5 rounded-lg">
        <h2 className="text-sm font-bold uppercase mb-4">Property Settings</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
             <label className="text-[9px] uppercase font-bold text-paper-400">Rent Due Date</label>
             <select value={propertySettings.rentDueDate} onChange={e => setPropertySettings({...propertySettings, rentDueDate: Number(e.target.value)})} className="w-full px-2 py-2 mt-1 border rounded text-xs">
                {Array.from({length: 31}, (_, i) => i+1).map(d => <option key={d} value={d}>Day {d}</option>)}
             </select>
          </div>
          <div>
             <label className="text-[9px] uppercase font-bold text-paper-400">Late Fee</label>
             <input type="number" value={propertySettings.lateFeePenalty} onChange={e => setPropertySettings({...propertySettings, lateFeePenalty: Number(e.target.value)})} className="w-full px-2 py-2 mt-1 border rounded text-xs" />
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-ink-900 border border-paper-200 p-5 rounded-lg">
        <h2 className="text-sm font-bold uppercase mb-4">Team Access</h2>
        <div className="divide-y border rounded-lg">
          {teamMembers.map((member: any) => (
             <div key={member.id} onClick={() => toggleTeam(member.id)} className="p-3 flex justify-between cursor-pointer hover:bg-paper-50">
               <div>
                  <p className="text-xs font-semibold">{member.name}</p>
                  <p className="text-[10px] text-paper-400">{member.email}</p>
               </div>
               <div className={`w-5 h-5 border rounded flex items-center justify-center ${selectedTeam.includes(member.id) ? 'bg-coral-500 border-coral-500 text-white' : ''}`}>
                  {selectedTeam.includes(member.id) && <Check className="w-3 h-3" />}
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
