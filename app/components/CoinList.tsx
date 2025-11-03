'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { SearchBar } from './SearchBar';
import { SortControls } from './SortControls';
import { CoinTable } from './CoinTable';
import { LoadingSpinner } from './LoadingSpinner';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import axios from 'axios';
import { Coin, SortField, SortDirection } from '@/types/coin';
import { setSearchQuery, setSortField, setSortDirection } from '@/lib/store/slices/coinsSlice';

interface CoinListProps {
    initialCoins: Coin[];
}

export const CoinList = React.memo(({ initialCoins }: CoinListProps) => {
    const dispatch = useDispatch();
    const [search, setSearch] = useState('');
    const [sortField, setSortFieldState] = useState<SortField>('market_cap');
    const [sortDirection, setSortDirectionState] = useState<SortDirection>('desc');
    const [page, setPage] = useState(1);
    const [allCoins, setAllCoins] = useState(initialCoins);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadMoreCoins = useCallback(async () => {
        setLoading(true);
        try {
            const nextPage = page + 1;
            const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
                params: {
                    vs_currency: 'usd',
                    order: 'market_cap_desc',
                    per_page: 50,
                    page: nextPage,
                    sparkline: false,
                }
            });

            if (response.data.length === 0) {
                setHasMore(false);
            } else {
                setAllCoins(prev => [...prev, ...response.data]);
                setPage(nextPage);
            }
        } catch (error) {
            console.error('Error loading more coins:', error);
        } finally {
            setLoading(false);
        }
    }, [page]);

    const loadMoreRef = useInfiniteScroll(loadMoreCoins, hasMore, 'coinTableBody');

    // Filter coins based on search query
    const filteredCoins = useMemo(() => {
        return allCoins.filter(coin => 
            coin.name.toLowerCase().includes(search.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(search.toLowerCase())
        );
    }, [allCoins, search]);

    // Sort coins based on sort field and direction
    const sortedCoins = useMemo(() => {
        return [...filteredCoins].sort((a, b) => {
            let aValue: number, bValue: number;

            switch (sortField) {
                case 'price':
                    aValue = a.current_price;
                    bValue = b.current_price;
                    break;
                case 'market_cap':
                    aValue = a.market_cap;
                    bValue = b.market_cap;
                    break;
                case 'price_change_24h':
                    aValue = a.price_change_percentage_24h;
                    bValue = b.price_change_percentage_24h;
                    break;
                default:
                    return 0;
            }

            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        });
    }, [filteredCoins, sortField, sortDirection]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        dispatch(setSearchQuery(value));
    };

    const handleSortFieldChange = (field: SortField) => {
        setSortFieldState(field);
        dispatch(setSortField(field));
    };

    const handleSortDirectionChange = (direction: SortDirection) => {
        setSortDirectionState(direction);
        dispatch(setSortDirection(direction));
    };

    return (
        <div className="flex flex-col">
            {/* Fixed Search and Sort Controls */}
            <div className="sticky top-[72px] z-10 bg-white border-b py-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <SearchBar value={search} onChange={handleSearchChange} />
                    <SortControls
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSortFieldChange={handleSortFieldChange}
                        onSortDirectionChange={handleSortDirectionChange}
                    />
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="mt-4">
                <div>
                    {sortedCoins.length > 0 ? (
                        <div className="overflow-hidden">
                            <CoinTable 
                                coins={loading 
                                    ? [...sortedCoins, ...Array(3).fill(sortedCoins[0]).map((coin, index) => ({
                                        ...coin,
                                        id: `loading-${index}` // Create unique IDs for loading placeholders
                                    }))] 
                                    : sortedCoins
                                } 
                            />
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow p-6 text-center">
                            <p className="text-gray-500">No coins found matching your search criteria</p>
                        </div>
                    )}
                    {allCoins.length === 0 && (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                /* Hide scrollbar for Chrome, Safari and Opera */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 6px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 3px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: #666;
                }
            `}</style>
        </div>
    );
});