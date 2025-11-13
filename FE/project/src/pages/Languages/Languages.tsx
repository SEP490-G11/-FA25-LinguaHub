import React from "react";
import HeroSection from "./components/sections/hero-section";
import LanguagesGrid from "./components/sections/languages-grid";
import Pagination from "./components/sections/pagination";
import CTASection from "./components/sections/cta-section";

const Languages = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  const itemsPerPage = 8;

  const languages = [
    {
      name: "English",
      flag: "🇺🇸",
      image: "https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg?auto=compress&cs=tinysrgb&w=800",
      difficulty: "Beginner Friendly",
      certificates: ["IELTS", "TOEFL", "Cambridge"],
      description: "Master the global language for work, travel, and communication.",
      features: ["Conversation", "Writing", "Exam Prep", "Business English"],
    },
    {
      name: "French",
      flag: "🇫🇷",
      image: "https://images.pexels.com/photos/161901/paris-sunset-france-monument-161901.jpeg?auto=compress&cs=tinysrgb&w=800",
      difficulty: "Moderate",
      certificates: ["DELF", "DALF", "TCF"],
      description: "Discover the language of love, diplomacy, and culture.",
      features: ["French Culture", "Business French", "Literature", "Pronunciation"],
    },
    {
      name: "Spanish",
      flag: "🇪🇸",
      image: "https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg?auto=compress&cs=tinysrgb&w=800",
      difficulty: "Easy",
      certificates: ["DELE", "SIELE"],
      description: "Speak one of the most widely spoken languages worldwide.",
      features: ["Latin Accent", "Conversation", "Business Spanish", "Culture"],
    },
    {
      name: "German",
      flag: "🇩🇪",
      image: "https://images.pexels.com/photos/109629/pexels-photo-109629.jpeg?auto=compress&cs=tinysrgb&w=800",
      difficulty: "Challenging",
      certificates: ["TestDaF", "DSH", "Goethe"],
      description: "Language of engineering, innovation, and research.",
      features: ["Business German", "Grammar Focus", "Technical Vocabulary", "Culture"],
    },
    {
      name: "Japanese",
      flag: "🇯🇵",
      image: "https://www.annees-de-pelerinage.com/wp-content/uploads/2019/07/senso-ji-temple-tokyo-japan.jpg",
      difficulty: "Very Challenging",
      certificates: ["JLPT"],
      description: "Explore Japan through language and culture.",
      features: ["Hiragana/Katakana", "Kanji", "Anime Culture", "Politeness Levels"],
    },
    {
      name: "Chinese (Mandarin)",
      flag: "🇨🇳",
      image: "https://images.pexels.com/photos/2412603/pexels-photo-2412603.jpeg?auto=compress&cs=tinysrgb&w=800",
      difficulty: "Very Challenging",
      certificates: ["HSK", "HSKK"],
      description: "Master the most spoken language in the world.",
      features: ["Character Writing", "Pinyin", "Speaking Practice", "Culture"],
    },
    {
      name: "Korean",
      flag: "🇰🇷",
      image: "https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=800",
      difficulty: "Challenging",
      certificates: ["TOPIK"],
      description: "Learn Korean and explore K-pop & K-drama.",
      features: ["Hangul Writing", "Conversation", "K-pop Culture", "Business Korean"],
    },
    {
      name: "Italian",
      flag: "🇮🇹",
      image: "https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=800",
      difficulty: "Moderate",
      certificates: ["CILS", "CELI"],
      description: "Learn the language of art, cuisine, and music.",
      features: ["Culture", "Art History", "Food Terms", "Conversation"],
    },
    {
      name: "Portuguese",
      flag: "🇵🇹",
      image: "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=800",
      difficulty: "Easy",
      certificates: ["CAPLE"],
      description: "Language spoken across Portugal and Brazil.",
      features: ["Brazil Accent", "Conversation", "Travel Vocabulary", "Culture"],
    },
    {
      name: "Arabic",
      flag: "🇸🇦",
      image: "https://images.pexels.com/photos/460376/pexels-photo-460376.jpeg?auto=compress&cs=tinysrgb&w=800",
      difficulty: "Very Challenging",
      certificates: [],
      description: "One of the world's oldest and richest languages.",
      features: ["Alphabet", "Pronunciation", "Culture", "Conversation"],
    },
    {
      name: "Thai",
      flag: "🇹🇭",
      image: "https://images.pexels.com/photos/2306291/pexels-photo-2306291.jpeg?auto=compress&cs=tinysrgb&w=800",
      difficulty: "Moderate",
      certificates: [],
      description: "Learn Thai and connect with its unique culture.",
      features: ["Tone Practice", "Conversation", "Travel Vocabulary", "Culture"],
    },
    {
      name: "Vietnamese",
      flag: "🇻🇳",
      image: "https://images.pexels.com/photos/460376/pexels-photo-460376.jpeg?auto=compress&cs=tinysrgb&w=800",
      difficulty: "Moderate",
      certificates: [],
      description: "Vietnamese language learning for foreigners.",
      features: ["Pronunciation", "Tone system", "Daily Conversation", "Culture"],
    },
  ];

  /**  Filter chỉ khi Search / Enter */
  const filteredLanguages = searchTerm.trim()
      ? languages.filter((lang) =>
          lang.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      : languages;

  /**  Pagination */
  const totalPages = Math.ceil(filteredLanguages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLanguages = filteredLanguages.slice(startIndex, startIndex + itemsPerPage);

  /**  Reset về page 1 khi search */
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  /**  Tự scroll về đầu trang khi đổi trang */
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
      <div className="min-h-screen bg-gray-50">
        <HeroSection setSearchTerm={setSearchTerm} />
        <LanguagesGrid languages={paginatedLanguages} />
        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
        />
        <CTASection />
      </div>
  );
};

export default Languages;
