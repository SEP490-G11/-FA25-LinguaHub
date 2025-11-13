import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Language {
  name: string;
  flag: string;
  image: string;
  difficulty: string;
  certificates: string[];
  description: string;
  features: string[];
}

interface LanguagesGridProps {
  languages: Language[];
}

const LanguagesGrid = ({ languages }: LanguagesGridProps) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner Friendly":
        return "bg-green-100 text-green-800";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800";
      case "Challenging":
        return "bg-orange-100 text-orange-800";
      case "Very Challenging":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              initial="initial"
              animate="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
          >
            {languages.map((language, index) => (
                <motion.div
                    key={index}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                    variants={fadeInUp}
                >
                  {/* IMAGE + FLAG + NAME */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                        src={language.image}
                        alt={language.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xl shadow-md">
                      {language.flag}
                    </div>

                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-2xl font-bold text-white drop-shadow-sm">
                        {language.name}
                      </h3>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-6 space-y-4">
                <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                        language.difficulty
                    )}`}
                >
                  {language.difficulty}
                </span>

                    <p className="text-gray-600 text-sm">{language.description}</p>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Certifications
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {language.certificates.map((cert, i) => (
                            <span
                                key={i}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                        {cert}
                      </span>
                        ))}
                      </div>
                    </div>

                    <Link
                        to={`/languages/${language.name.toLowerCase()}`}
                        className="block w-full text-center bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
                    >
                      Explore Courses
                    </Link>
                  </div>
                </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
  );
};

export default LanguagesGrid;
