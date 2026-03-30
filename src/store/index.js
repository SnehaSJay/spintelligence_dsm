import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import  userReducer  from './slices/userSlice';
import comberReducer from './slices/comber';
import cardingReducer from './slices/carding';

// Configure the core Redux Store for the application
export const store = configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
        comber: comberReducer,
        carding: cardingReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});
