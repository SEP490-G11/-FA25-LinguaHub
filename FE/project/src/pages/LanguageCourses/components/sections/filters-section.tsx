import { motion } from "framer-motion";
import { Filter } from "lucide-react";

interface FiltersSectionProps {
    selectedCategory: string;
    categories: string[];
    courseCount: number;
    maxPrice: number;
    priceRange: [number, number];
    onPriceRangeChange: (range: [number, number]) => void;

    onCategoryChange: (value: string) => void;
}

const FiltersSection = ({
                            selectedCategory,
                            categories,
                            courseCount,
                            maxPrice,
                            priceRange,
                            onPriceRangeChange,
                            onCategoryChange,
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
                    {/* CATEGORY SELECT */}
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-600">Category:</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => onCategoryChange(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="All">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* PRICE RANGE SLIDER */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-600">Price Range (₫)</label>
                        <div className="flex items-center gap-4 w-[250px]">
                            {/* Min slider */}
                            <input
                                type="range"
                                min={0}
                                max={Number(maxPrice)}
                                value={priceRange[0]}
                                step={1}
                                onChange={(e) => {
                                    const newMin = Number(e.target.value);

                                    // đảm bảo min <= max
                                    onPriceRangeChange([
                                        Math.min(newMin, priceRange[1]),
                                        priceRange[1],
                                    ]);
                                }}
                                className="w-full accent-orange-500"
                            />

                            {/* Max slider */}
                            <input
                                type="range"
                                min={0}
                                max={Number(maxPrice)}
                                value={priceRange[1]}
                                step={1}
                                onChange={(e) => {
                                    const newMax = Number(e.target.value);
                                    onPriceRangeChange([
                                        priceRange[0],
                                        Math.max(newMax, priceRange[0]),
                                    ]);
                                }}
                                className="w-full accent-orange-500"
                            />
                        </div>

                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>{priceRange[0].toLocaleString()} ₫</span>
                            <span>{priceRange[1].toLocaleString()} ₫</span>
                        </div>
                    </div>
                    {/* COURSE COUNT */}
                    <div className="text-sm text-gray-600 font-medium">{courseCount} courses found</div>
                </motion.div>
            </div>
        </section>
    );
};

export default FiltersSection;
