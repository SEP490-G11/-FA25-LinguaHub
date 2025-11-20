import { motion } from "framer-motion";
import { Filter, Star } from "lucide-react";

interface FiltersSectionProps {
  languages: string[];
  selectedLanguage: string;

  // ✅ priceRange là kiểu tuple [min, max]
  priceRange: [number, number];

  maxPrice: number;
  selectedRating: number;
  tutorCount: number;

  onLanguageChange: (value: string) => void;

  // ✅ đúng tên hàm callback để update range
  onPriceRangeChange: (range: [number, number]) => void;
  onRatingChange: (rating: number) => void;
}

const FiltersSection = ({
                          languages,
                          selectedLanguage,
                          priceRange,
                          maxPrice,
                          selectedRating,
                          tutorCount,
                          onLanguageChange,
                          onPriceRangeChange,
                          onRatingChange,
                        }: FiltersSectionProps) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
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
            {/* FILTER LABEL */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>

            {/* === TEACHING LANGUAGE SELECT === */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-600">
                Teaching Language:
              </label>
              <select
                  value={selectedLanguage}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {(languages ?? []).map((lang) => (

                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                ))}
              </select>
            </div>

            {/* === PRICE RANGE SLIDER (VND) === */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">
                Price Range (₫)
              </label>

              <div className="flex items-center gap-4 w-[250px]">
                {/* Min slider */}
                <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={priceRange[0]}
                    step={1}
                    onChange={(e) =>
                        onPriceRangeChange([Number(e.target.value), priceRange[1]])
                    }
                    className="w-full accent-indigo-600"
                />

                {/* Max slider */}
                <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={priceRange[1]}
                    step={1}
                    onChange={(e) =>
                        onPriceRangeChange([priceRange[0], Number(e.target.value)])
                    }
                    className="w-full accent-indigo-600"
                />
              </div>

              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>{priceRange[0].toLocaleString("vi-VN")} ₫</span>
                <span>{priceRange[1].toLocaleString("vi-VN")} ₫</span>
              </div>
            </div>

            {/* === RATING FILTER === */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Rating:</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = selectedRating >= star;
                  return (
                      <button
                          key={star}
                          type="button"
                          onClick={() =>
                              onRatingChange(selectedRating === star ? 0 : star)
                          }
                      >
                        <Star
                            className={`w-6 h-6 ${
                                active
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                            }`}
                        />
                      </button>
                  );
                })}
              </div>
            </div>

            {/* === TUTOR COUNT === */}
            <div className="text-sm text-gray-600 font-medium">
              {tutorCount} tutors found
            </div>
          </motion.div>
        </div>
      </section>
  );
};

export default FiltersSection;
