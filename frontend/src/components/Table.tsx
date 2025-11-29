/* eslint-disable */

export default function Table({
  data,
  selected,
  toggle,
}: {
  data: any[];
  selected: string[];
  toggle: (id: string) => void;
}) {
  return (
    <table className="min-w-full border dark:border-slate-700">
      <thead className="bg-gray-100 dark:bg-slate-700">
        <tr>
          <th className="p-3">#</th>
          <th className="p-3 text-left">Name</th>
          <th className="p-3 text-left">Description</th>
          <th className="p-3 text-left">Created</th>
        </tr>
      </thead>

      <tbody>
        {data.map((row: any) => (
          <tr
            key={row.id}
            className="border-t dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            <td className="p-3">
              <input
                type="checkbox"
                checked={selected.includes(row.id)}
                onChange={() => toggle(row.id)}
              />
            </td>
            <td className="p-3">{row.name}</td>
            <td className="p-3">{row.description}</td>
            <td className="p-3">
              {new Date(row.created_at).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
