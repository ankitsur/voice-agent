// src/components/Table.tsx
import type { AgentConfig } from "../types";

interface TableProps {
  data: AgentConfig[];
  selected: string[];
  toggle: (id: string) => void;
}

export default function Table({ data, selected, toggle }: TableProps) {
  if (data.length === 0) {
    return (
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 text-center">
        <p className="text-gray-600 dark:text-slate-400">No configurations found.</p>
      </div>
    );
  }

  return (
    <table className="min-w-full border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
      <thead className="bg-gray-100 dark:bg-slate-700">
        <tr>
          <th className="p-3 w-12">#</th>
          <th className="p-3 text-left text-gray-700 dark:text-slate-200">Name</th>
          <th className="p-3 text-left text-gray-700 dark:text-slate-200">Description</th>
          <th className="p-3 text-left text-gray-700 dark:text-slate-200">Created</th>
        </tr>
      </thead>

      <tbody>
        {data.map((row) => (
          <tr
            key={row.id}
            className="border-t dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            onClick={() => toggle(row.id)}
          >
            <td className="p-3 text-center">
              <input
                type="checkbox"
                checked={selected.includes(row.id)}
                onChange={() => toggle(row.id)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 cursor-pointer"
              />
            </td>
            <td className="p-3 text-gray-900 dark:text-white font-medium">
              {row.name}
            </td>
            <td className="p-3 text-gray-600 dark:text-slate-400">
              {row.description || "—"}
            </td>
            <td className="p-3 text-gray-600 dark:text-slate-400">
              {row.created_at ? new Date(row.created_at).toLocaleString() : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
