import axios, { InternalAxiosRequestConfig } from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

/* ----------------------------- REQUEST TOKEN ----------------------------- */
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig & { skipAuth?: boolean }) => {
        if (config.skipAuth) return config;

        const token =
            localStorage.getItem("access_token") ||
            sessionStorage.getItem("access_token");

        if (token) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    }
);

/* ------------------------ REFRESH TOKEN MANAGER ------------------------- */
let isRefreshing = false;

let failedQueue: {
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((p) => {
        if (error) p.reject(error);
        else p.resolve(token!);
    });

    failedQueue = [];
};

/* ----------------------------- RESPONSE LOGIC ---------------------------- */
api.interceptors.response.use(
    (res) => res,

    async (error) => {
        const originalRequest = error.config;

        // Chỉ xử lý refresh nếu request chưa retry và lỗi là 401 hoặc 403
        if (
            (error.response?.status === 401 || error.response?.status === 403) &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            if (isRefreshing) {
                // Nếu đang refresh thì cho request vào hàng đợi
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
                if (!refreshToken) throw new Error("No refresh token");

                const res = await api.post(
                    "/auth/refresh",
                    { refreshToken },
                    { skipAuth: true }
                );

                const newAccess = res.data?.result?.accessToken;
                const newRefresh = res.data?.result?.refreshToken;

                localStorage.setItem("access_token", newAccess);
                localStorage.setItem("refresh_token", newRefresh);

                processQueue(null, newAccess);

                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.location.href = "/sign-in";
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
