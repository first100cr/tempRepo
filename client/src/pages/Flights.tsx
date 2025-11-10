// client/src/pages/Flights.tsx
// FINAL — Filters + Sorting + No Results State + Correct Response Handling

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import FlightSearchForm from "@/components/FlightSearchForm";
import FlightResultsInline from "@/components/FlightResultsInline";
import FilterPanel from "@/components/FilterPanel";
import PriceTrendChart45Day from "@/components/PriceTrendChart45Day";
import { Loader2 } from "lucide-react";
import airportHero from "@assets/generated_images/clouds.png";

export default function Flights() {
  const [location] = useLocation();

  // ✅ Base & Filtered Flights
  const [baseFlights, setBaseFlights] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);

  // ✅ Search state
  const [searchParams, setSearchParams] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // ✅ Needed for No Results UI

  // ✅ Sorting
  const [sortOption, setSortOption] = useState<"recommended" | "price" | "duration">("recommended");

  // ✅ Dynamic Price Range
  const [priceDomain, setPriceDomain] = useState({ min: 0, max: 20000 });

  const hasAutoSearched = useRef(false);

  // ✅ Sorting Helper
  const sortFlights = (list: any[], option = sortOption) => {
    const sorted = [...list];

    if (option === "price") sorted.sort((a, b) => a.price - b.price);

    if (option === "duration") {
      const extractMinutes = (d: string) => {
        const m = d.match(/PT(\d+H)?(\d+M)?/);
        const hours = m?.[1] ? parseInt(m[1]) : 0;
        const mins = m?.[2] ? parseInt(m[2]) : 0;
        return hours * 60 + mins;
      };
      sorted.sort((a, b) => extractMinutes(a.duration) - extractMinutes(b.duration));
    }

    return sorted;
  };

  // ✅ Filtering Logic (Matches FlightResult format)
  const applyFilters = (filters: {
    priceRange: [number, number];
    stops: string[];
    airlines: string[];
  }) => {
    let filtered = [...baseFlights];

    // Price
    filtered = filtered.filter(
      (f) => f.price >= filters.priceRange[0] && f.price <= filters.priceRange[1]
    );

    // Stops
    if (filters.stops.length > 0) {
      filtered = filtered.filter((f) => {
        const label =
          f.stops === 0 ? "Non-stop" :
          f.stops === 1 ? "1 stop" :
          "2+ stops";
        return filters.stops.includes(label);
      });
    }

    // Airline
    if (filters.airlines.length > 0) {
      filtered = filtered.filter((f) => filters.airlines.includes(f.airline));
    }

    setFlights(sortFlights(filtered));
  };

  // ✅ Perform backend search
  const performSearch = async (params: any) => {
    try {
      setLoading(true);
      setHasSearched(true);

      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      const list = data.data || [];

      setBaseFlights(list);
      setFlights(sortFlights(list));
      setSearchParams(params);
      setLoading(false);

    } catch (err) {
      setLoading(false);
      setFlights([]); // show no results UI
    }
  };

  // ✅ Trigger API search when returning from Home
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("autoSearch") === "true" && !hasAutoSearched.current) {
      hasAutoSearched.current = true;
      performSearch({
        origin: params.get("origin"),
        destination: params.get("destination"),
        departDate: params.get("departDate"),
        returnDate: params.get("returnDate") || undefined,
        passengers: parseInt(params.get("passengers") || "1"),
        tripType: params.get("tripType") || "round-trip",
      });
    }
  }, []);

  // ✅ Search Form Callbacks
  const handleSearchStart = () => {
    setLoading(true);
    setHasSearched(true);
  };

  const handleSearchComplete = (data: any) => {
    const list = data.flights || data.data || [];
    setBaseFlights(list);
    setFlights(sortFlights(list));
    setSearchParams(data.searchParams);
    setLoading(false);
    setHasSearched(true);
  };

  // ✅ Recompute price range when flights change
  useEffect(() => {
    if (baseFlights.length === 0) return;
    const prices = baseFlights.map((f) => f.price);
    setPriceDomain({ min: Math.min(...prices), max: Math.max(...prices) });
  }, [baseFlights]);

  return (
    <div className="bg-background">

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${airportHero})` }}>
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg">
            <FlightSearchForm
              onSearchStart={handleSearchStart}
              onSearchComplete={handleSearchComplete}
            />
          </div>
        </div>
      </section>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}

      {/* ✅ RESULTS */}
      {!loading && flights.length > 0 && (
        <div id="results-section" className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-4 gap-8">

          {/* FILTERS */}
          <aside className="lg:col-span-1 sticky top-24">
            <FilterPanel
              onFilterChange={applyFilters}
              priceRangeInitial={[priceDomain.min, priceDomain.max]}
              airlineOptions={Array.from(new Set(baseFlights.map((f) => f.airline))).sort()}
            />
          </aside>

          {/* RESULTS + SORT + TREND */}
          <main className="lg:col-span-3 space-y-6">
            {searchParams && (
              <PriceTrendChart45Day
                origin={searchParams.origin}
                destination={searchParams.destination}
                departDate={searchParams.departDate}
                passengers={searchParams.passengers}
              />
            )}

            <div className="flex justify-end">
              <select
                className="border rounded px-3 py-1"
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value as any);
                  setFlights(sortFlights(flights, e.target.value));
                }}
              >
                <option value="recommended">Recommended</option>
                <option value="price">Lowest Price</option>
                <option value="duration">Fastest</option>
              </select>
            </div>

            <FlightResultsInline flights={flights} searchParams={searchParams} />
          </main>

        </div>
      )}

      {/* ✅ NO RESULTS MESSAGE */}
      {!loading && hasSearched && flights.length === 0 && (
        <div className="max-w-3xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-2xl font-semibold mb-3">No Flights Found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your airports, dates, or filters.</p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-6 py-3 rounded-md bg-primary text-white hover:bg-primary/90 transition"
          >
            Modify Search
          </button>
        </div>
      )}

    </div>
  );
}
