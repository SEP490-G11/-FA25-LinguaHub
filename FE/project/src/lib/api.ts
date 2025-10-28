import axios, {
    //Kiểm soát cấu hình request
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError,
    // Làm việc với request interceptor
    InternalAxiosRequestConfig
} from 'axios';


const cookie_get = (name: string): string | undefined => {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');
    if (parts.length >= 2) return parts.pop()?.split(';').shift();
    return undefined;
};

const cookie_delete = (name: string): void => {
    document.cookie = `${name}=;SameSite=Lax;path=/;Max-Age=-99999999;`;
};

type UnwrappedResponse<T> = T;

const baseURL = process.env.NODE_ENV === 'production'
    ? 'https://lms.autopass.blog/'
    : 'http://localhost:8080';
//Tạo client Axios riêng biệt, để không cần lặp lại baseURL mỗi lần gọi.
const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});
//Thêm token vào header
const onRequestSuccess = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token: string | undefined = cookie_get('AT');
    if (token && token.trim() !== '') {
        config.headers = config.headers || {};
        (config.headers as { Authorization?: string }).Authorization = `Bearer ${token}`;
    }
    return config;
};

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
};

const onResponseSuccess = <T>(response: AxiosResponse<T>): UnwrappedResponse<T> => {
    return response.data;
};

interface ApiErrorData {
    message?: string;
}

const onResponseError = (error: AxiosError<ApiErrorData>): Promise<AxiosError<ApiErrorData>> => {
    if (error.response) {
        const status = error.response.status;
        const data = error.response.data as ApiErrorData;
        const message = data?.message || '';
        console.warn('API Error:', { status, message });
        if (status === 403 && message === 'Token expired') {
            cookie_delete('AT');
            window.location.href = '/sign-in';
        }
    }

    return Promise.reject(error);
};

// Đăng ký interceptor cho Axios
api.interceptors.request.use(onRequestSuccess, onRequestError);
api.interceptors.response.use(
    onResponseSuccess as unknown as (value: AxiosResponse<unknown>) => AxiosResponse<unknown>,
    onResponseError
);
//định nghĩa kiểu dữ liệu
interface ApiMethods {
    Get: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<T>;
    Post: <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => Promise<T>;
    Put: <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => Promise<T>;
    Patch: <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => Promise<T>;
    Delete: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<T>;
}

const BaseRequest: ApiMethods = {
    //Chữ Ký Hàm
    Get: async <T = unknown>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<T> => {
        try {
            const response = await api.get<T>(url, config);
            return response as unknown as T;
        } catch (err: unknown) {
            const error = err as AxiosError<ApiErrorData>;
            console.error('GET Error:', error.response?.data?.message || error.message);
            if (error.response?.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    Post: async <T = unknown, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<T> => {
        try {
            const response = await api.post<T>(url, data, config);
            return response as unknown as T;
        } catch (err: unknown) {
            const error = err as AxiosError<ApiErrorData>;
            console.error('POST Error:', error.response?.data?.message || error.message);
            if (error.response?.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    Put: async <T = unknown, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<T> => {
        try {
            const response = await api.put<T>(url, data, config);
            return response as unknown as T;
        } catch (err: unknown) {
            const error = err as AxiosError<ApiErrorData>;
            console.error('PUT Error:', error.response?.data?.message || error.message);
            if (error.response?.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    Patch: async <T = unknown, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<T> => {
        try {
            const response = await api.patch<T>(url, data, config);
            return response as unknown as T;
        } catch (err: unknown) {
            const error = err as AxiosError<ApiErrorData>;
            console.error('PATCH Error:', error.response?.data?.message || error.message);
            if (error.response?.data) {
                throw error.response.data;
            }
            throw error;
        }
    },

    Delete: async <T = unknown>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<T> => {
        try {
            const response = await api.delete<T>(url, config);
            return response as unknown as T;
        } catch (err: unknown) {
            const error = err as AxiosError<ApiErrorData>;
            console.error('DELETE Error:', error.response?.data?.message || error.message);
            if (error.response?.data) {
                throw error.response.data;
            }
            throw error;
        }
    },
};


export { api, BaseRequest};
export default BaseRequest;