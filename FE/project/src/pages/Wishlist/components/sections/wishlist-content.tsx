import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  Star,
  Clock,
  Users,
  Trash2,
  ShoppingCart,
} from "lucide-react";

interface WishlistItem {
  id: number;
  title: string;
  description: string;
  duration: number | null;
  price: number;
  language: string;
  thumbnailURL: string;
  categoryName: string;
  tutorName: string;
  learnerCount: number | null;
  avgRating: number | null;
  totalRatings: number | null;
}

interface WishlistContentProps {
  wishlistItems: WishlistItem[];
  onRemoveItem: (id: number) => void;
}

const WishlistContent = ({ wishlistItems, onRemoveItem }: WishlistContentProps) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: { staggerChildren: 0.1 },
    },
  };

  const formatPrice = (price: number) =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);

  if (wishlistItems.length === 0) {
    return (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <motion.div
                className="text-center py-16"
                initial="initial"
                animate="animate"
                variants={fadeInUp}
            >
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600 mb-8">
                Start adding courses you're interested in!
              </p>
              <Link
                  to="/languages"
                  className="bg-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors"
              >
                Browse Courses
              </Link>
            </motion.div>
          </div>
        </section>
    );
  }

  return (
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
          >
            {wishlistItems.map((item) => (
                <motion.div
                    key={item.id}
                    variants={fadeInUp}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer border border-blue-100"
                >
                  <Link to={`/courses/${item.id}`} className="block hover:no-underline">
                    <div className="relative overflow-hidden">
                      <img
                          src={item.thumbnailURL}
                          alt={item.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                    <span className="bg-yellow-400 text-blue-900 text-xs px-2 py-1 rounded-full font-semibold">
                      {item.categoryName || "Uncategorized"}
                    </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 mb-3 text-sm">by {item.tutorName}</p>

                      {/* ⭐ Rating + 👥 Learners + ⏰ Duration */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>
                        {item.avgRating !== null ? item.avgRating.toFixed(1) : "N/A"}
                      </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{item.learnerCount ?? 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{item.duration ?? 0}h</span>
                        </div>
                      </div>

                      {/* 💰 Price & 🌐 Language */}
                      <div className="flex justify-between items-end">
                    <span className="text-xl font-bold text-blue-600">
                      {formatPrice(item.price)}
                    </span>
                        <span className="text-xs text-gray-400 capitalize">
                      {item.language || "N/A"}
                    </span>
                      </div>
                    </div>
                  </Link>

                  {/* ✅ Nút Buy (vàng) và Remove (xanh) — có padding tách border */}
                  <div className="border-t border-blue-100 bg-blue-50 px-6 py-4 mt-2 rounded-b-xl flex justify-between items-center">
                    <Link
                        to={`/payment/${item.id}`}
                        className="flex items-center gap-1 bg-yellow-400 text-blue-900 px-3 py-1.5 rounded-md hover:bg-yellow-500 transition-colors text-sm font-semibold shadow-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Buy</span>
                    </Link>

                    <button
                        onClick={() => onRemoveItem(item.id)}
                        className="flex items-center gap-1 text-blue-600 hover:text-red-500 text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>

                </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
  );
};

export default WishlistContent;
