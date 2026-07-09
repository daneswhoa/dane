import React from 'react';
import { Check, X } from 'lucide-react';
import { PRESET_AMENITIES } from './types';

interface AmenitiesRulesStepProps {
  selectedAmenities: string[];
  setSelectedAmenities: (v: string[]) => void;
  rules: string[];
  ruleInput: string;
  setRuleInput: (v: string) => void;
  handleAddRule: () => void;
  handleRemoveRule: (idx: number) => void;
}

export const AmenitiesRulesStep: React.FC<AmenitiesRulesStepProps> = ({
  selectedAmenities,
  setSelectedAmenities,
  rules,
  ruleInput,
  setRuleInput,
  handleAddRule,
  handleRemoveRule,
}) => {
  return (
    <div className="space-y-5 animate-slide-up">
      {/* Expected Kenyan Amenities */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Select Available Amenities</label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {PRESET_AMENITIES.map((amenity) => {
            const checked = selectedAmenities.includes(amenity.slug);
            return (
              <button
                type="button"
                key={amenity.slug}
                onClick={() => {
                  if (checked) {
                    setSelectedAmenities(selectedAmenities.filter(s => s !== amenity.slug));
                  } else {
                    setSelectedAmenities([...selectedAmenities, amenity.slug]);
                  }
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  checked
                    ? 'bg-coral-500/10 border-coral-500 text-coral-500'
                    : 'bg-[var(--bg-raised)] border-subtle hover:bg-[var(--bg-raised)]/70 text-[var(--text-secondary)]'
                }`}
              >
                <span className="font-medium">{amenity.label}</span>
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                  checked ? 'bg-coral-500 border-coral-500 text-white' : 'border-subtle'
                }`}>
                  {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules list config */}
      <div className="space-y-2.5 border-t border-subtle pt-4">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Tenant / Building Rules</label>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. No subletting, Rent due on 5th, Quiet hours..."
            value={ruleInput}
            onChange={(e) => setRuleInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddRule();
              }
            }}
            className="flex-1 bg-[var(--bg-raised)] border border-subtle rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-coral-500 focus:border-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
          <button
            type="button"
            onClick={handleAddRule}
            className="px-3.5 py-1.5 bg-[var(--bg-raised)] border border-subtle text-[var(--text-primary)] hover:bg-[var(--bg-raised)]/80 text-xs font-semibold rounded-lg transition-colors"
          >
            Add Rule
          </button>
        </div>

        {/* Rule tags container */}
        {rules.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 p-2.5 border border-subtle rounded-lg bg-[var(--bg-raised)]/50">
            {rules.map((rule, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-panel)] text-[var(--text-primary)] text-xs rounded-md border border-subtle"
              >
                <span>{rule}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRule(index)}
                  className="text-[var(--text-muted)] hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-[var(--text-muted)] italic">No specific rules listed yet. Rules are optional.</p>
        )}
      </div>
    </div>
  );
};
