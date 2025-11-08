import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080", // ← FIX: Bỏ /api để match với backend routes
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Chỉ thêm token khi có
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token"); // ← FIX: Đổi từ "accessToken" thành "access_token"
    if (token && token.trim() !== "") {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
