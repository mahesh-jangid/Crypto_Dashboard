'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
    setConnected,
    updateTradeData,
    setError,
} from '@/lib/store/slices/webSocketSlice';

// Replace this with your Finnhub API token
const FINNHUB_TOKEN = 'd448189r01qge0d0vh8gd448189r01qge0d0vh90';

export function useWebSocket() {
    const dispatch = useDispatch();
    const ws = useRef<WebSocket | null>(null);
    const reconnectAttempts = useRef(0);
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 2000; // 2 seconds
    const CONNECTION_TIMEOUT = 10000; // 10 seconds
    
    const connect = useCallback(() => {
        if (ws.current?.readyState === WebSocket.OPEN) return;
        
        // Reset connection if we've reached max attempts
        if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
            dispatch(setError('Maximum reconnection attempts reached. Please try again later.'));
            return;
        }

        const socket = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_TOKEN}`);
        ws.current = socket;
        
        // Set connection timeout
        const timeoutId = setTimeout(() => {
            if (socket.readyState !== WebSocket.OPEN) {
                socket.close();
                dispatch(setError('Connection timeout. Please check your internet connection.'));
            }
        }, CONNECTION_TIMEOUT);

        socket.onopen = () => {
            clearTimeout(timeoutId);
            reconnectAttempts.current = 0;
            dispatch(setConnected(true));
            console.log('WebSocket connected successfully');
        };

        socket.onclose = (event) => {
            clearTimeout(timeoutId);
            dispatch(setConnected(false));
            console.log(`WebSocket closed with code: ${event.code}, reason: ${event.reason}`);
            
            // Increment reconnection attempts
            reconnectAttempts.current++;
            
            if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
                console.log(`Attempting to reconnect (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`);
                setTimeout(connect, RECONNECT_DELAY);
            } else {
                dispatch(setError('Connection lost. Maximum reconnection attempts reached.'));
            }
        };

        socket.onerror = (event: Event) => {
            console.error('WebSocket error:', event);
            dispatch(setError('WebSocket connection error. Please check your internet connection.'));
        };

        // Add connection state monitoring
        const checkConnection = setInterval(() => {
            if (socket.readyState === WebSocket.CONNECTING) {
                console.log('Still connecting to WebSocket...');
            }
        }, 1000);

        socket.onmessage = (event) => {
            // Clear the connection check interval once we start receiving messages
            clearInterval(checkConnection);
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
                    socket.send(JSON.stringify({ type: 'pong' }));
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
                dispatch(setError('Error processing trade data'));
            }
        };
    }, [dispatch, MAX_RECONNECT_ATTEMPTS, RECONNECT_DELAY]);

    const subscribe = useCallback((symbol: string) => {
        if (!symbol) return;
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'subscribe', symbol }));
        }
    }, []);

    const unsubscribe = useCallback((symbol: string) => {
        if (!symbol) return;
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