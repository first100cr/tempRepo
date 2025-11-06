// client/src/pages/Flights.tsx
// UPDATED VERSION - With 45-Day Price Trend Chart Integration

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import FlightSearchForm from "@/components/FlightSearchForm";
import FlightResultsInline from "@/components/FlightResultsInline";
import FilterPanel from "@/components/FilterPanel";
import AIPredictionPanel from "@/components/AIPredictionPanel";
import PriceTrendChart45Day from '@/components/PriceTrendChart45Day'; // 🆕 NEW IMPORT
import { Loader2, Plane } from "lucide-react";
import airportHero from "@assets/generated_images/clouds.png";

export default function Flights() {
  const [location] = useLocation();
  const [flights, setFlights] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useState<any>(null);
  const [isMock, setIsMock] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasAutoSearched = useRef(false);

  console.log("🎨 Flights page rendering:", { 
    loading, 
    flightsCount: flights.length 
  });

  // Auto-search when URL parameters are present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const autoSearch = urlParams.get('autoSearch');
    
    if (autoSearch === 'true' && !hasAutoSearched.current) {
      const origin = urlParams.get('origin');
      const destination = urlParams.get('destination');
      const departDate = urlParams.get('departDate');
      const returnDate = urlParams.get('returnDate');
      const passengers = urlParams.get('passengers');
      const tripType = urlParams.get('tripType');

      if (origin && destination && departDate) {
        console.log('🚀 Auto-triggering search from URL params:', {
          origin,
          destination,
          departDate,
          returnDate,
          passengers,
          tripType
        });

        hasAutoSearched.current = true;

        // Set the search params for the form
        const params = {
          origin,
          destination,
          departDate,
          returnDate: returnDate || undefined,
          passengers: parseInt(passengers || '1'),
          tripType: tripType || 'round-trip'
        };

        setSearchParams(params);
        setLoading(true);

        // Trigger the search automatically (call API directly)
        performSearch(params);
      }
    }
  }, []);

  const performSearch = async (params: any) => {
    try {
      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: params.origin.toUpperCase(),
          destination: params.destination.toUpperCase(),
          departDate: params.departDate,
          returnDate: params.returnDate,
          passengers: params.passengers,
          tripType: params.tripType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Search failed");
      }

      console.log("✅ Auto-search completed:", data);

      setFlights(data.data || []);
      setIsMock(data.mock || false);
      setLoading(false);

      // Scroll to results
      setTimeout(() => {
        const element = document.getElementById('results-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error: any) {
      console.error("❌ Auto-search error:", error);
      setLoading(false);
      setFlights([]);
    }
  };

  const handleSearchStart = () => {
    console.log("🚀 Manual search started");
    setLoading(true);
    setFlights([]); // Clear previous results
  };

  const handleSearchComplete = (data: any) => {
    console.log("🔥 Search complete, received data:", {
      hasFlights: !!data.flights,
      flightsLength: data.flights?.length,
      flights: data.flights
    });
    
    setFlights(data.flights || []);
    setSearchParams(data.searchParams || null);
    setIsMock(data.isMock || false);
    setLoading(false);
    
    console.log("✅ State updated, flights:", data.flights?.length);
    
    // Scroll to results
    setTimeout(() => {
      const element = document.getElementById('results-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleSearchError = (error: string) => {
    console.log("❌ Search error:", error);
    setLoading(false);
    setFlights([]);
  };

  return (
    <div className="bg-background">
      {/* HERO SECTION WITH AIRPORT BACKGROUND */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${airportHero})`,
          }}
        >
          {/* Dark overlay for form readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
        </div>
        
        {/* SEARCH FORM SECTION */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-2xl">
              <FlightSearchForm 
                onSearchStart={handleSearchStart}
                onSearchComplete={handleSearchComplete}
                onSearchError={handleSearchError}
                initialValues={searchParams}
              />
            </div>
          </div>
        </div>
      </section>

      {/* LOADING STATE */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {console.log("⏳ SHOWING LOADING STATE")}
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-8">
              <Plane className="h-16 w-16 text-primary animate-bounce" />
              <Loader2 className="h-20 w-20 text-primary/30 animate-spin absolute -top-2 -left-2" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-foreground">
              Searching for flights...
            </h3>
            <p className="text-muted-foreground mb-2">
              Finding the best options for you
            </p>
            {searchParams && (
              <p className="text-sm text-muted-foreground">
                {searchParams.origin} → {searchParams.destination}
              </p>
            )}
            <div className="flex gap-2 mt-6">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse delay-75"></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS SECTION */}
      {!loading && flights.length > 0 && (
        <div id="results-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {console.log("✅ RENDERING RESULTS SECTION with", flights.length, "flights")}
          
          <div className="grid lg:grid-cols-4 gap-8">
            
            {/* LEFT SIDEBAR - Filters */}
            <aside className="lg:col-span-1">
              <div className="space-y-6 sticky top-24">
                <FilterPanel onFilterChange={(filters) => console.log('Filters:', filters)} />
              </div>
            </aside>

            {/* MAIN CONTENT - 45-Day Price Trend, AI Predictions, and Results */}
            <main className="lg:col-span-3 space-y-6">
              
              {/* 🆕 45-DAY PRICE TREND CHART (NEW!) */}
              {searchParams && (
                <PriceTrendChart45Day
                  origin={searchParams.origin}
                  destination={searchParams.destination}
                  departDate={searchParams.departDate}
                  passengers={searchParams.passengers || 1}
                  onDateSelect={(date, flightData) => {
                    console.log('User selected date from price chart:', date);
                    // Optional: Update the search params and trigger a new search
                    // or scroll to the flights section, etc.
                  }}
                />
              )}

              
              {/* FLIGHT RESULTS WITH PAGINATION */}
              <FlightResultsInline
                flights={flights}
                searchParams={searchParams}
                isMock={isMock}
                loading={false}
              />
            </main>
          </div>
        </div>
      )}

      {/* EMPTY STATE - Before any search */}
      {!loading && flights.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {console.log("📭 SHOWING EMPTY STATE")}
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-7xl mb-6">✈️</div>
            <h2 className="text-2xl font-semibold mb-3">Start Your Journey</h2>
            <p className="text-muted-foreground mb-6">
              Enter your travel details above to find the best flight options
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 border rounded-lg">
                <div className="text-3xl mb-2">🔍</div>
                <div className="font-medium mb-1">Smart Search</div>
                <div className="text-xs text-muted-foreground">
                  AI-powered flight recommendations
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-3xl mb-2">💰</div>
                <div className="font-medium mb-1">Best Prices</div>
                <div className="text-xs text-muted-foreground">
                  Compare across multiple airlines
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-3xl mb-2">📊</div>
                <div className="font-medium mb-1">45-Day Price Trends</div>
                <div className="text-xs text-muted-foreground">
                  See 30 days before + 15 days after
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}












