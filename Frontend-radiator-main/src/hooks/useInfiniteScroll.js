import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook for infinite scroll with pagination
 * @param {Function} fetchFunction - Function to fetch data (should accept pageNumber, pageSize)
 * @param {number} pageSize - Number of items per page (default: 20)
 * @param {boolean} autoScroll - Enable auto-scroll detection (default: false)
 * @returns {Object} - { items, loading, error, hasMore, loadMore, reset, refetch, observerRef }
 */
export const useInfiniteScroll = (fetchFunction, pageSize = 20, autoScroll = false) => {
  const [items, setItems] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Use ref to track if initial fetch has been done
  const hasFetchedRef = useRef(false);

  // Ref for the observer target element
  const observerRef = useRef(null);

  const fetchData = useCallback(async (page) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction(page, pageSize);

      if (result.success && result.data) {
        // Handle both array response and paginated response
        let newItems, total, hasNextPage;

        if (Array.isArray(result.data)) {
          // Non-paginated response (array)
          newItems = result.data;
          total = result.data.length;
          hasNextPage = false;
        } else {
          // Paginated response (PagedResult object)
          newItems = result.data.items || result.data.Items || [];
          total = result.data.totalCount || result.data.TotalCount || 0;
          hasNextPage = result.data.hasNextPage !== undefined
            ? result.data.hasNextPage
            : (result.data.HasNextPage !== undefined ? result.data.HasNextPage : false);
        }

        setItems((prevItems) => {
          // If page 1, replace all items
          if (page === 1) {
            return newItems || [];
          }
          // Otherwise append new items
          return [...prevItems, ...(newItems || [])];
        });

        setTotalCount(total || 0);
        setHasMore(hasNextPage);
      } else {
        setError(result.error || "Failed to fetch data");
        setHasMore(false);
      }
    } catch (err) {
      setError(err.message || "An error occurred");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, pageSize, loading]);

  // Initial fetch
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchData(1);
    }
  }, [fetchData]);

  // Load more function
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = pageNumber + 1;
      setPageNumber(nextPage);
      fetchData(nextPage);
    }
  }, [pageNumber, loading, hasMore, fetchData]);

  // Reset function (clear all data and start from page 1)
  const reset = useCallback(() => {
    setItems([]);
    setPageNumber(1);
    setHasMore(true);
    setError(null);
    setTotalCount(0);
    hasFetchedRef.current = false;
  }, []);

  // Refetch function (reload from page 1)
  const refetch = useCallback(() => {
    setItems([]);
    setPageNumber(1);
    setHasMore(true);
    setError(null);
    fetchData(1);
  }, [fetchData]);

  // Intersection Observer for auto-scroll
  useEffect(() => {
    if (!autoScroll) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && hasMore) {
          loadMore();
        }
      },
      {
        root: null, // viewport
        rootMargin: '1200px', // trigger 1200px (~5-6 rows) before reaching the bottom for seamless loading
        threshold: 0.1,
      }
    );

    const currentObserver = observerRef.current;
    if (currentObserver) {
      observer.observe(currentObserver);
    }

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver);
      }
    };
  }, [autoScroll, loading, hasMore, loadMore]);

  return {
    items,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore,
    reset,
    refetch,
    observerRef, // Return ref to attach to the trigger element
  };
};
