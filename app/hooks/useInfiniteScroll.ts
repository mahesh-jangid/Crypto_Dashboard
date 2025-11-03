'use client';

import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll(onLoadMore: () => void, hasMore: boolean, containerId?: string) {
    const loadingRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleScroll = useCallback(() => {
        if (!hasMore || loadingRef.current) return;

        const container = containerId ? document.getElementById(containerId) : document.documentElement;
        if (!container) return;

        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        // If we're near the bottom (within 100px)
        if (scrollHeight - scrollTop - clientHeight < 100) {
            loadingRef.current = true;

            // Debounce the load more call
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                onLoadMore();
                loadingRef.current = false;
            }, 200);
        }
    }, [hasMore, onLoadMore, containerId]);

    useEffect(() => {
        const container = containerId ? document.getElementById(containerId) : window;
        if (!container) return;

        container.addEventListener('scroll', handleScroll);
        
        return () => {
            container.removeEventListener('scroll', handleScroll);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [containerId, handleScroll]);

    return useCallback((node: HTMLDivElement | null) => {
        // Initial check when component mounts
        setTimeout(handleScroll, 100);
    }, [handleScroll]);
}