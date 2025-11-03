'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
    setConnected,
    updateTradeData,
    setError,
} from '@/lib/store/slices/webSocketSlice';

// Replace this with your Finnhub API token
const FINNHUB_TOKEN = 'd43ii6pr01qvk0jc33fgd43ii6pr01qvk0jc33g0';

export function useWebSocket() {
    const dispatch = useDispatch();
    const ws = useRef<WebSocket | null>(null);

    const connect = useCallback(() => {
        if (ws.current?.readyState === WebSocket.OPEN) return;

        ws.current = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_TOKEN}`);

        ws.current.onopen = () => {
            dispatch(setConnected(true));
        };

        ws.current.onclose = () => {
            dispatch(setConnected(false));
            // Attempt to reconnect after 5 seconds
            setTimeout(connect, 5000);
        };

        ws.current.onerror = (error) => {
            dispatch(setError('WebSocket connection error'));
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('WebSocket message received:', data); // Debug log
                
                if (data.type === 'trade') {
                    console.log('Received trade data:', data); // Debug log
                    // Finnhub sends an array of trades
                    data.data.forEach((trade: any) => {
                        console.log('Processing trade:', trade); // Debug individual trade
                        // Ensure the trade has all required fields
                        if (trade && trade.s && typeof trade.p !== 'undefined') {
                            const formattedTrade = {
                                p: parseFloat(trade.p || 0),  // Price
                                s: trade.s,  // Symbol
                                t: trade.t ? trade.t * 1000 : Date.now(), // Convert to milliseconds
                                v: parseFloat(trade.v || 0),  // Volume
                            };
                            console.log('Formatted trade data:', formattedTrade);
                            // Always dispatch valid trade data even if price is 0
                            dispatch(updateTradeData(formattedTrade));
                        } else {
                            console.warn('Invalid trade data received:', trade);
                        }
                    });
                } else if (data.type === 'ping') {
                    // Respond to ping with pong to keep connection alive
                    ws.current?.send(JSON.stringify({ type: 'pong' }));
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
                dispatch(setError('Error processing trade data'));
            }
        };
    }, [dispatch]);

    const subscribe = useCallback((symbol: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'subscribe', symbol }));
        }
    }, []);

    const unsubscribe = useCallback((symbol: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'unsubscribe', symbol }));
        }
    }, []);

    useEffect(() => {
        connect();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [connect]);

    const getConnectionState = useCallback(() => {
        return ws.current?.readyState || WebSocket.CLOSED;
    }, []);

    return {
        subscribe,
        unsubscribe,
        getConnectionState,
    };
}