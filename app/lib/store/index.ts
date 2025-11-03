import { configureStore } from '@reduxjs/toolkit';
import coinsReducer from './slices/coinsSlice';
import favoritesReducer from './slices/favoritesSlice';
import webSocketReducer from './slices/webSocketSlice';

export const store = configureStore({
    reducer: {
        coins: coinsReducer,
        favorites: favoritesReducer,
        websocket: webSocketReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;