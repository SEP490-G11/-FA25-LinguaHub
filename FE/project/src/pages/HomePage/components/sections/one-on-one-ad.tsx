import { motion } from "framer-motion";
import { Video, Clock, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {Link} from "react-router-dom";
import { ROUTES } from '@/constants/routes.ts';
const OneOnOneAd = () => {
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

  return (
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="w-full px-8 lg:px-16">
          {/* Title + Subtitle */}
          <motion.div
              className="text-center mb-16"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
          >
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Video className="w-4 h-4" />
              <span>1-on-1 Private Learning</span>
            </div>

            <h2 className="text-4xl font-bold mb-4">
              Learn Any Language 1-on-1 with a Native Tutor
            </h2>

            <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
              English • Japanese • Korean • Chinese • French • Vietnamese
              Your goals decide what we teach — speaking, business, exams, or travel.
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
          >
            {[
              { icon: Users, title: "Private Lesson", desc: "100% tutor’s attention just for you." },
              { icon: Clock, title: "Learn Anytime", desc: "Morning, evening or weekend — your choice." },
              { icon: Star, title: "Personalized Roadmap", desc: "Your goals → customized lesson plan." },
            ].map((benefit, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="p-6 bg-white text-gray-900 hover:shadow-2xl transition-all rounded-xl">
                    <CardContent className="p-0 text-center">
                      <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center mx-auto mb-4">
                        <benefit.icon className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                      <p className="text-gray-700">{benefit.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
              className="text-center"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
          >
            <Button
                size="lg"
                className="px-10 py-6 text-lg font-semibold bg-white text-blue-600 hover:bg-blue-50 transition-all shadow-lg"
            >
              <Link to={ROUTES.TUTORS}>Book Free Trial Lesson</Link>
            </Button>
            <p className="mt-4 text-blue-100 text-sm italic">
              Start speaking your target language from day one.
            </p>
          </motion.div>
        </div>
      </section>
  );
};

export default OneOnOneAd;
