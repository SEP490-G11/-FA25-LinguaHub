import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import BaseRequest from '@/lib/api';
import type { User } from '@/types';

// ======= Common API Types =======
interface ApiRespond<T> {
    result: T;
    message?: string;
}

interface SignInCredentials {
    username: string;
    password: string;
    rememberMe?: boolean;
}

interface SignUpData {
    fullName: string;
    email: string;
    password: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isConnected: boolean;
}

// ======= Initial State =======
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isConnected: false,
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
            const response = await BaseRequest.Post<ApiRespond<{ active: boolean; user: User }>>(
                '/auth/introspect',
                { token: 'test' }
            );
            console.log('ok:', response);
            return { connected: true };
        } catch (error: unknown) {
            console.error('error:', error);
            return rejectWithValue((error as Error).message || 'Connection failed');
        }
    }
);

// ======= SIGN IN (Login) =======
export const signIn = createAsyncThunk(
    'auth/signIn',
    async (credentials: SignInCredentials, { rejectWithValue }) => {
        try {
            const apiData = {
                username: credentials.username,
                password: credentials.password,
            };

            const response = await BaseRequest.Post<{
                code: number;
                message: string;
                result: {
                    token: string;
                    authenticated: boolean;
                };
            }>('/auth/token', apiData);

            const { token, authenticated } = response.result;

            if (authenticated && token) {
                // Lưu token
                const expiresDays = credentials.rememberMe ? 7 : 1;
                cookie_set('AT', token, expiresDays);
                localStorage.setItem('access_token', token);

                const userResponse = await BaseRequest.Get<ApiRespond<User>>('/users/myInfo');
                const user = userResponse.result;

                if (user) {
                    localStorage.setItem('user_data', JSON.stringify(user));
                    return { user, token };
                } else {
                    return rejectWithValue('Không thể lấy thông tin người dùng');
                }
            } else {
                return rejectWithValue('Sai tên đăng nhập hoặc mật khẩu');
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err?.response?.data?.message || 'Đăng nhập thất bại';
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
                console.log('✅ Logout API success');
            }
            return true;
        } catch (error: unknown) {
            console.error('❌ Logout API error:', error);
            return true;
        }
    }
);

// ======= SIGN UP =======
export const signUp = createAsyncThunk(
    'auth/signUp',
    async (userData: SignUpData, { rejectWithValue, dispatch }) => {
        try {
            const response = await BaseRequest.Post<ApiRespond<{ token: string; user: User }>>(
                '/auth/register',
                userData
            );
            const { token, user } = response.result;

            if (token) {
                cookie_set('AT', token, 1);
                localStorage.setItem('access_token', token);
            }
            if (user) {
                localStorage.setItem('user_data', JSON.stringify(user));
                // Gửi OTP đến email sau khi đăng ký thành công
                await dispatch(sendOtp(user.email));
            }

            return { user, token };
        } catch (error: unknown) {
            const message = (error as Error).message || 'Sign up failed';
            return rejectWithValue(message);
        }
    }
);

// ======= Gửi OTP API =======
export const sendOtp = createAsyncThunk(
    'auth/sendOtp',
    async (email: string, { rejectWithValue }) => {
        try {
            const response = await BaseRequest.Post<ApiRespond<null>>('/auth/send-otp', { email });
            return response.message || 'OTP sent successfully';
        } catch (error) {
            const message = (error as Error).message || 'Gửi OTP thất bại';
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

            const response = await BaseRequest.Post<ApiRespond<{ active: boolean; user: User }>>(
                '/auth/introspect',
                { token }
            );
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
            cookie_delete('AT');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_data');
            return rejectWithValue((error as Error).message || 'Auth check failed');
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
            })
            .addCase(
                signUp.fulfilled,
                (state, action: PayloadAction<{ user: User; token: string }>) => {
                    state.isLoading = false;
                    state.user = action.payload.user;
                    state.isAuthenticated = true;
                }
            )
            .addCase(signUp.rejected, (state, action) => {
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
            })

            // ===== Gửi OTP =====
            .addCase(sendOtp.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(sendOtp.fulfilled, (state, action) => {
                state.isLoading = false;
                // Bạn có thể cập nhật trạng thái gửi OTP thành công nếu muốn
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

// ======= Exports =======
export const { clearError, loadUserFromStorage } = authSlice.actions;
export default authSlice.reducer;