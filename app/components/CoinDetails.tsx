'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { CoinDetail } from '@/types/coin';
import { RootState } from '@/lib/store';
import { toggleFavorite } from '@/lib/store/slices/favoritesSlice';
import { PriceChart } from './PriceChart';
import Link from 'next/link';

interface CoinDetailsProps {
    coin: CoinDetail;
}

export function CoinDetails({ coin }: CoinDetailsProps) {
    const dispatch = useDispatch();
    const favoriteCoins = useSelector((state: RootState) => state.favorites.favoriteCoins);
    const isFavorite = favoriteCoins.includes(coin.id);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price);
    };

    const formatMarketCap = (marketCap: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(marketCap);
    };

    return (
        <div className="bg-white shadow rounded-lg">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <Link 
                        href="/"
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Back to list
                    </Link>
                    <button
                        onClick={() => dispatch(toggleFavorite(coin.id))}
                        className="text-gray-400 hover:text-yellow-500"
                    >
                        {isFavorite ? (
                            <StarIconSolid className="h-6 w-6 text-yellow-500" />
                        ) : (
                            <StarIcon className="h-6 w-6" />
                        )}
                    </button>
                </div>

                <div className="flex items-center mb-6">
                    <img src={coin.image} alt={coin.name} className="h-16 w-16 mr-4" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{coin.name}</h1>
                        <p className="text-gray-500">{coin.symbol.toUpperCase()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Information</h2>
                        <dl className="grid grid-cols-1 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <dt className="text-sm font-medium text-gray-500">Current Price</dt>
                                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                                    {formatPrice(coin.market_data.current_price.usd)}
                                </dd>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <dt className="text-sm font-medium text-gray-500">Market Cap</dt>
                                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                                    {formatMarketCap(coin.market_cap)}
                                </dd>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <dt className="text-sm font-medium text-gray-500">24h Change</dt>
                                <dd className={`mt-1 text-2xl font-semibold ${coin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {coin.price_change_percentage_24h.toFixed(2)}%
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">About {coin.name}</h2>
                        <div className="prose prose-sm max-w-none text-gray-500" 
                             dangerouslySetInnerHTML={{ __html: coin.description.en }} />
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Chart</h2>
                    <div className="h-96">
                        <PriceChart coinId={coin.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}