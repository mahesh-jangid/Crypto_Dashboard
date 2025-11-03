import { fetchCoinDetails } from '@/lib/store/slices/coinsSlice';
import { CoinDetails } from '@/components/CoinDetails';
import { store } from '@/lib/store';
import { RootState } from '@/lib/store';

interface PageProps {
    params: {
        id: string;
    };
}

export default async function CoinPage({ params }: PageProps) {
    // Fetch coin details on the server
    await store.dispatch(fetchCoinDetails(params.id));
    const state = store.getState() as RootState;
    const coin = state.coins.selectedCoin;

    if (!coin) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Coin not found
                        </h1>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <CoinDetails coin={coin} />
            </div>
        </div>
    );
}