import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import BaseRequest from '@/configs/api.ts';

interface Course {
    id: number;
    title: string;
    description: string;
    duration: number;
    price: number;
    language: string;
    thumbnailURL: string;
    categoryName: string;
    tutorName: string;
    status: string;
}

interface HomeState {
    courses: Course[];
    loading: boolean;
    error: string | null;
}

// ✅ initial state
const initialState: HomeState = {
    courses: [],
    loading: false,
    error: null,
};

// ✅ Async thunk: fetch courses
export const fetchApprovedCourses = createAsyncThunk(
    "home/fetchApprovedCourses",
    async (_, { rejectWithValue }) => {
        try {
            // Backend response:
            // { code: 0, result: [...] }
            const res = await BaseRequest.Get<{ code: number; result: Course[] }>(
                "/courses/public/approved"
            );
            return res.result;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to fetch courses");
        }
    }
);

// ✅ Slice
const homeSlice = createSlice({
    name: "home",
    initialState,
    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(fetchApprovedCourses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApprovedCourses.fulfilled, (state, action) => {
                state.loading = false;
                state.courses = action.payload;
            })
            .addCase(fetchApprovedCourses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default homeSlice.reducer;
