import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HeroSection from "./components/sections/hero-section";
import FiltersSection from "./components/sections/filters-section";
import CoursesGrid from "./components/sections/courses-grid";
import Pagination from "@/pages/LanguageCourses/components/sections/pagination";
import type { Course } from "@/types/Course.ts";
import { useDispatch, useSelector } from "react-redux";
import { fetchApprovedCourses } from "@/redux/slices/homeSlide";
import { RootState, AppDispatch } from "@/redux/store";

const LanguageCourses = () => {
  const { language } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { courses, loading } = useSelector((state: RootState) => state.home);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([]); //  mảng categories động từ API
  //  Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 8;
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);
  //  Language info
  const languageInfo: { [key: string]: { name: string; flag: string; image: string } } = {
    english: { name: "English", flag: "🇺🇸", image: "https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg?auto=compress&cs=tinysrgb&w=1200" },
    chinese: { name: "Chinese", flag: "🇨🇳", image: "https://images.pexels.com/photos/2412603/pexels-photo-2412603.jpeg?auto=compress&cs=tinysrgb&w=1200" },
    spanish: { name: "Spanish", flag: "🇪🇸", image: "https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg?auto=compress&cs=tinysrgb&w=1200" },
    french: { name: "French", flag: "🇫🇷", image: "https://images.pexels.com/photos/161901/paris-sunset-france-monument-161901.jpeg?auto=compress&cs=tinysrgb&w=1200" },
    japanese: { name: "Japanese", flag: "🇯🇵", image: "https://images.pexels.com/photos/161401/fushimi-inari-taisha-shrine-kyoto-japan-161401.jpeg?auto=compress&cs=tinysrgb&w=1200" },
    korean: { name: "Korean", flag: "🇰🇷", image: "https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=1200" },
    german: { name: "German", flag: "🇩🇪", image: "https://images.pexels.com/photos/109629/pexels-photo-109629.jpeg?auto=compress&cs=tinysrgb&w=1200" },
    italian: { name: "Italian", flag: "🇮🇹", image: "https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=1200" },
  };

  const currentLang = languageInfo[language?.toLowerCase() || ""];
  //  Fetch courses
  useEffect(() => {
    dispatch(fetchApprovedCourses());
  }, [dispatch]);

  //  Extract category list dynamically from API
  useEffect(() => {
    if (courses.length > 0) {
      setCategories([...new Set(courses.map((c: Course) => c.categoryName))]);
    }
  }, [courses]);

  //  Max price slider
  const maxPrice = Math.max(...courses.map((c) => c.price), 0);
  const [priceRange, setPriceRange] = useState([0, maxPrice]);

  //  Filter logic chính
  const filteredCourses = courses.filter((course: Course) => {
    const matchesLanguage =
        !currentLang || course.language.toLowerCase() === currentLang.name.toLowerCase();

    const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tutorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
        selectedCategory === "All" || course.categoryName === selectedCategory;

    const matchesPrice =
        course.price >= priceRange[0] && course.price <= priceRange[1];

    return matchesLanguage && matchesSearch && matchesCategory && matchesPrice;
  });

  //  Apply pagination
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const paginatedCourses = filteredCourses.slice(
      (currentPage - 1) * coursesPerPage,
      currentPage * coursesPerPage
  );

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
            }}
        />

        {/* Filters section: NOW USING category */}
        <FiltersSection
            selectedCategory={selectedCategory}
            categories={categories}
            courseCount={filteredCourses.length}
            maxPrice={maxPrice}
            priceRange={priceRange}
            onPriceRangeChange={(range) => {
              setPriceRange(range);
              setCurrentPage(1);
            }}
            onCategoryChange={(v) => {
              setSelectedCategory(v);
              setCurrentPage(1);
            }}
        />

        <CoursesGrid courses={paginatedCourses} loading={loading} />

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
  );
};

export default LanguageCourses;
