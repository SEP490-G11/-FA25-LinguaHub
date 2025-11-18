import { useEffect, useState } from "react";
import api from "@/config/axiosConfig";

export interface UserInfo {
    userID: number;
    username: string;
    fullName: string;
    email: string;
    role: string;
    avatarURL?: string;
}

export const useUserInfo = () => {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get("/users/myInfo");
                setUser(res.data?.result || null);
            } catch  {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { user, loading };
};
