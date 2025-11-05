import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/redux/slices/authSlice.ts';
import courseReducer from '@/redux/slices/courseSlice.ts';
import userReducer from '@/redux/slices/userSlice.ts'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        course: courseReducer,
        user:userReducer,
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