import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import BaseRequest from "@/lib/api";
import { CourseDetail } from "@/types/Course";


interface CourseDetailState {
  course: CourseDetail | null;
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
          result: CourseDetail;
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