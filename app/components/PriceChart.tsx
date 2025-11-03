'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';

interface PriceChartProps {
    coinId: string;
}

interface ChartData {
    timestamp: number;
    price: number;
    volume: number;
    marketCap: number;
}

type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y';

interface TimeRangeOption {
    label: string;
    value: TimeRange;
    interval: string;
}

export const PriceChart = React.memo(({ coinId }: PriceChartProps) => {
    const [data, setData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('7d');
    const [chartType, setChartType] = useState<'price' | 'volume' | 'marketCap'>('price');

    const timeRangeOptions: TimeRangeOption[] = useMemo(() => [
        { label: '24h', value: '24h', interval: 'hourly' },
        { label: '7d', value: '7d', interval: 'daily' },
        { label: '30d', value: '30d', interval: 'daily' },
        { label: '90d', value: '90d', interval: 'daily' },
        { label: '1y', value: '1y', interval: 'weekly' },
    ], []);

    const fetchChartData = useCallback(async () => {
        try {
            const response = await axios.get(
                `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
                {
                    params: {
                        vs_currency: 'usd',
                        days: timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365,
                        interval: timeRangeOptions.find(opt => opt.value === timeRange)?.interval || 'daily',
                    },
                }
            );

            const formattedData = response.data.prices.map((price: [number, number], index: number) => ({
                timestamp: price[0],
                price: price[1],
                volume: response.data.total_volumes[index][1],
                marketCap: response.data.market_caps[index][1],
            }));

            setData(formattedData);
            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
            setLoading(false);
        }
    }, [coinId, timeRange, timeRangeOptions]);

    useEffect(() => {
        setLoading(true);
        fetchChartData();
    }, [fetchChartData]);

    if (loading) {
        return <div className="flex items-center justify-center h-full">Loading chart data...</div>;
    }

    if (error) {
        return <div className="text-red-600">Error loading chart data: {error}</div>;
    }

    const formatValue = useCallback((value: number, type: 'price' | 'volume' | 'marketCap') => {
        if (type === 'price') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(value);
        } else if (type === 'volume') {
            return new Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumFractionDigits: 1,
            }).format(value);
        } else {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact',
                maximumFractionDigits: 1,
            }).format(value);
        }
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                    {timeRangeOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setTimeRange(option.value)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                timeRange === option.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <div className="flex space-x-2">
                    {(['price', 'volume', 'marketCap'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setChartType(type)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                chartType === type
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'volume' ? (
                        <BarChart
                            data={data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={(timestamp) => 
                                    timeRange === '24h'
                                        ? new Date(timestamp).toLocaleTimeString()
                                        : new Date(timestamp).toLocaleDateString()
                                }
                            />
                            <YAxis
                                tickFormatter={(value) => formatValue(value, 'volume')}
                            />
                            <Tooltip
                                labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                                formatter={(value: number) => formatValue(value, 'volume')}
                            />
                            <Bar
                                dataKey="volume"
                                fill="#4f46e5"
                                opacity={0.8}
                            />
                        </BarChart>
                    ) : (
                        <LineChart
                            data={data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={(timestamp) => 
                                    timeRange === '24h'
                                        ? new Date(timestamp).toLocaleTimeString()
                                        : new Date(timestamp).toLocaleDateString()
                                }
                            />
                            <YAxis
                                tickFormatter={(value) => 
                                    formatValue(value, chartType)
                                }
                            />
                            <Tooltip
                                labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                                formatter={(value: number) => formatValue(value, chartType)}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey={chartType}
                                stroke="#4f46e5"
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
});
