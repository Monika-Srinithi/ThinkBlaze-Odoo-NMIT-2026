import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
}

export function Table<T>({ columns, data, loading }: TableProps<T>) {
  if (loading) {
    return <div className="text-center p-8 text-slate-400">Loading...</div>;
  }

  if (data.length === 0) {
    return <div className="text-center p-8 text-slate-400">No records found.</div>;
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 border-b border-white/10">
            {columns.map((col, idx) => (
              <th key={idx} className="p-4 text-sm font-semibold text-slate-300">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              {columns.map((col, cidx) => (
                <td key={cidx} className="p-4 text-sm text-slate-300">
                  {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
