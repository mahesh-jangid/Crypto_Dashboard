'use client';

import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useWebSocket } from '@/hooks/useWebSocket';
import { RootState } from '@/lib/store';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { addSymbol, removeSymbol } from '@/lib/store/slices/webSocketSlice';

interface WebSocketModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WebSocketModal({ isOpen, onClose }: WebSocketModalProps) {
    const dispatch = useDispatch();
    const { subscribe, unsubscribe } = useWebSocket();
    const [symbolInput, setSymbolInput] = useState('');
    const [displayCount, setDisplayCount] = useState(10);
    const [loading, setLoading] = useState(false);
    const observerTarget = useRef(null);
    const subscribedSymbols = useSelector((state: RootState) => state.websocket.subscribedSymbols);
    const tradeData = useSelector((state: RootState) => state.websocket.tradeData);
    const connected = useSelector((state: RootState) => state.websocket.connected);

    // Handle infinite scrolling
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && displayCount < subscribedSymbols.length) {
                    setLoading(true);
                    setTimeout(() => {
                        setDisplayCount(prev => Math.min(prev + 10, subscribedSymbols.length));
                        setLoading(false);
                    }, 500);
                }
            },
            { threshold: 0.5 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [displayCount, loading, subscribedSymbols.length]);

    const handleSubscribe = () => {
        if (symbolInput) {
            // Format for crypto trading pairs
            let symbol = symbolInput.toUpperCase().trim();
            if (!symbol.includes(':')) {
                symbol = `BINANCE:${symbol}USDT`;
            }
            
            if (!subscribedSymbols.includes(symbol)) {
                console.log('Subscribing to formatted symbol:', symbol);
                dispatch(addSymbol(symbol));
                subscribe(symbol);
                setSymbolInput('');
            }
        }
    };

    const handleUnsubscribe = (symbol: string) => {
        dispatch(removeSymbol(symbol));
        unsubscribe(symbol);
    };

    // Format the timestamp
    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    // Format the price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg w-full max-w-2xl mx-4 flex flex-col h-[80vh]">
                    {/* Fixed Header */}
                    <div className="flex-none">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-xl font-semibold">Real-time Market Data</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-4 border-b">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={symbolInput}
                                    onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
                                    placeholder="Enter symbol (e.g., BTC for BINANCE:BTCUSDT)"
                                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    onClick={handleSubscribe}
                                    disabled={!connected}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    Subscribe
                                </button>
                            </div>

                            {!connected && (
                                <div className="text-red-600 mt-2">
                                    WebSocket disconnected. Attempting to reconnect...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-4">
                            {subscribedSymbols.slice(0, displayCount).map((symbol) => (
                                <div
                                    key={symbol}
                                    className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold">{symbol}</h3>
                                        <button
                                            onClick={() => handleUnsubscribe(symbol)}
                                            className="text-red-600 hover:text-red-700 text-sm"
                                        >
                                            Unsubscribe
                                        </button>
                                    </div>
                                    {tradeData[symbol] ? (
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <div className="text-gray-500">Price</div>
                                                <div className="font-medium">
                                                    {formatPrice(tradeData[symbol].p)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Volume</div>
                                                <div className="font-medium">
                                                    {tradeData[symbol].v}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Last Update</div>
                                                <div className="font-medium">
                                                    {formatTimestamp(tradeData[symbol].t)}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-gray-500">
                                            <div>Waiting for data... (Symbol: {symbol})</div>
                                            <div className="text-xs mt-1">
                                                Connection status: {connected ? 'Connected' : 'Disconnected'}
                                            </div>
                                            {connected && (
                                                <div className="text-xs mt-1">
                                                    Available symbols: {Object.keys(tradeData).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {subscribedSymbols.length === 0 && (
                                <div className="text-center text-gray-500">
                                    No symbols subscribed. Add a symbol to see real-time data.
                                </div>
                            )}
                            
                            {/* Loading indicator and observer target */}
                            {displayCount < subscribedSymbols.length && (
                                <div
                                    ref={observerTarget}
                                    className="text-center py-4"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                        </div>
                                    ) : (
                                        <div className="text-gray-400">Scroll for more</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                /* Hide scrollbar for Chrome, Safari and Opera */
                .overflow-y-auto::-webkit-scrollbar {
                    display: none;
                }

                /* Hide scrollbar for IE, Edge and Firefox */
                .overflow-y-auto {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}</style>
        </>
    );
}