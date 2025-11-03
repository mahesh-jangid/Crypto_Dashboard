import { Suspense } from 'react';
import axios from 'axios';
import { Coin } from '@/types/coin';
import { CoinList } from './components/CoinList';
import { LiveDataButton } from './components/LiveDataButton';

async function getInitialCoins(): Promise<Coin[]> {
  const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 50,
      sparkline: false,
    }
  });
  return response.data;
}

export default async function Home() {
  const initialCoins = await getInitialCoins();
  
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Header with Logo and Live Market Data */}
      <div className="sticky top-0 z-20 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Cryptocurrency Market
            </h1>
            <LiveDataButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<div>Loading...</div>}>
            <CoinList initialCoins={initialCoins} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
