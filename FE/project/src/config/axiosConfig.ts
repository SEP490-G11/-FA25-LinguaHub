import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// ===== Add Access Token to Request =====
api.interceptors.request.use((config) => {
    const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

    if (token && token.trim() !== "") {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ===== Refresh Logic =====
let isRefreshing = false;
let failedQueue: {
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

// ===== Response Interceptor =====
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        //  Nếu token hết hạn (401 hoặc 403), thử refresh
        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                // Chờ refresh xong rồi gửi lại request cũ
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject,
                    });
                });
            }

            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem("refresh_token");
                if (!refreshToken) throw new Error("Missing refresh token");

                const res = await axios.post("http://localhost:8080/auth/refresh", {
                    refreshToken,
                });

                const newAccessToken = res.data?.result?.accessToken;
                const newRefreshToken = res.data?.result?.refreshToken;

                // Lưu token mới
                localStorage.setItem("access_token", newAccessToken);
                localStorage.setItem("refresh_token", newRefreshToken);

                processQueue(null, newAccessToken);

                // Gắn lại token mới vào request cũ
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                console.error("Refresh token failed, redirect login");
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.location.href = "/sign-in";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
