import React from 'react';
import { Card } from '@/components/ui/card';
import { Tick } from '@/types/tick';

// Helper to convert snake_case to Title Case
function toTitleCase(str: string) {
  return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// Helper to format date strings in UTC
function formatDateValue(value: any): string {
  if (typeof value !== 'string') return String(value);
  
  // Check if it looks like an ISO date string
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('en-US', {
          timeZone: 'UTC',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
    } catch (e) {
      // If parsing fails, return original value
    }
  }
  
  return value;
}

interface TickStateViewProps {
  tick: Tick | null;
}

const renderTable = (data: any[], section: string) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-center py-6">No {section.toLowerCase()} data</div>;
  }
  // Collect all unique keys from all rows to ensure all *_ready_at columns are included
  const headersSet = new Set<string>();
  data.forEach(row => Object.keys(row).forEach(key => headersSet.add(key)));
  const headers = Array.from(headersSet);
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-primary-brand bg-white">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 z-10 bg-primary-brand text-white font-bold">
          <tr>
            {headers.map((key) => (
              <th key={key} className="px-3 py-2 text-left font-bold whitespace-nowrap">
                {toTitleCase(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={
                'transition-colors ' +
                (i % 2 === 0 ? 'bg-primary-brand/5' : 'bg-white') +
                ' hover:bg-primary-brand/10'
              }
            >
              {headers.map((key, j) => (
                <td
                  key={j}
                  className={
                    'px-3 py-2' +
                    (typeof row[key] === 'number' && /id|time/i.test(key)
                      ? ' font-mono text-xs'
                      : '')
                  }
                >
                  {row[key] !== undefined ? formatDateValue(row[key]) : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TickStateView: React.FC<TickStateViewProps> = ({ tick }) => {
  if (!tick) {
    return <Card className="p-6 text-center">No tick state loaded.</Card>;
  }
  return (
    <div className="p-4 space-y-8">
      <Card className="p-6 bg-primary-brand/5 border border-primary-brand rounded-xl shadow">
        <h3 className="text-lg font-bold mb-4 text-primary-brand">Order State</h3>
        {renderTable(tick.order_state, 'Order State')}
      </Card>
      <Card className="p-6 bg-primary-brand/5 border border-primary-brand rounded-xl shadow">
        <h3 className="text-lg font-bold mb-4 text-primary-brand">Driver State</h3>
        {renderTable(tick.driver_state, 'Driver State')}
      </Card>
    </div>
  );
};

export default TickStateView; 