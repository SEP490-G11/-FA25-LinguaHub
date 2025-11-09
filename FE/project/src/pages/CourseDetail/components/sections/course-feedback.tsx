import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { ROUTES } from '@/constants/routes.ts';
interface CourseFeedbackProps {
    feedbacks: {
        feedbackID: number;
        userFullName: string;
        userAvatarURL: string;
        rating: number;
        comment: string;
        createdAt: string;
    }[];
    courseId: number;
    isPurchased: boolean | null;  // ✅ từ BE
}

const CourseFeedback = ({ feedbacks, courseId, isPurchased }: CourseFeedbackProps) => {
    const navigate = useNavigate();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [localFeedbacks, setLocalFeedbacks] = useState(feedbacks);

    const handleMockSubmit = () => {
        // ✅ lấy token từ cả localStorage & sessionStorage
        const token =
            localStorage.getItem("access_token") ||
            sessionStorage.getItem("access_token");
        if (!token) {
            return navigate(ROUTES.SIGN_IN);
        }
        if (!isPurchased) {
            return navigate(`/payment/${courseId}`);
        }
        if (!rating || !comment.trim()) {
            return alert("Please enter rating & comment");
        }

        const newFeedback = {
            feedbackID: Date.now(),
            userFullName: "Mock User",
            userAvatarURL: "https://ui-avatars.com/api/?name=Mock+User&background=random",
            rating,
            comment,
            createdAt: new Date().toISOString(),
        };

        setLocalFeedbacks([newFeedback, ...localFeedbacks]);
        setRating(0);
        setComment("");
    };


    return (
        <div className="bg-white rounded-xl p-8 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h2>

            {/*  Form review */}
            <div className="mb-8 border rounded-xl p-6 bg-gray-50">
                <h3 className="font-semibold mb-3">Write a Review</h3>

                {/* ⭐ Rating */}
                <div className="flex gap-1 mb-3 cursor-pointer">
                    {[1, 2, 3, 4, 5].map(num => (
                        <Star
                            key={num}
                            onClick={() => setRating(num)}
                            className={`w-6 h-6 ${num <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-400"
                            }`}
                        />
                    ))}
                </div>

                {/* Comment */}
                <textarea
                    className="w-full border rounded-lg p-3 text-gray-700 focus:ring-blue-500"
                    rows={3}
                    placeholder="Write your feedback..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                ></textarea>

                <button
                    onClick={handleMockSubmit}
                    className="mt-3 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Submit Review
                </button>
            </div>

            {/*  Review list */}
            <div className="space-y-6 mt-4">
                {localFeedbacks.length === 0 && (
                    <p className="text-gray-500">No reviews yet.</p>
                )}

                {localFeedbacks.map(fb => (
                    <div key={fb.feedbackID} className="border-b pb-6">
                        <div className="flex items-center gap-4 mb-2">
                            <img
                                src={fb.userAvatarURL}
                                alt="user avatar"
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <h3 className="font-semibold">{fb.userFullName}</h3>
                                <div className="flex text-yellow-400">
                                    {Array.from({ length: fb.rating }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400" />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-700">{fb.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseFeedback;
