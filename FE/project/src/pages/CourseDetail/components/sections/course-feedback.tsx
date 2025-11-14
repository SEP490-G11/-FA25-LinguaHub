import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import api from "@/config/axiosConfig";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface CourseFeedbackProps {
    feedbacks?: {
        feedbackID: number;
        userFullName: string;
        userAvatarURL: string;
        rating: number;
        comment: string;
        createdAt: string;
        userID?: number;
    }[];
    courseId: number;
    isPurchased: boolean | null;
}

const CourseFeedback = ({ feedbacks = [], courseId, isPurchased }: CourseFeedbackProps) => {

    const { toast } = useToast();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [localFeedbacks, setLocalFeedbacks] = useState(feedbacks);
    const [loading, setLoading] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

    const getUserInitial = (fullName: string) => {
        if (!fullName) return "U";
        return fullName.trim()[0].toUpperCase();
    };

    /**  Submit Review */
    const submitReview = async () => {
        const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

        if (!token) {
            toast({
                variant: "destructive",
                title: "You are not logged in",
                description: "Please login before submitting a review.",
            });
            return;
        }

        if (!isPurchased) {
            toast({
                variant: "destructive",
                title: "Purchase required",
                description: "You must purchase the course before rating.",
            });
            return;
        }

        if (rating < 1 || rating > 5) {
            toast({
                variant: "destructive",
                title: "Invalid rating",
                description: "Rating must be between 1 and 5 stars.",
            });
            return;
        }

        if (!comment.trim()) {
            toast({
                variant: "destructive",
                title: "Empty review",
                description: "Please enter your review.",
            });
            return;
        }

        setLoading(true);
        try {
            const res = await api.post(`/review/${courseId}`, { rating, comment });
            const newReview = res.data.result;

            setLocalFeedbacks((prev) => [{ ...newReview }, ...prev]);
            setRating(0);
            setComment("");

            toast({
                variant: "success",
                title: "Review submitted 🎉",
            });

        } finally {
            setLoading(false);
        }
    };

    /**  Delete Review (now includes login check + toast on backend error) */
    const deleteReview = async () => {
        const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

        if (!token) {
            toast({
                variant: "destructive",
                title: "You are not logged in",
                description: "Please login before deleting a review.",
            });
            setDeleteDialogOpen(false);
            return;
        }

        if (!selectedReviewId) {
            setDeleteDialogOpen(false);
            return;
        }


        try {
            await api.delete(`/review/${selectedReviewId}`);

            setLocalFeedbacks((prev) =>
                prev.filter((fb) => fb.feedbackID !== selectedReviewId)
            );

            setDeleteDialogOpen(false);
        }  catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        toast({
            variant: "destructive",
            title: "Delete failed",
            description: error.response?.data?.message || "Something went wrong.",
        });
    }
};

    return (
        <div className="bg-white rounded-xl p-8 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h2>

            <div className="mb-8 border rounded-xl p-6 bg-gray-50">
                <h3 className="font-semibold mb-3">Write a Review</h3>

                <div className="flex gap-1 mb-3 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((num) => (
                        <Star
                            key={num}
                            onClick={() => setRating(num)}
                            className={`w-6 h-6 ${
                                num <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                            }`}
                        />
                    ))}
                </div>

                <textarea
                    className="w-full border rounded-lg p-3 text-gray-700 focus:ring-blue-500"
                    rows={3}
                    placeholder="Write your review..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />

                <button
                    onClick={submitReview}
                    disabled={loading}
                    className="mt-3 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-40"
                >
                    {loading ? "Submitting..." : "Submit Review"}
                </button>
            </div>

            {/* Reviews List */}
            <div className="space-y-6 mt-4">
                {(localFeedbacks?.length ?? 0) === 0 && (
                    <p className="text-gray-500">No reviews yet.</p>
                )}

                {localFeedbacks.map((fb) => (
                    <div key={fb.feedbackID} className="border-b pb-6">
                        <div className="flex items-center gap-4 mb-2">
                            {fb.userAvatarURL ? (
                                <img src={fb.userAvatarURL} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                    {getUserInitial(fb.userFullName)}
                                </div>
                            )}

                            <div>
                                <h3 className="font-semibold flex gap-2 items-center">
                                    {fb.userFullName}
                                    <span className="text-gray-500 text-xs">{fb.createdAt}</span>
                                </h3>

                                <div className="flex text-yellow-400">
                                    {Array.from({ length: fb.rating }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400" />
                                    ))}
                                </div>
                            </div>

                            {(localStorage.getItem("access_token") || sessionStorage.getItem("access_token")) && (
                                <Trash2
                                    onClick={() => {
                                        setSelectedReviewId(fb.feedbackID);
                                        setDeleteDialogOpen(true);
                                    }}
                                    className="w-5 h-5 text-red-500 ml-auto cursor-pointer hover:text-red-700"
                                />
                            )}
                        </div>

                        <p className="text-gray-700">{fb.comment}</p>
                    </div>
                ))}
            </div>

            {/* Delete Confirm Dialog - small width */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-sm w-full">
                    <DialogHeader>
                        <DialogTitle>Delete Review?</DialogTitle>
                        <p className="text-sm text-gray-500">
                            Are you sure you want to delete this review? This action cannot be undone.
                        </p>
                    </DialogHeader>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={deleteReview}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CourseFeedback;
