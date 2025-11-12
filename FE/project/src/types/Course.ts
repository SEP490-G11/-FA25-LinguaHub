export interface Course {
    id: number;
    title: string;
    description: string;
    duration: number;
    price: number;
    language: string;
    thumbnailURL: string;
    categoryName: string;
    tutorName: string;
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
