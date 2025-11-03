import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CoinState, SortField, SortDirection, Coin, CoinDetail } from '@/types/coin';
import axios from 'axios';

const initialState: CoinState = {
    coins: [],
    loading: false,
    error: null,
    searchQuery: '',
    sortField: 'market_cap',
    sortDirection: 'desc',
    selectedCoin: null,
};

export const fetchCoins = createAsyncThunk(
    'coins/fetchCoins',
    async () => {
        const response = await axios.get(
            'https://api.coingecko.com/api/v3/coins/markets',
            {
                params: {
                    vs_currency: 'usd',
                    order: 'market_cap_desc',
                    per_page: 50,
                    sparkline: false,
                }
            }
        );
        return response.data;
    }
);

export const fetchCoinDetails = createAsyncThunk(
    'coins/fetchCoinDetails',
    async (coinId: string) => {
        const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${coinId}`,
            {
                params: {
                    localization: false,
                    tickers: false,
                    market_data: true,
                    community_data: false,
                    developer_data: false,
                }
            }
        );
        return response.data;
    }
);

const coinsSlice = createSlice({
    name: 'coins',
    initialState,
    reducers: {
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        setSortField: (state, action: PayloadAction<SortField>) => {
            state.sortField = action.payload;
        },
        setSortDirection: (state, action: PayloadAction<SortDirection>) => {
            state.sortDirection = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCoins.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCoins.fulfilled, (state, action: PayloadAction<Coin[]>) => {
                state.loading = false;
                state.coins = action.payload;
            })
            .addCase(fetchCoins.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch coins';
            })
            .addCase(fetchCoinDetails.fulfilled, (state, action: PayloadAction<CoinDetail>) => {
                state.selectedCoin = action.payload;
            });
    },
});

export const { setSearchQuery, setSortField, setSortDirection } = coinsSlice.actions;
export default coinsSlice.reducer;