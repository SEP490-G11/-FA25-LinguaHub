import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const HeroSection = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const handleSearch = () => {
    console.log('Searching for:', searchTerm);
  };

  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-700 py-20">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        <motion.div
          className="text-center text-white"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <h1 className="text-5xl font-bold mb-4">Find Your Perfect Language Tutor</h1>
          <p className="text-xl text-blue-100 mb-10">
            Connect with certified native speakers from around the world
          </p>

          <div className="max-w-3xl mx-auto">
            <div className="flex items-center bg-white rounded-full shadow-xl overflow-hidden">
              <input
                type="text"
                placeholder="Search tutors by name or language..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-6 py-4 text-gray-900 text-base focus:outline-none"
              />
              <button
                onClick={handleSearch}
                className="bg-orange-500 text-white px-10 py-4 hover:bg-orange-600 transition-colors flex items-center justify-center"
              >
                <Search className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
