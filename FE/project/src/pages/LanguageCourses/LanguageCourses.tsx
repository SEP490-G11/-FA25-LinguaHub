import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HeroSection from "./components/sections/hero-section";
import FiltersSection from "./components/sections/filters-section";
import CoursesGrid from "./components/sections/courses-grid";
import Pagination from "./components/sections/pagination";
import api from "@/config/axiosConfig";
import type { Course } from "@/types/Course";

const LanguageCourses = () => {
    const { language } = useParams(); // lấy param từ URL /languages/english

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [categories, setCategories] = useState<string[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
    const coursesPerPage = 8;

    const languageInfo: Record<
        string,
        { name: string; flag: string; image: string }
    > = {
        english: { name: "English", flag: "🇺🇸", image: "https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg" },
        chinese: { name: "Chinese", flag: "🇨🇳", image: "https://images.pexels.com/photos/2412603/pexels-photo-2412603.jpeg" },
        spanish: { name: "Spanish", flag: "🇪🇸", image: "https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg" },
        french: { name: "French", flag: "🇫🇷", image: "https://images.pexels.com/photos/161901/paris-sunset-france-monument-161901.jpeg" },
        japanese: { name: "Japanese", flag: "🇯🇵", image: "https://images.pexels.com/photos/161401/fushimi-inari-taisha-shrine-kyoto-japan-161401.jpeg" },
        korean: { name: "Korean", flag: "🇰🇷", image: "https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg" },
        german: { name: "German", flag: "🇩🇪", image: "https://images.pexels.com/photos/109629/pexels-photo-109629.jpeg" },
        italian: { name: "Italian", flag: "🇮🇹", image: "https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg" },
    };

    const currentLang = languageInfo[language?.toLowerCase() ?? ""];

    /**  Fetch courses từ API */
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const res = await api.get<{ result: Course[] }>("/courses/public/approved");
                setCourses(res.data.result ?? []);
            } catch (err) {
                console.error(" Failed to fetch courses:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    /**  Set category & price range */
    useEffect(() => {
        if (courses.length > 0) {
            setCategories([...new Set(courses.map((c) => c.categoryName))]);

            const max = Math.max(...courses.map((c) => c.price));
            setPriceRange([0, max]); // ✅ để slider kéo lên lại được
        }
    }, [courses]);

    /** ✅ Filter theo Language + Search + Category + Price */
    const filteredCourses = courses.filter((course) => {
        const matchesLanguage = language
            ? course.language?.trim().toLowerCase().includes(language.toLowerCase())
            : true;

        const matchesSearch =
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.tutorName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
            selectedCategory === "All" || course.categoryName === selectedCategory;

        const matchesPrice =
            course.price >= priceRange[0] && course.price <= priceRange[1];

        return matchesLanguage && matchesSearch && matchesCategory && matchesPrice;
    });

    /** ✅ Pagination */
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
    const paginatedCourses = filteredCourses.slice(
        (currentPage - 1) * coursesPerPage,
        currentPage * coursesPerPage
    );

    /** ✅ Không tìm thấy language */
    if (!currentLang) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h2 className="text-2xl font-bold">Language not found</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <HeroSection
                language={currentLang}
                onSearch={(val) => {
                    setSearchTerm(val);
                    setCurrentPage(1);
                    window.scrollTo({ top: 0, behavior: "smooth" }); // ✅ scroll on search
                }}
            />

            <FiltersSection
                selectedCategory={selectedCategory}
                categories={categories}
                courseCount={filteredCourses.length}
                maxPrice={Math.max(...courses.map((c) => c.price), 0)} // ✅ LUÔN LÀ MAX PRICE
                priceRange={priceRange}
                onPriceRangeChange={(range: [number, number]) => {
                    setPriceRange(range);
                    setCurrentPage(1);
                }}
                onCategoryChange={(v) => {
                    setSelectedCategory(v);
                    setCurrentPage(1);
                }}
            />


            <CoursesGrid courses={paginatedCourses} loading={loading} />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: "smooth" }); // ✅ scroll on page change
                }}
            />
        </div>
    );
};

export default LanguageCourses;
