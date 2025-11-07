import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import BaseRequest from "@/configs/api";

export interface CourseDetailResponse {
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

interface CourseDetailState {
  course: CourseDetailResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: CourseDetailState = {
  course: null,
  loading: false,
  error: null,
};

export const fetchCourseDetail = createAsyncThunk(
    "courseDetail/fetch",
    async (courseId: string | number, { rejectWithValue }) => {
      try {
        const res = await BaseRequest.Get<{
          code: number;
          result: CourseDetailResponse;
        }>(`/courses/detail/${courseId}`);

        return res.result;
      } catch (error: unknown) {
        if (error instanceof Error) {
          return rejectWithValue(error.message);
        }
        return rejectWithValue("Unknown error");
      }
    }
);

const courseDetailSlice = createSlice({
  name: "courseDetail",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
        .addCase(fetchCourseDetail.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchCourseDetail.fulfilled, (state, action) => {
          state.loading = false;
          state.course = action.payload;
        })
        .addCase(fetchCourseDetail.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        });
  },
});

export default courseDetailSlice.reducer;
