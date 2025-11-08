// src/redux/slices/tutorSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import BaseRequest from '@/lib/api';
import { AxiosError } from 'axios';

// Interface trả về từ backend
interface Tutor {
    tutorId: number;
    userId: number;
    userEmail: string;
    userName: string;
    avatarURL: string | null;
    country: string | null;
    specialization: string | null;
    teachingLanguage: string | null;
    pricePerHour: number | null;
    status: string;
}

interface BeResponse<T = unknown> {
    code?: number;
    message?: string;
    result?: T;
}

// ==== Get Approved Tutors ====
export const fetchApprovedTutors = createAsyncThunk(
    'tutor/fetchApprovedTutors',
    async (_, { rejectWithValue }) => {
        try {
            const response = await BaseRequest.Get<BeResponse<Tutor[]>>(`/tutors/approved`);

            // API không có wrapped "result", trả về trực tiếp ARRAY nên handle:
            if (Array.isArray(response)) return response;

            if (!response.result) throw new Error('Không tìm thấy dữ liệu');

            return response.result;
        } catch (error: unknown) {
            let message = 'Lấy danh sách tutor thất bại';
            if (error instanceof AxiosError && error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error instanceof Error) {
                message = error.message;
            }
            return rejectWithValue(message);
        }
    }
);

interface TutorState {
    tutors: Tutor[];
    loading: boolean;
    error: string | null;
}

const initialState: TutorState = {
    tutors: [],
    loading: false,
    error: null,
};

const tutorSlice = createSlice({
    name: 'tutor',
    initialState,
    reducers: {
        clearTutorError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchApprovedTutors.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApprovedTutors.fulfilled, (state, action) => {
                state.loading = false;
                state.tutors = action.payload;
            })
            .addCase(fetchApprovedTutors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearTutorError } = tutorSlice.actions;
export default tutorSlice.reducer;
