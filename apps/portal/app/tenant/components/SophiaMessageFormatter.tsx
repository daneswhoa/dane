import React from 'react';
import { Building2, MapPin, Users, CheckCircle2, Hourglass, Home } from 'lucide-react';

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

        const blocks = parseMessageContent(part);
        return (
          <React.Fragment key={idx}>
            {blocks.map((block, bIdx) => {
              if (block.type === 'table') {
                return <CustomTableRenderer key={bIdx} headers={block.headers} rows={block.rows} />;
              }
              return <FormattedText key={bIdx} lines={block.lines} />;
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function parseMessageContent(text: string) {
  const lines = text.split('\n');
  const blocks: ({ type: 'text'; lines: string[] } | { type: 'table'; headers: string[]; rows: string[][] })[] = [];
  
  let currentTextLines: string[] = [];
  let currentTableLines: string[] = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const isTableLine = trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 1;

    if (isTableLine) {
      if (!inTable) {
        if (currentTextLines.length > 0) {
          blocks.push({ type: 'text', lines: currentTextLines });
          currentTextLines = [];
        }
        inTable = true;
      }
      currentTableLines.push(line);
    } else {
      if (inTable) {
        const tableBlock = parseMarkdownTable(currentTableLines);
        if (tableBlock) {
          blocks.push(tableBlock);
        } else {
          currentTextLines.push(...currentTableLines);
        }
        currentTableLines = [];
        inTable = false;
      }
      currentTextLines.push(line);
    }
  }

  if (inTable && currentTableLines.length > 0) {
    const tableBlock = parseMarkdownTable(currentTableLines);
    if (tableBlock) {
      blocks.push(tableBlock);
    } else {
      currentTextLines.push(...currentTableLines);
    }
  }
  if (currentTextLines.length > 0) {
    blocks.push({ type: 'text', lines: currentTextLines });
  }

  return blocks;
}

function parseMarkdownTable(lines: string[]): { type: 'table'; headers: string[]; rows: string[][] } | null {
  if (lines.length < 2) return null;

  const parseRow = (rowLine: string) => {
    const rawParts = rowLine.split('|').map(s => s.trim());
    if (rawParts[0] === '') rawParts.shift();
    if (rawParts[rawParts.length - 1] === '') rawParts.pop();
    return rawParts;
  };

  const headers = parseRow(lines[0]);
  const rows: string[][] = [];

  for (let i = 2; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    if (row.length > 0 && !row.every(cell => cell.startsWith('---') || cell.startsWith('-'))) {
      rows.push(row);
    }
  }

  return { type: 'table', headers, rows };
}

function CustomTableRenderer({ headers, rows }: { headers: string[]; rows: string[][] }) {
  const isPropertyOrUnitTable = headers.some(h => {
    const lh = h.toLowerCase();
    return lh.includes('property') || lh.includes('unit') || lh.includes('building');
  });

  if (isPropertyOrUnitTable) {
    return <PropertyUnitCardList headers={headers} rows={rows} />;
  }

  return <CleanDataTable headers={headers} rows={rows} />;
}

function PropertyUnitCardList({ headers, rows }: { headers: string[]; rows: string[][] }) {
  const propColIdx = headers.findIndex(h => {
    const lh = h.toLowerCase();
    return lh.includes('property') || lh.includes('building') || lh.includes('unit') && !lh.includes('status');
  });
  
  const statusColIdx = headers.findIndex(h => h.toLowerCase().includes('status'));
  const unitsColIdx = headers.findIndex(h => {
    const lh = h.toLowerCase();
    return lh.includes('unit') && lh !== headers[propColIdx]?.toLowerCase();
  });

  const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

  return (
    <div className="space-y-2.5 my-3">
      {rows.map((row, idx) => {
        const propCell = propColIdx !== -1 ? row[propColIdx] || '' : row[0] || '';
        const statusCell = statusColIdx !== -1 ? row[statusColIdx] || '' : '';
        const unitsCell = unitsColIdx !== -1 ? row[unitsColIdx] || '' : '';

        const emojiMatch = propCell.match(emojiRegex);
        const iconEmoji = emojiMatch ? emojiMatch[0] : null;
        let cleanName = propCell.replace(emojiRegex, '').trim();

        const parenMatch = cleanName.match(/\(([^)]+)\)/);
        const location = parenMatch ? parenMatch[1] : null;
        cleanName = cleanName.replace(/\(([^)]+)\)/, '').trim();

        let statusText = statusCell;
        let statusColor = 'gray';
        
        const cleanStatus = statusCell.toLowerCase();
        if (cleanStatus.includes('active') || cleanStatus.includes('succeed') || cleanStatus.includes('✅') || cleanStatus.includes('occupied')) {
          statusText = statusCell.replace(/✅/g, '').trim();
          statusColor = 'green';
        } else if (cleanStatus.includes('pending') || cleanStatus.includes('⏳') || cleanStatus.includes('waiting') || cleanStatus.includes('hold')) {
          statusText = statusCell.replace(/⏳/g, '').trim();
          statusColor = 'amber';
        } else if (cleanStatus.includes('fail') || cleanStatus.includes('error') || cleanStatus.includes('❌') || cleanStatus.includes('arrear')) {
          statusText = statusCell.replace(/❌/g, '').trim();
          statusColor = 'red';
        }

        let unitsText = unitsCell;
        let occupancyText = '';
        
        if (unitsCell) {
          const unitsParenMatch = unitsCell.match(/\(([^)]+)\)/);
          if (unitsParenMatch) {
            occupancyText = unitsParenMatch[1];
            unitsText = unitsCell.replace(/\(([^)]+)\)/, '').trim();
          }
        }

        return (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white/40 dark:bg-ink-900/40 border border-paper-200 dark:border-ink-800 rounded-xl gap-3 shadow-sm hover:border-coral-500/25 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-coral-500/5 border border-coral-500/10 flex items-center justify-center flex-shrink-0 text-base">
                {iconEmoji || <Building2 className="w-4 h-4 text-coral-500" />}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-paper-900 dark:text-white leading-tight">
                    {cleanName}
                  </span>
                  {statusCell && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      statusColor === 'green'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : statusColor === 'amber'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : statusColor === 'red'
                            ? 'bg-red-500/10 text-red-650'
                            : 'bg-paper-100 dark:bg-ink-800 text-paper-600 dark:text-ink-400'
                    }`}>
                      {statusText}
                    </span>
                  )}
                </div>
                {location && (
                  <div className="flex items-center gap-1 text-[10px] text-paper-400 dark:text-ink-500 mt-0.5 font-semibold">
                    <MapPin className="w-3 h-3 text-paper-400 dark:text-ink-500" />
                    <span>{location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3.5 border-t sm:border-t-0 border-paper-200/50 dark:border-ink-850 pt-2 sm:pt-0">
              {unitsText && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-paper-600 dark:text-ink-300">
                  <Home className="w-3.5 h-3.5 text-paper-400 dark:text-ink-500" />
                  <span>{unitsText}</span>
                </div>
              )}
              {occupancyText && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-medium text-paper-500 dark:text-ink-400">
                  <Users className="w-3.5 h-3.5 text-paper-400 dark:text-ink-500" />
                  <span className="capitalize">{occupancyText}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CleanDataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-3 overflow-hidden border border-paper-200 dark:border-ink-800 rounded-xl shadow-sm max-w-full">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-paper-200 dark:divide-ink-800 text-[11px] font-mono">
          <thead className="bg-paper-50 dark:bg-ink-950 font-bold text-paper-700 dark:text-ink-350">
            <tr>
              {headers.map((col, idx) => (
                <th key={idx} className="px-3 py-2 text-left uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-150 dark:divide-ink-850 bg-white/40 dark:bg-ink-900/40 text-paper-900 dark:text-ink-100">
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

function FormattedText({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-1 text-xs md:text-sm leading-relaxed">
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
  const regex = /(\**.*?\*\*|\*.*?\*|`.*?`)/g;
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
