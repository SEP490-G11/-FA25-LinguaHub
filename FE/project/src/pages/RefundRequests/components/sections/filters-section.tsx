import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FiltersSectionProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FiltersSection = ({ activeFilter, onFilterChange }: FiltersSectionProps) => {
  const filters = [
    { value: 'all', label: 'All Requests' },
    { value: 'pending', label: 'Pending' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'processed', label: 'Processed' },
    { value: 'rejected', label: 'Rejected' }
  ];

  return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <Filter className="w-5 h-5 text-green-600" />
            <span>Filter by status:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
                <Button
                    key={filter.value}
                    onClick={() => onFilterChange(filter.value)}
                    variant={activeFilter === filter.value ? 'default' : 'outline'}
                    className={activeFilter === filter.value ? 'bg-green-600 hover:bg-green-700' : ''}
                    size="sm"
                >
                  {filter.label}
                </Button>
            ))}
          </div>
        </div>
      </div>
  );
};

export default FiltersSection;
