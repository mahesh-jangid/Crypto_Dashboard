import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FavoritesState } from '../../types/coin';

const initialState: FavoritesState = {
    favoriteCoins: [],
};

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        toggleFavorite: (state, action: PayloadAction<string>) => {
            const coinId = action.payload;
            const index = state.favoriteCoins.indexOf(coinId);
            if (index === -1) {
                state.favoriteCoins.push(coinId);
            } else {
                state.favoriteCoins.splice(index, 1);
            }
        },
    },
});

export const { toggleFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;