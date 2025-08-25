type Item = { id: string | number; ip: string };
type Props = {
  items: Item[];
  selected: Set<string | number>;
  onSelect: (id: string | number) => void;
  onToggleSelect: (id: string | number) => void;
};

export default function HistoryList({ items, selected, onSelect, onToggleSelect }: Props) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-gray-500">No history yet. Search for an IP to populate this list.</p>;
  }
 
  return (
    <ul className="divide-y divide-gray-200">
      {items.map((item) => {
        const isChecked = selected.has(item.id);
        return (
          <li key={String(item.id)} className="flex items-center justify-between gap-3 py-2">
            <div className="flex items-center gap-3">
              <input
                id={`sel-${String(item.id)}`}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                checked={isChecked}
                onChange={() => onToggleSelect(item.id)}
              />
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className="text-sm text-indigo-700 hover:underline"
                title="Show geolocation for this IP"
              >
                {item.ip}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
