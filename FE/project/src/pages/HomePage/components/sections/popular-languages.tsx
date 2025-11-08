import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const PopularLanguages = () => {
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

  const languages = [
    {
      name: "English",
      flag: "🇺🇸",
      image:
          "https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      name: "Chinese",
      flag: "🇨🇳",
      image:
          "https://images.pexels.com/photos/2412603/pexels-photo-2412603.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      name: "Spanish",
      flag: "🇪🇸",
      image:
          "https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      name: "French",
      flag: "🇫🇷",
      image:
          "https://images.pexels.com/photos/161901/paris-sunset-france-monument-161901.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      name: "Japanese",
      flag: "🇯🇵",
      image:
          "https://www.annees-de-pelerinage.com/wp-content/uploads/2019/07/senso-ji-temple-tokyo-japan.jpg",
    },
    {
      name: "Korean",
      flag: "🇰🇷",
      image:
          "https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      name: "German",
      flag: "🇩🇪",
      image:
          "https://images.pexels.com/photos/109629/pexels-photo-109629.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      name: "Italian",
      flag: "🇮🇹",
      image:
          "https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
  ];

  return (
      <section className="py-16 bg-white">
        <div className="w-full px-8 lg:px-16">

          {/* Section title */}
          <motion.div
              className="text-center mb-12"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Popular Languages
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore the most popular languages and learn with native tutors
            </p>
          </motion.div>

          {/* Cards grid */}
          <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
          >
            {languages.map((lang, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Link
                      to={`/languages/${lang.name.toLowerCase().replace(/\s+/g, "-")}`}
                      className="group block"
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                      <div className="relative">
                        <img
                            src={lang.image}
                            alt={lang.name}
                            className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>

                        <div className="absolute bottom-0 left-0 right-0 p-3 text-center text-white">
                          <div className="text-2xl mb-1">{lang.flag}</div>
                          <div className="font-bold text-sm">{lang.name}</div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
              className="text-center mt-8"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
          >
            <Link
                to="/languages"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            >
              <span>View all languages</span>
            </Link>
          </motion.div>
        </div>
      </section>
  );
};

export default PopularLanguages;
