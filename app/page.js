"use client";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Counts from "./components/Counts";
import Display from "./components/Display";
import FilterHeader from "./components/FilterHeader";
import Searchbar from "./components/Searchbar";
import SearchFor from "./components/SearchFor";
import SearchResults from "./components/SearchResults";
import Status from "./components/Status";
import Options from "./components/Options";
import GridResult from "./components/GridResult";
import { Suspense } from "react";
// Create a cache for API responses
const apiCache = new Map();

 function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = useMemo(
    () => searchParams.toString(),
    [searchParams]
  );

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hits, setHits] = useState([]);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState("");
  const [aggregations, setAggregations] = useState({});
  const [initialAggregations, setInitialAggregations] = useState({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    owners: [],
    attorneys: [],
    law_firms: [],
  });
  // Added selectedView state to store the current view
  const [selectedView, setSelectedView] = useState("List");

  // Don't update URL every time selectedFilters changes
  // Instead, track when user actions change filters
  const [shouldUpdateURL, setShouldUpdateURL] = useState(false);
  const prevSearchParamsRef = useRef("");
  const fetchTimeoutRef = useRef(null);

  // Listen for filter toggle from FilterHeader component
  useEffect(() => {
    const checkFilterState = () => {
      if (
        typeof window !== "undefined" &&
        window.isFilterOpenState !== undefined
      ) {
        setIsFilterOpen(window.isFilterOpenState);
      }
    };

    // Check immediately and set up interval
    checkFilterState();
    const interval = setInterval(checkFilterState, 100);

    return () => clearInterval(interval);
  }, []);

  // Handler for view changes from the Display component
  const handleViewChange = useCallback((view) => {
    setSelectedView(view);
  }, []);

  // Helper function to close filter panel
  const closeFilter = () => {
    setIsFilterOpen(false);
    if (typeof window !== "undefined" && window.toggleFilter) {
      window.isFilterOpenState = false;
    }
  };

  // Helper function to update URL with filters
  const updateURLWithFilters = useCallback(
    (filters) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update filter parameters
      if (filters.status && filters.status.length > 0) {
        params.set("status", filters.status.join(","));
      } else {
        params.delete("status");
      }

      if (filters.owners && filters.owners.length > 0) {
        params.set("owners", filters.owners.join(","));
      } else {
        params.delete("owners");
      }

      if (filters.attorneys && filters.attorneys.length > 0) {
        params.set("attorneys", filters.attorneys.join(","));
      } else {
        params.delete("attorneys");
      }

      if (filters.law_firms && filters.law_firms.length > 0) {
        params.set("law_firms", filters.law_firms.join(","));
      } else {
        params.delete("law_firms");
      }

      // Only update URL if params have actually changed
      const newParamsString = params.toString();
      if (prevSearchParamsRef.current !== newParamsString) {
        prevSearchParamsRef.current = newParamsString;
        router.replace(`/?${newParamsString}`, { scroll: false });
      }
    },
    [router, searchParams]
  );

  // Use callbacks to update filters but don't immediately update URL
  const handleOptionsChange = useCallback(
    (options) => {
      // Directly extract the arrays from options
      const owners = options.Owners || [];
      const attorneys = options.Attorneys || [];
      const lawFirms = options["Law Firms"] || [];

      // Check if anything actually changed
      const hasChanged =
        JSON.stringify(owners) !== JSON.stringify(selectedFilters.owners) ||
        JSON.stringify(attorneys) !==
          JSON.stringify(selectedFilters.attorneys) ||
        JSON.stringify(lawFirms) !== JSON.stringify(selectedFilters.law_firms);

      if (hasChanged) {
        setSelectedFilters((prev) => {
          return {
            ...prev,
            owners: owners,
            attorneys: attorneys,
            law_firms: lawFirms,
          };
        });

        setShouldUpdateURL(true);
      }
    },
    [selectedFilters]
  );

  const handleStatusChange = useCallback((activeStatuses) => {
    setSelectedFilters((prev) => ({
      ...prev,
      status: activeStatuses || [],
    }));
    setShouldUpdateURL(true);
  }, []);

  useEffect(() => {
    const inputQuery = searchParams.get("query") || "nike";

    // Reset filters when inputQuery changes
    setSelectedFilters({
      status: [],
      owners: [],
      attorneys: [],
      law_firms: [],
    });

    setShouldUpdateURL(false); // Prevent unnecessary URL updates

    // Reset the URL to remove filter params when inputQuery changes
    const params = new URLSearchParams();
    params.set("query", inputQuery);
    params.set("country", "us");

    router.replace(`/?${params.toString()}`, { scroll: false });
  }, [searchParams.get("query"), router]);

  // Initialize from URL params on first load
  useEffect(() => {
    if (isInitialLoad) {
      const params = new URLSearchParams(searchParams.toString());
      let needsRedirect = false;

      // Set default parameters if missing
      if (!params.has("country")) {
        params.set("country", "us");
        needsRedirect = true;
      }

      if (!params.has("query")) {
        params.set("query", "nike");
        needsRedirect = true;
      }

      // Read filter values from URL if they exist
      const statusParam = params.get("status");
      const ownersParam = params.get("owners");
      const attorneysParam = params.get("attorneys");
      const lawFirmsParam = params.get("law_firms");

      // Parse URL parameters into filter state
      const initialFilters = {
        status: statusParam ? statusParam.split(",") : [],
        owners: ownersParam ? ownersParam.split(",") : [],
        attorneys: attorneysParam ? attorneysParam.split(",") : [],
        law_firms: lawFirmsParam ? lawFirmsParam.split(",") : [],
      };

      // Update state with filter values from URL
      setSelectedFilters(initialFilters);

      if (needsRedirect) {
        router.replace(`/?${params.toString()}`, { scroll: false });
      }

      // Initialize prevSearchParamsRef with current URL params
      prevSearchParamsRef.current = params.toString();
      setIsInitialLoad(false);
    }
  }, [searchParams, router, isInitialLoad]);

  // Separate effect to update URL when filters change due to user action
  useEffect(() => {
    if (shouldUpdateURL && !isInitialLoad) {
      updateURLWithFilters(selectedFilters);
      setShouldUpdateURL(false);
    }
  }, [selectedFilters, shouldUpdateURL, isInitialLoad, updateURLWithFilters]);

  // Debounced fetch data function to prevent rapid re-renders
  const debouncedFetchData = useCallback(() => {
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Set new timeout
    fetchTimeoutRef.current = setTimeout(() => {
      if (isInitialLoad) return;

      const fetchData = async () => {
        setLoading(true);
        setError(null);

        const inputQuery = searchParams.get("query") || "nike";
        const country = searchParams.get("country") || "us";

        // Use selectedFilters directly from state
        const { status, owners, attorneys, law_firms } = selectedFilters;

        // Check if this is a filtered search
        const isFilteredSearch =
          status.length > 0 ||
          owners.length > 0 ||
          attorneys.length > 0 ||
          law_firms.length > 0;

        // Create a cache key based on all parameters
        const cacheKey = `${inputQuery}-${status.join(
          ","
        )}-${country}-${owners.join(",")}-${attorneys.join(
          ","
        )}-${law_firms.join(",")}`;

        // Check cache first
        if (apiCache.has(cacheKey)) {
          const cachedData = apiCache.get(cacheKey);
          setData(cachedData);
          setHits(cachedData.hits?.hits || []);
          setTotal(cachedData.hits?.total?.value || "");
          setAggregations(cachedData.aggregations || {});

          // Only update initialAggregations on non-filtered searches
          if (!isFilteredSearch) {
            setInitialAggregations(cachedData.aggregations || {});
          }

          setLoading(false);
          return;
        }

        // Prepare request body - use selectedFilters directly
        const body = {
          input_query: inputQuery,
          input_query_type: "",
          sort_by: "default",
          status: status,
          exact_match: false,
          date_query: false,
          owners: owners,
          attorneys: attorneys,
          law_firms: law_firms,
          mark_description_description: [],
          classes: [],
          page: 1,
          rows: 10,
          sort_order: "desc",
          states: [],
          counties: [],
        };

        try {
          const response = await fetch(
            "https://vit-tm-task.api.trademarkia.app/api/v3/us",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
              next: { revalidate: 3600 }, // Cache for 1 hour
            }
          );

          if (!response.ok) {
            throw new Error(
              `API Error: ${response.status} ${response.statusText}`
            );
          }

          const result = await response.json();

          if (!result.body || !result.body.hits) {
            throw new Error("Invalid response format from API");
          }

          // Store in cache
          apiCache.set(cacheKey, result.body);

          setData(result.body);
          setHits(result.body.hits?.hits || []);
          setTotal(result.body.hits?.total?.value || "");
          setAggregations(result.body.aggregations || {});

          // Only update initialAggregations on non-filtered searches
          if (!isFilteredSearch) {
            setInitialAggregations(result.body.aggregations || {});
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setError(error.message);
          setHits([]);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, 300); // 300ms debounce time
  }, [searchParamsString, selectedFilters, isInitialLoad, searchParams]);

  // Use effect to trigger the debounced fetch
  useEffect(() => {
    debouncedFetchData();

    // Clean up function
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [debouncedFetchData]);

  // Memoize the components that don't need to re-render on every change
  const memoizedOptions = useMemo(
    () => (
      <Options
        aggregations={initialAggregations || {}}
        loading={loading}
        onOptionsChange={handleOptionsChange}
        selectedFilters={selectedFilters}
      />
    ),
    [initialAggregations, loading, handleOptionsChange, selectedFilters]
  );

  const memoizedStatus = useMemo(
    () => (
      <Status
        onStatusChange={handleStatusChange}
        selectedStatus={selectedFilters.status}
      />
    ),
    [handleStatusChange, selectedFilters.status]
  );

  // Updated search results section to conditionally render based on view and screen size
  const memoizedSearchResults = useMemo(() => {
    if (error) {
      return (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded">
          Error loading results: {error}. Please try again later.
        </div>
      );
    }

    return (
      <div className="pb-[5rem]">
        {/* For desktop view (lg and above) - show either Grid or List based on selection */}
        <div className="hidden lg:block">
          {selectedView === "Grid" ? (
            <GridResult hits={hits} loading={loading} />
          ) : (
            <SearchResults hits={hits} loading={loading} />
          )}
        </div>

        {/* For mobile view (below lg) - always show GridResult */}
        <div className="lg:hidden">
          <GridResult hits={hits} loading={loading} />
        </div>
      </div>
    );
  }, [error, hits, loading, selectedView]);

  return (
    <div>
      <Searchbar />
      <div className="px-[10px] sm:px-[40px]">
        <Counts total={total} />
        <div className="flex justify-between gap-[20px]">
          <div className="w-full lg:w-auto">
            <SearchFor />
            <div className="lg:hidden w-full">
              <FilterHeader />
            </div>
            {memoizedSearchResults}
          </div>

          {/* Desktop Filter Panel (lg and above) */}
          <div className="hidden lg:block lg:w-[296px]">
            <FilterHeader />
            <div>
              {memoizedStatus}
              {memoizedOptions}
              <Display
                onViewChange={handleViewChange}
                initialView={selectedView}
              />
            </div>
          </div>

          {/* Mobile Filter Panel (absolute positioned) */}
          {isFilterOpen && (
            <div className="fixed inset-0 bg-[#0000004d] bg-opacity-20 z-40 lg:hidden">
              <div className="absolute right-0 top-0 h-full w-[300px] bg-white z-50 overflow-y-auto">
                <div className="p-4 flex justify-between items-center">
                  <button
                    onClick={closeFilter}
                    className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full hover:bg-gray-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  {memoizedStatus}
                  {memoizedOptions}
                  <Display
                    onViewChange={handleViewChange}
                    initialView={selectedView}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading search page...</div>}>
      <HomeContent />
    </Suspense>
  );
}