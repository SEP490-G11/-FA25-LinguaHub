import axios, {
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError,
    InternalAxiosRequestConfig,
} from 'axios';

// ===== Cookie helpers =====
const cookie_get = (name: string): string | undefined => {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');
    if (parts.length >= 2) return parts.pop()?.split(';').shift();
    return undefined;
};

const cookie_set = (name: string, value: string, expire_day?: number): void => {
    let expires = '';
    if (typeof expire_day !== 'undefined') {
        const d = new Date();
        d.setTime(d.getTime() + expire_day * 24 * 60 * 60 * 1000);
        expires = ';expires=' + d.toUTCString();
    }
    document.cookie = `${name}=${value || ''};SameSite=Lax;path=/` + expires;
};

const cookie_delete = (name: string): void => {
    document.cookie = `${name}=;SameSite=Lax;path=/;Max-Age=-99999999;`;
};

type UnwrappedResponse<T> = T;

const baseURL =
    process.env.NODE_ENV === 'production'
        ? 'https://lms.autopass.blog/'
        : 'http://localhost:8080';

// ===== Create axios instance =====
const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 30000,
});

// ===== Add token to request =====
const onRequestSuccess = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = cookie_get('AT') || localStorage.getItem('access_token');

    if (token && token.trim() !== '') {
        config.headers = config.headers || {};
        (config.headers as { Authorization?: string }).Authorization = `Bearer ${token}`;
    }

    return config;
};

const onRequestError = (error: AxiosError): Promise<AxiosError> => Promise.reject(error);

// ===== Handle API response =====
const onResponseSuccess = <T>(response: AxiosResponse<T>): UnwrappedResponse<T> => {
    return response.data;
};

interface ApiErrorData {
    message?: string;
    code?: number;
}

// ===== Auto-refresh token when expired =====
let isRefreshing = false;
let failedQueue: {
    resolve: (token?: string) => void;
    reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token || undefined);
        }
    });
    failedQueue = [];
};

const onResponseError = async (error: AxiosError<ApiErrorData>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || '';

        // ✅ Case 1: Token expired -> try refresh
        if (status === 403 && message === 'Token expired' && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                // Wait for refresh in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token) => {
                            if (token) {
                                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                            }
                            resolve(api(originalRequest));
                        },
                        reject,
                    });
                });
            }

            isRefreshing = true;
            const refreshToken = cookie_get('RT') || localStorage.getItem('refresh_token');

            if (!refreshToken) {
                console.warn('❌ Missing refresh token, redirecting to sign-in');
                cookie_delete('AT');
                cookie_delete('RT');
                window.location.href = '/sign-in';
                return Promise.reject(error);
            }

            try {
                console.log('🔄 Refreshing access token...');
                const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
                const newAccess = res.data?.result?.accessToken;
                const newRefresh = res.data?.result?.refreshToken;

                if (newAccess) {
                    cookie_set('AT', newAccess, 1);
                    localStorage.setItem('access_token', newAccess);
                }
                if (newRefresh) {
                    cookie_set('RT', newRefresh, 7);
                    localStorage.setItem('refresh_token', newRefresh);
                }

                processQueue(null, newAccess);
                // Retry original request
                originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                cookie_delete('AT');
                cookie_delete('RT');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                console.error('❌ Refresh token failed:', refreshError);
                window.location.href = '/sign-in';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // ✅ Case 2: Không có quyền hoặc hết hạn refresh token
        if (status === 401 || status === 403) {
            console.warn('🚫 Unauthorized, clearing tokens');
            cookie_delete('AT');
            cookie_delete('RT');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/sign-in';
        }
    }

    return Promise.reject(error);
};

// ===== Register interceptors =====
api.interceptors.request.use(onRequestSuccess, onRequestError);
api.interceptors.response.use(
    onResponseSuccess as unknown as (value: AxiosResponse<unknown>) => AxiosResponse<unknown>,
    onResponseError
);

// ===== Define BaseRequest =====
interface ApiMethods {
    Get: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<T>;
    Post: <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => Promise<T>;
    Put: <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => Promise<T>;
    Patch: <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => Promise<T>;
    Delete: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<T>;
}

const BaseRequest: ApiMethods = {
    Get: async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        try {
            const response = await api.get<T>(url, config);
            return response as unknown as T;
        } catch (err: unknown) {
            const error = err as AxiosError<ApiErrorData>;
            console.error('GET Error:', error.response?.data?.message || error.message);
            throw error.response?.data || error;
        }
    },

    Post: async <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> => {
        try {
            const response = await api.post<T>(url, data, config);
            return response as unknown as T;
        } catch (err: unknown) {
            const error = err as AxiosError<ApiErrorData>;
            console.error('POST Error:', error.response?.data?.message || error.message);
            throw error.response?.data || error;
        }
    },

    Put: async <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> => {
        try {
            const response = await api.put<T>(url, data, config);
            return response as unknown as T;
        } catch (err: unknown) {
            const error = err as AxiosError<ApiErrorData>;
            console.error('PUT Error:', error.response?.data?.message || error.message);
            throw error.response?.data || error;
        }
    },

    Patch: async <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> => {
        try {
            const response = await api.patch<T>(url, data, config);
            return response as unknown as T;
        } catch (err: unknown) {
            const error = err as AxiosError<ApiErrorData>;
            console.error('PATCH Error:', error.response?.data?.message || error.message);
            throw error.response?.data || error;
        }
    },

    Delete: async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        try {
            const response = await api.delete<T>(url, config);
            return response as unknown as T;
        } catch (err: unknown) {
            const error = err as AxiosError<ApiErrorData>;
            console.error('DELETE Error:', error.response?.data?.message || error.message);
            throw error.response?.data || error;
        }
    },
};

export { api, BaseRequest };
export default BaseRequest;
