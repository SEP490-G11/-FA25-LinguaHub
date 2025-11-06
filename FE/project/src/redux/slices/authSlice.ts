import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import BaseRequest from '@/lib/api.ts';
import type { User } from '@/types/User.ts';
import { AxiosError } from 'axios';

// Interface cho response API chung (thay đổi để linh hoạt hơn, không giả định luôn có 'result')
interface BeResponse<T = unknown> {
    code?: number;
    message?: string;
    result?: T;
    token?: string; // Thêm cho trường hợp response có token trực tiếp

}

// Type cho data đăng nhập
interface SignInCredentials {
    username: string;
    password: string;
    rememberMe?: boolean;
}

// Type cho data đăng ký
interface SignUpData {
    fullName: string;
    email: string;
    password: string;
    username?: string;
    phone?: string;
    dob?: string;
    gender?: string;
    country?: string;
    address?: string;
    bio?: string;
}

// Type cho fulfilled payload của signUp
type SignUpFulfilledPayload = { otpSent: boolean; email: string };

// Type cho state của slice (thêm otpSent và otpEmail để xử lý trường hợp OTP)
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isConnected: boolean;
    otpSent: boolean;
    otpEmail: string;
}

// ======= Initial State =======
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isConnected: false,
    otpSent: false,
    otpEmail: '',
};

// ======= Simple Cookie Utils =======
const cookie_set = (name: string, value: string, expire_day?: number): void => {
    let expires = '';
    if (typeof expire_day !== 'undefined') {
        const d = new Date();
        d.setTime(d.getTime() + expire_day * 24 * 60 * 60 * 1000);
        expires = ';expires=' + d.toUTCString();
    }
    document.cookie = `${name}=${value || ''};SameSite=Lax;path=/` + expires;
};

const cookie_get = (name: string): string | undefined => {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');
    if (parts.length >= 2) return parts.pop()?.split(';').shift();
    return undefined;
};

const cookie_delete = (name: string): void => {
    document.cookie = `${name}=;SameSite=Lax;path=/;Max-Age=-99999999;`;
};

// ======= Test Connection =======
export const testConnection = createAsyncThunk(
    'auth/testConnection',
    async (_: void, { rejectWithValue }) => {
        try {
            const response = await BaseRequest.Post<BeResponse<{ active: boolean; user: User }>>(
                '/auth/introspect',
                { token: 'test' }
            );
            console.log('ok:', response);
            return { connected: true };
        } catch (error: unknown) {
            let message = 'Connection failed';
            if (error && typeof error === 'object') {
                if ('message' in error && typeof (error as Record<string, unknown>).message === 'string') {
                    message = (error as { message: string }).message;
                } else if ('response' in error) {
                    const axiosError = error as AxiosError<BeResponse>;
                    if (axiosError.response?.data?.message) {
                        message = axiosError.response.data.message;
                    }
                }
            } else if (error instanceof Error) {
                message = error.message;
            }
            console.error('error:', error);
            return rejectWithValue(message);
        }
    }
);

// ======= SignIn =======
export const signIn = createAsyncThunk(
    //name/prefix (tên tiền tố) của thunk
    'auth/signIn',
    async (credentials: SignInCredentials, { rejectWithValue }) => {
        try {
            const apiData = {
                username: credentials.username,
                password: credentials.password,
            };
            const response = await BaseRequest.Post<BeResponse<{ authenticated: boolean; accessToken: string; refreshToken: string }>>('/auth/token', apiData);

            if (!response || !response.result?.authenticated) {
                return rejectWithValue(response?.message || 'Sai tên đăng nhập hoặc mật khẩu');
            }

            const { accessToken, refreshToken, authenticated } = response.result;

            if (!authenticated || !accessToken) {
                return rejectWithValue('Sai tên đăng nhập hoặc mật khẩu');
            }
            const expiresDays = credentials.rememberMe ? 7 : 1;
            //tự động gửi cùng request.
            cookie_set('AT', accessToken, expiresDays);
            cookie_set('RT', refreshToken, expiresDays);
            //dễ thao tác bằng JS
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
            // Lấy thông tin người dùng
            const userResponse = await BaseRequest.Get<BeResponse<User>>('/users/myInfo');
            const user = userResponse.result;

            if (!user) {
                return rejectWithValue('Không thể lấy thông tin người dùng');
            }

            localStorage.setItem('user_data', JSON.stringify(user));
            return { user, token: accessToken, authenticated: true };
        } catch (error: unknown) {
            let message = 'Đăng nhập thất bại';
            if (error && typeof error === 'object') {
                if ('message' in error && typeof (error as Record<string, unknown>).message === 'string') {
                    message = (error as { message: string }).message;
                } else if ('response' in error) {
                    const axiosError = error as AxiosError<{ message?: string }>;
                    message = axiosError.response?.data?.message || (axiosError.response?.status === 401 ? 'Sai tên đăng nhập hoặc mật khẩu' : 'Đăng nhập thất bại');
                }
            } else if (error instanceof Error) {
                message = error.message;
            }
            return rejectWithValue(message);
        }
    }
);

// ======= SIGN OUT (Logout) =======
export const signOut = createAsyncThunk(
    'auth/signOut',
    async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                await BaseRequest.Post('/auth/logout', { token });
                console.log(' Logout API success');
            }
            return true;
        } catch (error: unknown) {
            console.error(' Logout API error:', error);
            // Vẫn return true để logout local dù API fail
            return true;
        }
    }
);

// ======= SIGN UP =======
export const signUp = createAsyncThunk(
    'auth/signUp',
    async (userData: SignUpData, { rejectWithValue }) => {
        try {
            const response = await BaseRequest.Post<BeResponse<{ token: string; user: User }>>(
                '/auth/register',
                userData,
                { withCredentials: true }
            );
            if (response.token || response.result?.token) {
                console.warn('Signup returned token, but ignoring for verification flow');
            }
            return { otpSent: true, email: userData.email };
        } catch (error: unknown) {
            let message = 'Sign up failed';
            if (error && typeof error === 'object') {
                if ('message' in error && typeof (error as Record<string, unknown>).message === 'string') {
                    message = (error as { message: string }).message;
                } else if ('response' in error) {
                    const axiosError = error as AxiosError<BeResponse>;
                    if (axiosError.response?.data?.message) {
                        message = axiosError.response.data.message;
                    }
                }
            } else if (error instanceof Error) {
                message = error.message;
            }
            return rejectWithValue(message);
        }
    }
);

// ==== VERIFY OTP ====
export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async (otp: string, { rejectWithValue }) => {
        try {
            const response = await BaseRequest.Post<BeResponse<null>>('/auth/verify', { otp });
            return response.message || 'Email verified successfully';
        } catch (error: unknown) {
            let message = 'OTP verification failed';
            if (error && typeof error === 'object') {
                if ('message' in error && typeof (error as Record<string, unknown>).message === 'string') {
                    message = (error as { message: string }).message;
                } else if ('response' in error) {
                    const axiosError = error as AxiosError<BeResponse>;
                    if (axiosError.response?.data?.message) {
                        message = axiosError.response.data.message;
                    }
                }
            } else if (error instanceof Error) {
                message = error.message;
            }
            return rejectWithValue(message);
        }
    }
);
// ==== FORGOT-PASSWORD ====
export const confirmEmail = createAsyncThunk(
    'auth/confirmEmail',
    async (email: string, { rejectWithValue }) => {
        try {
            const response = await BaseRequest.Post<BeResponse<null>>('/auth/forgot-password', { email });
            return response.message || 'The code has been sent to the corresponding email.';
        } catch (error: unknown) {
            let message = 'Wrong email';
            if (error && typeof error === 'object') {
                if ('message' in error && typeof (error as Record<string, unknown>).message === 'string') {
                    message = (error as { message: string }).message;
                } else if ('response' in error) {
                    const axiosError = error as AxiosError<BeResponse>;
                    if (axiosError.response?.data?.message) {
                        message = axiosError.response.data.message;
                    }
                }
            } else if (error instanceof Error) {
                message = error.message;
            }
            return rejectWithValue(message);
        }
    }
);
// ==== RESET PASSWORD ====
export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async (data: { newPassword: string; confirmPassword: string }, { rejectWithValue }) => {
        try {
            const response = await BaseRequest.Post<BeResponse<string>>('/auth/set-new-password', data);

            if (response.code !== 0) {
                return rejectWithValue(response.message ?? 'Password reset failed');
            }

            return response.message ?? 'Password reset successfully';
        } catch (error: unknown) {
            let message = 'Request failed';
            if (error && typeof error === 'object') {
                if ('message' in error && typeof (error as Record<string, unknown>).message === 'string') {
                    message = (error as { message: string }).message;
                } else if ('response' in error) {
                    const axiosError = error as AxiosError<BeResponse>;
                    if (axiosError.response?.data?.message) {
                        message = axiosError.response.data.message;
                    }
                }
            } else if (error instanceof Error) {
                message = error.message;
            }
            return rejectWithValue(message);
        }
    }
);


// ==== VERIFY RESET OTP ====
export const verifyResetOtp = createAsyncThunk(
    'auth/verifyResetOtp',
    async (otp: string, { rejectWithValue }) => {
        try {
            const response = await BaseRequest.Post<BeResponse<string>>('/auth/verify-reset-otp', { otp });

            if (response.code !== 0) {
                return rejectWithValue(response.message ?? 'Password reset failed');
            }
            return response.message ?? 'Password reset successfully';

        } catch (error: unknown) {
            let message = 'OTP verification failed';
            if (error && typeof error === 'object') {
                if ('message' in error && typeof (error as Record<string, unknown>).message === 'string') {
                    message = (error as { message: string }).message;
                } else if ('response' in error) {
                    const axiosError = error as AxiosError<BeResponse>;
                    if (axiosError.response?.data?.message) {
                        message = axiosError.response.data.message;
                    }
                }
            } else if (error instanceof Error) {
                message = error.message;
            }
            return rejectWithValue(message);
        }
    }
);


// ======= CHECK AUTH =======
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_: void, { rejectWithValue }) => {
        try {
            const token = cookie_get('AT') || localStorage.getItem('access_token');
            if (!token) return rejectWithValue('No token');

            const response = await BaseRequest.Post<BeResponse<{ active: boolean; user: User }>>(
                '/auth/introspect',
                { token }
            );
            if (!response.result) {
                throw new Error('Invalid response structure');
            }
            const { active, user } = response.result;

            if (active && user) {
                localStorage.setItem('user_data', JSON.stringify(user));
                return { user, active: true };
            } else {
                cookie_delete('AT');
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_data');
                return rejectWithValue('Invalid token');
            }
        } catch (error: unknown) {
            let message = 'Auth check failed';
            if (error && typeof error === 'object') {
                if ('message' in error && typeof (error as Record<string, unknown>).message === 'string') {
                    message = (error as { message: string }).message;
                } else if ('response' in error) {
                    const axiosError = error as AxiosError<BeResponse>;
                    if (axiosError.response?.data?.message) {
                        message = axiosError.response.data.message;
                    }
                }
            } else if (error instanceof Error) {
                message = error.message;
            }
            cookie_delete('AT');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_data');
            return rejectWithValue(message);
        }
    }
);

// ======= Slice =======
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearOtp: (state) => {
            state.otpSent = false;
            state.otpEmail = '';
        },
        loadUserFromStorage: (state) => {
            const userData = localStorage.getItem('user_data');
            if (userData) {
                try {
                    state.user = JSON.parse(userData);
                    state.isAuthenticated = true;
                } catch (e) {
                    console.error('Invalid user data in storage:', e);
                    localStorage.removeItem('user_data');
                }
            }
        },
        updateAuthUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                localStorage.setItem('user_data', JSON.stringify(state.user));
            }
        },

    },
    extraReducers: (builder) => {
        builder
            // ===== Test Connection =====
            .addCase(testConnection.fulfilled, (state) => {
                state.isConnected = true;
            })
            .addCase(testConnection.rejected, (state, action) => {
                state.isConnected = false;
                state.error = action.payload as string || 'Connection to backend failed';
            })

            // ===== Sign In =====
            .addCase(signIn.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(
                signIn.fulfilled,
                (state, action: PayloadAction<{ user: User; token: string }>) => {
                    state.isLoading = false;
                    state.user = action.payload.user;
                    state.isAuthenticated = true;
                    state.error = null;
                }
            )
            .addCase(signIn.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // ===== Sign Out =====
            .addCase(signOut.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signOut.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
                state.isLoading = false;
                cookie_delete('AT');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_data');
            })
            .addCase(signOut.rejected, (state) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
                cookie_delete('AT');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_data');
            })

            // ===== Sign Up =====
            .addCase(signUp.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.otpSent = false; // Reset OTP flag
            })
            .addCase(
                signUp.fulfilled,
                (state, action: PayloadAction<SignUpFulfilledPayload>) => {
                    state.isLoading = false;
                    state.otpSent = action.payload.otpSent;
                    state.otpEmail = action.payload.email || '';
                }
            )
            .addCase(signUp.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.otpSent = false;
            })
            // ==== FORGOT-PASSWORD ====
            .addCase(confirmEmail.pending, (state) =>
                {
                    state.isLoading = true;
                    state.error = null;
                    state.otpSent = false;
                }
            )
            .addCase(confirmEmail.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
                state.otpSent = true;
            })
            .addCase(confirmEmail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // ==== RESET PASSWORD ====
            .addCase(resetPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
                state.otpSent = false; // Reset flag sau khi đổi mật khẩu xong
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(verifyResetOtp.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyResetOtp.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(verifyResetOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // ===== Check Auth =====
            .addCase(
                checkAuth.fulfilled,
                (state, action: PayloadAction<{ user: User; active: boolean }>) => {
                    state.user = action.payload.user;
                    state.isAuthenticated = action.payload.active;
                }
            )
            .addCase(checkAuth.rejected, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                cookie_delete('AT');
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_data');
            });
    },
});

// ======= Exports =======
export const { clearError, clearOtp, loadUserFromStorage, updateAuthUser  } = authSlice.actions;
export default authSlice.reducer;