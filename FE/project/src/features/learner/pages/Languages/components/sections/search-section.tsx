import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface SearchSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SearchSection = ({ searchTerm, onSearchChange }: SearchSectionProps) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const handleSearch = () => {
    console.log('Searching for:', searchTerm);
  };

  return (
    <section className="py-8 bg-white border-b">
      <div className="max-w-4xl mx-auto px-8 lg:px-16">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden border border-gray-200">
            <input
              type="text"
              placeholder="Tìm kiếm ngôn ngữ..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-6 py-4 text-base focus:outline-none"
            />
            <Button
              onClick={handleSearch}
              className="h-full px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-none rounded-r-full"
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SearchSection;
