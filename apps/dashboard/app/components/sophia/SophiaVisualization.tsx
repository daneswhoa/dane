import React from 'react';

// Chart Components
export interface DonutData {
  label: string;
  value: number;
  color?: string;
}

export function DonutChart({ data }: { data: DonutData[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let accumulatedPercent = 0;
  const colors = ['#FF5A5F', '#3182CE', '#38A169', '#ECC94B', '#805AD5'];

  return (
    <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-3 flex items-center gap-4 my-2 max-w-sm">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#E2E8F0" strokeWidth="3" />
          {data.map((item, idx) => {
            const percent = total > 0 ? (item.value / total) * 100 : 0;
            const strokeDash = `${percent} ${100 - percent}`;
            const strokeOffset = 100 - accumulatedPercent;
            accumulatedPercent += percent;
            const color = item.color || colors[idx % colors.length];

            return (
              <circle
                key={idx}
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke={color}
                strokeWidth="3.5"
                strokeDasharray={strokeDash}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
      </div>
      <div className="flex-1 space-y-0.5">
        {data.map((item, idx) => {
          const color = item.color || colors[idx % colors.length];
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
          return (
            <div key={idx} className="flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center gap-1 truncate">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-paper-700 dark:text-ink-200 truncate">{item.label}</span>
              </div>
              <span className="font-semibold text-paper-900 dark:text-white">{item.value} ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface LineData {
  label: string;
  value: number;
}

export function LineChart({ data }: { data: LineData[] }) {
  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.value), 10);
  const minVal = Math.min(...data.map(d => d.value), 0);
  const range = maxVal - minVal || 10;

  const width = 240;
  const height = 80;
  const padding = 12;

  const points = data.map((d, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.value - minVal) / range) * (height - padding * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <div className="bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl p-3 my-2 max-w-sm">
      <div className="relative w-full h-20">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2 2" />

          <path d={pathD} fill="none" stroke="#FF5A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="2.5"
              fill="#FFFFFF"
              stroke="#FF5A5F"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </div>
      <div className="flex justify-between mt-1 text-[9px] text-paper-400 font-mono">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export function DataTable({ columns, rows }: { columns: string[]; rows: any[][] }) {
  return (
    <div className="overflow-x-auto border border-paper-200 dark:border-ink-750 rounded-xl my-2 shadow-sm max-w-lg">
      <table className="min-w-full divide-y divide-paper-200 dark:divide-ink-750 text-left text-xs">
        <thead className="bg-paper-50 dark:bg-ink-850">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-paper-500 dark:text-ink-400">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-paper-100 dark:divide-ink-800 bg-white dark:bg-ink-800">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-paper-50 dark:hover:bg-ink-750/50">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-1.5 text-paper-750 dark:text-ink-200 font-mono text-[10px]">
                  {String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SophiaVisualization({ visualizationData }: { visualizationData: any }) {
  const [activeTab, setActiveTab] = React.useState(0);
  const sheets = visualizationData?.sheets || [];

  if (sheets.length === 0) {
    return (
      <div className="p-3 bg-paper-50 dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl text-center">
        <p className="text-[10px] text-paper-400 italic">No spreadsheet data loaded.</p>
      </div>
    );
  }

  const activeSheet = sheets[activeTab];

  return (
    <div className="mt-4 bg-white dark:bg-ink-900 border border-paper-200 dark:border-ink-800 rounded-xl p-3.5 shadow-sm space-y-3 max-w-lg">
      <div className="flex items-center gap-1.5 pb-2 border-b border-paper-100 dark:border-ink-800">
        <span className="w-2.5 h-2.5 rounded-full bg-coral-500 animate-pulse" />
        <span className="text-xs font-bold text-paper-900 dark:text-white uppercase tracking-wider font-mono">Spreadsheet Visualizer</span>
      </div>

      {sheets.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {sheets.map((sheet: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-2 py-1 text-[10px] font-bold rounded transition-all whitespace-nowrap ${
                activeTab === idx
                  ? 'bg-coral-500 text-white shadow-sm'
                  : 'bg-paper-100 dark:bg-ink-800 text-paper-655 dark:text-ink-300 hover:bg-paper-200 dark:hover:bg-ink-750'
              }`}
            >
              {sheet.name}
            </button>
          ))}
        </div>
      )}

      {activeSheet && (
        <div className="space-y-3">
          {activeSheet.summary && (
            <div className="text-[10px] leading-relaxed text-paper-600 dark:text-ink-300 bg-paper-50 dark:bg-ink-950 p-2 rounded-lg border border-paper-100 dark:border-ink-850">
              <span className="font-semibold text-paper-800 dark:text-white">Sheet Summary: </span>
              {activeSheet.summary}
            </div>
          )}

          <div className="overflow-x-auto">
            <DataTable columns={activeSheet.columns || []} rows={activeSheet.rows || []} />
          </div>
        </div>
      )}
    </div>
  );
}
