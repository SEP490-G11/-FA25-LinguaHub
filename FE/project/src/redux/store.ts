import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/redux/slices/authSlice.ts';
import courseDetailReducer from '@/redux/slices/courseDetailSlice.ts';
import userReducer from '@/redux/slices/userSlice.ts'
import homeReducer from '@/redux/slices/homeSlide.ts'
import tutorReducer from '@/redux/slices/tutorSlide.ts'
export const store = configureStore({
    reducer: {
        auth: authReducer,
        courseDetail: courseDetailReducer,
        user:userReducer,
        home:homeReducer,
        tutor:tutorReducer,
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