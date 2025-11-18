import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import api from "@/config/axiosConfig";

interface ReviewApiResponse {
  id: number;
  studentName?: string;
  flag?: string;
  rating?: number;
  createdAt?: string;
  comment?: string;
  avatarURL?: string;
}

interface Review {
  id: number;
  studentName: string;
  studentFlag: string;
  rating: number;
  date: string;
  comment: string;
  avatarURL?: string;
}

interface ReviewsSectionProps {
  tutorId: number;
}

const ReviewsSection = ({ tutorId }: ReviewsSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);

        const res = await api.get<ReviewApiResponse[]>(
            `/reviews/tutor/${tutorId}`,
            {
              skipAuth: true,
            }
        );

        const mapped: Review[] =
            res.data?.map((r) => ({
              id: r.id,
              studentName: r.studentName || "Anonymous",
              studentFlag: r.flag || "🌍",
              rating: r.rating || 0,
              date: r.createdAt
                  ? new Date(r.createdAt).toLocaleDateString("en-US")
                  : "Unknown",
              comment: r.comment || "No comment provided.",
              avatarURL: r.avatarURL,
            })) || [];

        setReviews(mapped);
      } catch (err) {
        console.error("Error loading reviews:", err);
        setError("Unable to load reviews.");
      } finally {
        setLoading(false);
      }
    };

    if (tutorId) fetchReviews();
  }, [tutorId]);

  return (
      <motion.div
          className="bg-white rounded-xl p-8 shadow-md"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Student Reviews
        </h2>

        {loading && (
            <p className="text-gray-500 text-center py-4">Loading reviews...</p>
        )}

        {error && <p className="text-red-500 text-center py-4">{error}</p>}

        {!loading && !error && reviews.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No reviews available for this tutor.
            </p>
        )}

        {!loading && !error && reviews.length > 0 && (
            <div className="space-y-6">
              {reviews.map((review) => (
                  <div
                      key={review.id}
                      className="border-b border-gray-200 pb-6 last:border-b-0"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {review.avatarURL ? (
                            <img
                                src={review.avatarURL}
                                alt={review.studentName}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                              {review.studentFlag}
                            </div>
                        )}
                        <span className="font-medium text-gray-900">
                    {review.studentName}
                  </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(review.rating)].map((_, i) => (
                              <Star
                                  key={i}
                                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                              />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
              ))}
            </div>
        )}
      </motion.div>
  );
};

export default ReviewsSection;
