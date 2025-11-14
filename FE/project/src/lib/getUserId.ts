import api from "@/config/axiosConfig";

export const getUserId = async (): Promise<number | null> => {
    try {
        const res = await api.get("/users/myInfo");
        return res.data?.result?.userID ?? null; // <-- Lấy đúng userID
    } catch (error) {
        console.error("❌ Failed to fetch user ID:", error);
        return null;
    }
};
