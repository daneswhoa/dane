import React from 'react';

interface FormattedMessageProps {
  text: string;
}

export function FormattedMessage({ text }: FormattedMessageProps) {
  // Support basic markdown tables and text blocks
  const regex = /(\[table:\s*[\s\S]*?\]|\[Attached Image:\s*[\s\S]*?\])/g;
  const splitParts = text.split(regex);

  return (
    <div className="space-y-3">
      {splitParts.map((part, idx) => {
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
            <div key={idx} className="mt-2 rounded-xl overflow-hidden max-w-sm border border-paper-200 dark:border-ink-700 shadow-md transition-all hover:opacity-95 animate-fade-in">
              <img src={url} alt="Attached" className="max-h-48 w-full object-cover" />
            </div>
          );
        }

        return <FormattedText key={idx} text={part} />;
      })}
    </div>
  );
}

function DataTable({ columns, rows }: { columns: string[]; rows: any[][] }) {
  return (
    <div className="my-3 overflow-hidden border border-paper-200 dark:border-ink-800 rounded-lg shadow-sm max-w-full">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-paper-200 dark:divide-ink-800 text-xs">
          <thead className="bg-paper-50 dark:bg-ink-950 font-bold text-paper-700 dark:text-ink-300">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-3 py-2 text-left uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-200 dark:divide-ink-800 bg-white dark:bg-ink-900 text-paper-900 dark:text-ink-100">
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-paper-50/50 dark:hover:bg-ink-950/25 transition-colors">
                {row.map((val, cellIdx) => (
                  <td key={cellIdx} className="px-3 py-2 whitespace-nowrap">
                    {String(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FormattedText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1 text-xs md:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        if (line.startsWith('### ')) {
          return <h4 key={idx} className="text-xs md:text-sm font-bold text-coral-500 mt-3 mb-1 uppercase tracking-wider">{line.replace('### ', '')}</h4>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={idx} className="text-sm md:text-base font-bold text-coral-500 mt-4 mb-1.5 uppercase tracking-wide">{line.replace('## ', '')}</h3>;
        }
        if (line.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-3 py-0.5">
              <span className="text-coral-500 mt-1.5 text-[8px] select-none">•</span>
              <span className="flex-1">{parseInlineMarkdown(line.replace('- ', ''))}</span>
            </div>
          );
        }
        if (line.trim() === '') {
          return <div key={idx} className="h-2"></div>;
        }
        return <p key={idx} className="py-0.5">{parseInlineMarkdown(line)}</p>;
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
      return <code key={i} className="px-1.5 py-0.5 rounded bg-paper-100 dark:bg-ink-950 font-mono text-xs text-pink-500">{match.slice(1, -1)}</code>;
    }
    return match;
  });
}
