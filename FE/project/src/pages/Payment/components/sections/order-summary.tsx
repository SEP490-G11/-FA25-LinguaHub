import { motion } from "framer-motion";

interface OrderSummaryProps {
  course: {
    title: string;
    tutorName: string;
    price: number;
    thumbnailURL: string;
    duration: number;
  };
}

const OrderSummary = ({ course }: OrderSummaryProps) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  //  Format price
  const formatPrice = (price: number) =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);

  return (
      <motion.div
          className="bg-white rounded-xl p-8 shadow-md h-fit"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Order Summary
        </h2>

        {/* Course thumbnail + details */}
        <div className="flex items-start space-x-4 mb-6">
          <img
              src={course.thumbnailURL}
              alt={course.title}
              className="w-20 h-20 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">{course.title}</h3>
            <p className="text-gray-600 mb-1">by {course.tutorName}</p>
            <p className="text-blue-500 text-sm">{course.duration} hours</p>
          </div>
        </div>

        {/* Price section */}
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600">Course Price:</span>
            <span className="text-gray-900 font-medium">
            {formatPrice(course.price)}
          </span>
          </div>

          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600">Discount:</span>
            <span className="text-green-600 font-medium">0 VND</span>
          </div>

          <hr className="my-3" />

          {/*  Total */}
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">Total:</span>
            <span className="text-2xl font-bold text-blue-600">
            {formatPrice(course.price)}
          </span>
          </div>
        </div>
      </motion.div>
  );
};

export default OrderSummary;
