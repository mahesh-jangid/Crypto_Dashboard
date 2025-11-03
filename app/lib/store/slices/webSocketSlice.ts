import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TradeData {
    p: number;  // Last price
    s: string;  // Symbol
    t: number;  // Timestamp
    v: number;  // Volume
}

interface WebSocketState {
    connected: boolean;
    subscribedSymbols: string[];
    tradeData: Record<string, TradeData>;
    error: string | null;
}

const initialState: WebSocketState = {
    connected: false,
    subscribedSymbols: [],
    tradeData: {},
    error: null,
};

const webSocketSlice = createSlice({
    name: 'websocket',
    initialState,
    reducers: {
        setConnected: (state, action: PayloadAction<boolean>) => {
            state.connected = action.payload;
        },
        addSymbol: (state, action: PayloadAction<string>) => {
            if (!state.subscribedSymbols.includes(action.payload)) {
                state.subscribedSymbols.push(action.payload);
            }
        },
        removeSymbol: (state, action: PayloadAction<string>) => {
            state.subscribedSymbols = state.subscribedSymbols.filter(
                symbol => symbol !== action.payload
            );
            delete state.tradeData[action.payload];
        },
        updateTradeData: (state, action: PayloadAction<TradeData>) => {
            state.tradeData[action.payload.s] = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    setConnected,
    addSymbol,
    removeSymbol,
    updateTradeData,
    setError,
    clearError,
} = webSocketSlice.actions;

export default webSocketSlice.reducer;