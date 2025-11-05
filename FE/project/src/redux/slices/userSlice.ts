// src/redux/slices/userSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import BaseRequest from '@/lib/api';
import type { User } from '@/types/User';
import { AxiosError } from 'axios';
import { updateAuthUser } from './authSlice';

interface BeResponse<T = unknown> {
    code?: number;
    message?: string;
    result?: T;
}

// ==== Update Profile ====
export const updateProfile = createAsyncThunk(
    'user/updateProfile',
    async (data: Partial<User>, { rejectWithValue, getState, dispatch }: any) => {
        try {
            const state = getState();
            const userID = state.auth.user?.userID;
            if (!userID) throw new Error('Không tìm thấy user ID');

            const response = await BaseRequest.Patch<BeResponse<User>>(`/users/${userID}`, data);
            if (!response.result) throw new Error('Cập nhật thất bại');

            // ✅ Cập nhật lại auth.user trong Redux sau khi PATCH thành công
            dispatch(updateAuthUser(response.result));

            localStorage.setItem('user_data', JSON.stringify(response.result));
            return response.result;
        } catch (error: unknown) {
            let message = 'Cập nhật thất bại';
            if (error instanceof AxiosError && error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error instanceof Error) {
                message = error.message;
            }
            return rejectWithValue(message);
        }
    }
);

// ==== Change Password ====
export const changePassword = createAsyncThunk(
    'user/changePassword',
    async (data: { oldPassword: string; newPassword: string; confirmPassword: string }, { rejectWithValue }) => {
        try {
            const response = await BaseRequest.Post<BeResponse<string>>('/users/change-password', data);
            if (response.code !== 0) throw new Error(response.message || 'Đổi mật khẩu thất bại');
            return response.message || 'Đổi mật khẩu thành công';
        } catch (error: unknown) {
            let message = 'Đổi mật khẩu thất bại';
            if (error instanceof AxiosError && error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error instanceof Error) {
                message = error.message;
            }
            return rejectWithValue(message);
        }
    }
);

interface UserState {
    updating: boolean;
    changingPassword: boolean;
    error: string | null;
}

const initialState: UserState = {
    updating: false,
    changingPassword: false,
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearUserError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Update profile
            .addCase(updateProfile.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state) => {
                state.updating = false;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload as string;
            })
            // Change password
            .addCase(changePassword.pending, (state) => {
                state.changingPassword = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.changingPassword = false;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.changingPassword = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
