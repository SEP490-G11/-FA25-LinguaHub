import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface FiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CATEGORIES = [
  { id: 'ielts', name: 'IELTS' },
  { id: 'topik', name: 'TOPIK' },
  { id: 'toeic', name: 'TOEIC' },
  { id: 'hsk', name: 'HSK' },
  { id: 'jlpt', name: 'JLPT' },
  { id: 'english-general', name: 'English General' },
  { id: 'business-english', name: 'Business English' },
];

export function Filters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: FiltersProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Input */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-600" />
            Search Courses
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by course name…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="border-blue-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            Filter by Category
          </label>
          <Select value={selectedCategory || 'all'} onValueChange={(value) => onCategoryChange(value === 'all' ? '' : value)}>
            <SelectTrigger className="border-blue-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
