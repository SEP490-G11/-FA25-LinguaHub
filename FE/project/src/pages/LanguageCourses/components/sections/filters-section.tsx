import { Filter, RotateCcw, Star } from "lucide-react";

interface FiltersSectionProps {
    selectedCategory: string;
    categories: string[];
    selectedLevel: string;
    selectedRating: number;
    courseCount: number;
    maxPrice: number;
    priceRange: [number, number];

    onPriceRangeChange: (range: [number, number]) => void;
    onCategoryChange: (value: string) => void;
    onLevelChange: (value: string) => void;
    onRatingChange: (value: number) => void;
    onResetFilters: () => void;
}

const FiltersSection = ({
                            selectedCategory,
                            categories,
                            selectedLevel,
                            selectedRating,
                            courseCount,
                            maxPrice,
                            priceRange,
                            onPriceRangeChange,
                            onCategoryChange,
                            onLevelChange,
                            onRatingChange,
                            onResetFilters,
                        }: FiltersSectionProps) => {
    return (
        <section className="py-6 bg-white border-b">
            <div className="max-w-7xl mx-auto px-8 lg:px-16">

                {/* ========================== */}
                {/* HÀNG 1 — FILTERS + RESET */}
                {/* ========================== */}

                <div
                    className="
                        flex flex-wrap lg:flex-nowrap
                        items-center gap-8
                    "
                >
                    {/* FILTER LABEL */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Filters:</span>
                    </div>

                    {/* CATEGORY */}
                    <div className="flex items-center gap-2 shrink-0">
                        <label className="text-sm font-medium text-gray-600">Category:</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => onCategoryChange(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
                        >
                            <option value="All">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* LEVEL */}
                    <div className="flex items-center gap-2 shrink-0">
                        <label className="text-sm font-medium text-gray-600">Level:</label>

                        <select
                            value={selectedLevel}
                            onChange={(e) => onLevelChange(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
                        >
                            <option value="All">All Levels</option>
                            <option value="BEGINNER">Beginner</option>
                            <option value="INTERMEDIATE">Intermediate</option>
                            <option value="ADVANCED">Advanced</option>
                        </select>
                    </div>

                    {/* ⭐ RATING */}
                    <div className="flex items-center gap-2 shrink-0">
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

                    {/* PRICE RANGE */}
                    <div className="flex flex-col shrink-0">
                        <label className="text-sm font-medium text-gray-600">
                            Price Range (₫)
                        </label>

                        <div className="flex items-center gap-4 w-[260px] mt-1">
                            <input
                                type="range"
                                min={0}
                                max={maxPrice}
                                value={priceRange[0]}
                                onChange={(e) =>
                                    onPriceRangeChange([
                                        Math.min(Number(e.target.value), priceRange[1]),
                                        priceRange[1],
                                    ])
                                }
                                className="w-full accent-blue-500"
                            />

                            <input
                                type="range"
                                min={0}
                                max={maxPrice}
                                value={priceRange[1]}
                                onChange={(e) =>
                                    onPriceRangeChange([
                                        priceRange[0],
                                        Math.max(Number(e.target.value), priceRange[0]),
                                    ])
                                }
                                className="w-full accent-blue-500"
                            />
                        </div>

                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>{priceRange[0].toLocaleString()} ₫</span>
                            <span>{priceRange[1].toLocaleString()} ₫</span>
                        </div>
                    </div>

                    {/* RESET (KHÔNG BAO GIỜ RỚT DÒNG) */}
                    <div className="ml-auto shrink-0">
                        <button
                            onClick={onResetFilters}
                            className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>
                    </div>
                </div>

                {/* ========================== */}
                {/* HÀNG 2 — COURSE COUNT (CENTER) */}
                {/* ========================== */}
                <div className="flex justify-center mt-4">
                    <div className="text-sm text-gray-600 font-medium">
                        {courseCount} courses found
                    </div>
                </div>

            </div>
        </section>
    );
};

export default FiltersSection;
