export interface Coin {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    price_change_percentage_24h: number;
    total_volume: number;
    high_24h: number;
    low_24h: number;
}

export interface CoinDetail extends Coin {
    description: {
        en: string;
    };
    market_data: {
        current_price: {
            usd: number;
        };
        price_change_percentage_7d: number;
        price_change_percentage_30d: number;
    };
}

export type SortField = 'price' | 'market_cap' | 'price_change_24h';
export type SortDirection = 'asc' | 'desc';

export interface CoinState {
    coins: Coin[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    sortField: SortField;
    sortDirection: SortDirection;
    selectedCoin: CoinDetail | null;
}

export interface FavoritesState {
    favoriteCoins: string[]; // Array of coin IDs
}