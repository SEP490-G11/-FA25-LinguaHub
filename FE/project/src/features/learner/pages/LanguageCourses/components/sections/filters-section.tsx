import React from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

interface FiltersSectionProps {
  searchTerm: string;
  selectedLevel: string;
  selectedPrice: string;
  courseCount: number;
  onSearchChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onPriceChange: (value: string) => void;
}

const FiltersSection = ({
  searchTerm,
  selectedLevel,
  selectedPrice,
  courseCount,
  onSearchChange,
  onLevelChange,
  onPriceChange
}: FiltersSectionProps) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <section className="py-6 bg-white border-b">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        <motion.div
          className="flex flex-wrap items-center gap-6"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Filters:</span>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-600">Level:</label>
            <select
              value={selectedLevel}
              onChange={(e) => onLevelChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-600">Price:</label>
            <select
              value={selectedPrice}
              onChange={(e) => onPriceChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="All">All Prices</option>
              <option value="Under 600K">Under 600K</option>
              <option value="600K-750K">600K - 750K</option>
              <option value="Above 750K">Above 750K</option>
            </select>
          </div>

          <div className="text-sm text-gray-600 font-medium">
            {courseCount} courses found
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FiltersSection;
