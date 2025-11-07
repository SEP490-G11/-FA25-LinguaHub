import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/app/store/slices/authSlice.ts';
import courseDetailReducer from '@/app/store/slices/courseDetailSlice.ts';
import userReducer from '@/app/store/slices/userSlice.ts'
import homeReducer from '@/app/store/slices/homeSlide.ts'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        courseDetail: courseDetailReducer,
        user:userReducer,
        home:homeReducer,
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
