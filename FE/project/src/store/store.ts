// công dụng: đảm bảo state được quản lý tập trung, dễ debug
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/authSlice.ts';
import courseReducer from '@/store/courseSlice.ts';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        course: courseReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;