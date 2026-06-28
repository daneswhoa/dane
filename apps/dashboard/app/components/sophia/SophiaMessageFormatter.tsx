import React from 'react';
import { DonutChart, LineChart, DataTable } from './SophiaVisualization';

interface FormattedMessageProps {
  text: string;
}

export function FormattedMessage({ text }: FormattedMessageProps) {
  const regex = /(\[chart-donut:\s*[\s\S]*?\]|\[chart-line:\s*[\s\S]*?\]|\[table:\s*[\s\S]*?\]|\[Attached Image:\s*[\s\S]*?\])/g;
  const splitParts = text.split(regex);

  return (
    <div className="space-y-3">
      {splitParts.map((part, idx) => {
        if (part.startsWith('[chart-donut:')) {
          try {
            const jsonStr = part.replace('[chart-donut:', '').replace(/\]$/, '').trim();
            const data = JSON.parse(jsonStr);
            return <DonutChart key={idx} data={data} />;
          } catch (e) {
            return <p key={idx} className="text-xs text-red-500 font-mono">Failed to parse donut chart.</p>;
          }
        }
        if (part.startsWith('[chart-line:')) {
          try {
            const jsonStr = part.replace('[chart-line:', '').replace(/\]$/, '').trim();
            const data = JSON.parse(jsonStr);
            return <LineChart key={idx} data={data} />;
          } catch (e) {
            return <p key={idx} className="text-xs text-red-500 font-mono">Failed to parse line chart.</p>;
          }
        }
        if (part.startsWith('[table:')) {
          try {
            const jsonStr = part.replace('[table:', '').replace(/\]$/, '').trim();
            const data = JSON.parse(jsonStr);
            return <DataTable key={idx} columns={data.columns} rows={data.rows} />;
          } catch (e) {
            return <p key={idx} className="text-xs text-red-500 font-mono">Failed to parse data table.</p>;
          }
        }
        if (part.startsWith('[Attached Image:')) {
          const url = part.replace('[Attached Image:', '').replace(/\]$/, '').trim();
          return (
            <div key={idx} className="mt-2 rounded-xl overflow-hidden max-w-sm border border-paper-200 dark:border-ink-700 shadow-md transition-all hover:opacity-95">
              <img src={url} alt="User Uploaded Attached" className="max-h-48 w-full object-cover" />
            </div>
          );
        }

        return <FormattedText key={idx} text={part} />;
      })}
    </div>
  );
}

function FormattedText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, idx) => {
        if (line.startsWith('### ')) {
          return <h4 key={idx} className="text-xs font-bold text-coral-500 mt-2">{line.replace('### ', '')}</h4>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={idx} className="text-sm font-bold text-coral-500 mt-3">{line.replace('## ', '')}</h3>;
        }
        if (line.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-2 text-xs">
              <span className="text-coral-500 mt-0.5">•</span>
              <span>{parseInlineMarkdown(line.replace('- ', ''))}</span>
            </div>
          );
        }
        return <p key={idx} className="text-xs leading-relaxed">{parseInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

function parseInlineMarkdown(text: string) {
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const matches = text.split(regex);
  
  return matches.map((match, i) => {
    if (match.startsWith('**') && match.endsWith('**')) {
      return <strong key={i} className="font-bold text-coral-600 dark:text-coral-400">{match.slice(2, -2)}</strong>;
    }
    if (match.startsWith('*') && match.endsWith('*')) {
      return <em key={i} className="italic text-paper-700 dark:text-ink-200">{match.slice(1, -1)}</em>;
    }
    if (match.startsWith('`') && match.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 rounded bg-paper-100 dark:bg-ink-900 font-mono text-[11px] text-pink-500">{match.slice(1, -1)}</code>;
    }
    return match;
  });
}
