import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice'; // Sửa: Import .reducer
import courseReducer from './slices/courseSlice'; // Sửa: Import .reducer

export const store = configureStore({
    reducer: {
        auth: authReducer, // Sửa: Dùng .reducer
        course: courseReducer, // Sửa: Dùng .reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'], // Giữ nếu dùng redux-persist
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;