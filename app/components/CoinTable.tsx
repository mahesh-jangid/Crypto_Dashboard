'use client';

import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite } from '@/lib/store/slices/favoritesSlice';
import { RootState } from '@/lib/store';
import Link from 'next/link';
import { Coin } from '@/types/coin';

interface CoinTableProps {
    coins: Coin[];
}

export function CoinTable({ coins }: CoinTableProps) {
    const dispatch = useDispatch();
    const favoriteCoins = useSelector((state: RootState) => state.favorites.favoriteCoins);

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
        <div className="w-full">
            <table className="w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-white sticky top-0 z-10 shadow-sm block">
                    <tr className="flex">
                        <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                            Favorite
                        </th>
                        <th scope="col" className="w-[30%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                            Name
                        </th>
                        <th scope="col" className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                            Price
                        </th>
                        <th scope="col" className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                            24h Change
                        </th>
                        <th scope="col" className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                            Market Cap
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 block h-[calc(100vh-250px)] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-blue-500 [&::-webkit-scrollbar-thumb]:rounded-full relative" id="coinTableBody">
                    {coins.map((coin) => coin && (
                        <tr key={coin.id} className="hover:bg-gray-50 flex w-full">
                            <td className="w-[10%] px-6 py-4 whitespace-nowrap">
                                <button
                                    onClick={() => dispatch(toggleFavorite(coin.id))}
                                    className="text-gray-400 hover:text-yellow-500"
                                >
                                    {favoriteCoins.includes(coin.id) ? (
                                        <StarIconSolid className="h-5 w-5 text-yellow-500" />
                                    ) : (
                                        <StarIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </td>
                            <td className="w-[30%] px-6 py-4 whitespace-nowrap">
                                <Link href={`/coin/${coin.id}`} className="flex items-center">
                                    <img src={coin.image} alt={coin.name} className="h-8 w-8 mr-3" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{coin.name}</div>
                                        <div className="text-sm text-gray-500">{coin.symbol.toUpperCase()}</div>
                                    </div>
                                </Link>
                            </td>
                            <td className="w-[20%] px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatPrice(coin.current_price)}</div>
                            </td>
                            <td className="w-[20%] px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {typeof coin.price_change_percentage_24h === 'number'
                                        ? `${coin.price_change_percentage_24h.toFixed(2)}%`
                                        : 'N/A'}
                                </div>
                            </td>
                            <td className="w-[20%] px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatMarketCap(coin.market_cap)}</div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}