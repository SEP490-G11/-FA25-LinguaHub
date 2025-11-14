export interface Course {
    id: number;
    title: string;
    shortDescription: string;
    description: string;
    requirement?: string | null; // optional theo API
    level: string;              // ➕ thêm (BEGINNER, INTERMEDIATE...)
    duration: number;
    price: number;
    language: string;
    thumbnailURL: string;
    categoryName: string;
    tutorName: string;
    status: string;
    avgRating: number;
    totalRatings: number;
    learnerCount: number;
    tutorAvatarURL?: string | null;
    tutorAddress?: string | null;
    createdAt: string;
    isWishListed?: boolean | null;
    isPurchased?: boolean | null;
    tutorID: number;
}
