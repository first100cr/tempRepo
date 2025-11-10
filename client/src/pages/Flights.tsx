// client/src/pages/Flights.tsx
// UPDATED — Filters + Sorting + Price Trend

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import FlightSearchForm from "@/components/FlightSearchForm";
import FlightResultsInline from "@/components/FlightResultsInline";
import FilterPanel from "@/components/FilterPanel";
import PriceTrendChart45Day from "@/components/PriceTrendChart45Day";
import { Loader2, Plane } from "lucide-react";
import airportHero from "@assets/generated_images/clouds.png";

export default function Flights() {
  const [location] = useLocation();
  const [originalFlights, setOriginalFlights] = useState<any[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useState<any>(null);
  const [isMock, setIsMock] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasAutoSearched = useRef(false);
  const [sortOption, setSortOption] = useState<"recommended" | "price" | "duration">("recommended");

  // ✅ Sorting Helper
  const sortFlights = (flights: any[], option: string) => {
    const sorted = [...flights];

    if (option === "price") {
      sorted.sort((a, b) => Number(a.price.total) - Number(b.price.total));
    }

    if (option === "duration") {
      sorted.sort((a, b) => {
        const durA = a.itineraries[0].durationInMinutes || a.itineraries[0].duration || 9999;
        const durB = b.itineraries[0].durationInMinutes || b.itineraries[0].duration || 9999;
        return durA - durB;
      });
    }

    return sorted;
  };

  // ✅ Filtering Logic
  const applyFilters = (filters: {
    priceRange: [number, number];
    stops: string[];
    airlines: string[];
  }) => {
    let filtered = [...originalFlights];

    // Price
    filtered = filtered.filter(f =>
      Number(f.price.total) >= filters.priceRange[0] &&
      Number(f.price.total) <= filters.priceRange[1]
    );

    // Stops
    if (filters.stops.length > 0) {
      filtered = filtered.filter(f => {
        const stopsCount = f.itineraries[0].segments.length - 1;
        const stopLabel =
          stopsCount === 0 ? "Non-stop" :
          stopsCount === 1 ? "1 stop" :
          "2+ stops";
        return filters.stops.includes(stopLabel);
      });
    }

    // Airlines
    if (filters.airlines.length > 0) {
      filtered = filtered.filter(f =>
        filters.airlines.includes(f.validatingAirlineCodes?.[0])
      );
    }

    // ✅ Apply sorting at the end
    filtered = sortFlights(filtered, sortOption);

    setFilteredFlights(filtered);
  };

  // Auto-search from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const autoSearch = urlParams.get("autoSearch");

    if (autoSearch === "true" && !hasAutoSearched.current) {
      const origin = urlParams.get("origin");
      const destination = urlParams.get("destination");
      const departDate = urlParams.get("departDate");
      const returnDate = urlParams.get("returnDate");
      const passengers = urlParams.get("passengers");
      const tripType = urlParams.get("tripType");

      if (origin && destination && departDate) {
        hasAutoSearched.current = true;

        const params = {
          origin,
          destination,
          departDate,
          returnDate: returnDate || undefined,
          passengers: parseInt(passengers || "1"),
          tripType: tripType || "round-trip"
        };

        setSearchParams(params);
        setLoading(true);
        performSearch(params);
      }
    }
  }, []);

  const performSearch = async (params: any) => {
    try {
      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Search failed");

      setOriginalFlights(data.data || []);
      setFilteredFlights(sortFlights(data.data || [], sortOption));
      setIsMock(data.mock || false);
      setLoading(false);

      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
      }, 150);

    } catch (error) {
      setLoading(false);
      setFilteredFlights([]);
    }
  };

  const handleSearchStart = () => {
    setLoading(true);
    setOriginalFlights([]);
    setFilteredFlights([]);
  };

  const handleSearchComplete = (data: any) => {
    setOriginalFlights(data.flights || []);
    setFilteredFlights(sortFlights(data.flights || [], sortOption));
    setSearchParams(data.searchParams || null);
    setIsMock(data.isMock || false);
    setLoading(false);

    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  const handleSearchError = () => {
    setLoading(false);
    setFilteredFlights([]);
  };

  return (
    <div className="bg-background">
      {/* HERO + SEARCH */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${airportHero})` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/80"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur rounded-2xl p-6 border border-white/30 shadow-xl">
            <FlightSearchForm
              onSearchStart={handleSearchStart}
              onSearchComplete={handleSearchComplete}
              onSearchError={handleSearchError}
              initialValues={searchParams}
            />
          </div>
        </div>
      </section>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}

      {/* RESULTS */}
      {!loading && filteredFlights.length > 0 && (
        <div id="results-section" className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-4 gap-8">

            {/* Filters */}
            <aside className="lg:col-span-1 sticky top-24 space-y-6">
              <FilterPanel onFilterChange={applyFilters} />
            </aside>

            {/* Main */}
            <main className="lg:col-span-3 space-y-6">

              {/* Price Trend Chart */}
              {searchParams && (
                <PriceTrendChart45Day
                  origin={searchParams.origin}
                  destination={searchParams.destination}
                  departDate={searchParams.departDate}
                  passengers={searchParams.passengers}
                />
              )}

              {/* ✅ Sorting UI */}
              <div className="flex items-center justify-end">
                <select
                  className="border rounded-md px-3 py-1 text-sm"
                  value={sortOption}
                  onChange={(e) => {
                    const newSort = e.target.value as any;
                    setSortOption(newSort);
                    setFilteredFlights(sortFlights(filteredFlights, newSort));
                  }}
                >
                  <option value="recommended">Recommended</option>
                  <option value="price">Lowest Price</option>
                  <option value="duration">Fastest Flight</option>
                </select>
              </div>

              {/* Results */}
              <FlightResultsInline
                flights={filteredFlights}
                searchParams={searchParams}
                isMock={isMock}
                loading={false}
              />
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
