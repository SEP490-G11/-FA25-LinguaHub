import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface FiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

export function Filters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: FiltersProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Input */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-600" />
            Search Applications
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by name or language…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="border-blue-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            Filter by Status
          </label>
          <Select value={statusFilter || 'all'} onValueChange={(value) => onStatusChange(value === 'all' ? '' : value)}>
            <SelectTrigger className="border-blue-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
