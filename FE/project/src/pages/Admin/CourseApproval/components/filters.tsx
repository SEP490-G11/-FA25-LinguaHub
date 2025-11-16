import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import axios from '@/config/axiosConfig';

interface FiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

export function Filters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: FiltersProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 [Filters] Fetching categories...');
        const response = await axios.get('/categories');
        console.log('📊 [Filters] Response:', response?.data);
        
        // Try different response formats
        let rawData = [];
        if (response?.data?.result) {
          rawData = response.data.result;
        } else if (Array.isArray(response?.data)) {
          rawData = response.data;
        } else if (response?.data?.data) {
          rawData = response.data.data;
        }
        
        // Map backend format (categoryId, categoryName) to frontend format (id, name)
        const categoriesData = rawData.map((cat: any) => ({
          id: cat.categoryId || cat.id,
          name: cat.categoryName || cat.name,
        }));
        
        console.log('✅ [Filters] Categories:', categoriesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('❌ [Filters] Error fetching categories:', error);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="flex gap-3">
      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="search"
            type="text"
            placeholder="Tìm theo tên khóa học hoặc giảng viên..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="w-48">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {isLoading ? (
              <SelectItem value="loading" disabled>
                Loading...
              </SelectItem>
            ) : (
              categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
