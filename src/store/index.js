import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import mixingReducer from './slices/mixing';
// Configure the core Redux Store for the application
export const store = configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
        mixing: mixingReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});
