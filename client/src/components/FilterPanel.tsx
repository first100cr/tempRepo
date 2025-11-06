import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FlightCard from "@/components/FlightCard";
import FilterPanel from "@/components/FilterPanel";
import PriceTrendChart45Day from "@/components/PriceTrendChart45Day";
import { ArrowLeftRight, Calendar, Loader2, MapPin, Search, Users } from "lucide-react";
import { format } from "date-fns";

interface SearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  tripType: string;
}

interface Filters {
  priceRange: [number, number];
  stops: string[];
  airlines: string[];
}

export default function Flights() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    origin: "",
    destination: "",
    departDate: "",
    returnDate: "",
    passengers: 1,
    tripType: "round-trip"
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 20000],
    stops: [],
    airlines: []
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchParams),
      });

      const data = await response.json();
      
      if (data.success) {
        setFlights(data.data);
        setFilteredFlights(data.data); // Initially show all flights
      } else {
        console.error("Search failed:", data.error);
        setFlights([]);
        setFilteredFlights([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setFlights([]);
      setFilteredFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    applyFilters(flights, newFilters);
  };

  const applyFilters = (flightsToFilter: any[], appliedFilters: Filters) => {
    let filtered = [...flightsToFilter];

    // Filter by price range
    filtered = filtered.filter(
      flight => flight.price >= appliedFilters.priceRange[0] && 
                flight.price <= appliedFilters.priceRange[1]
    );

    // Filter by stops
    if (appliedFilters.stops.length > 0) {
      filtered = filtered.filter(flight => {
        const flightStops = flight.stops || 0;
        
        if (appliedFilters.stops.includes("Non-stop") && flightStops === 0) return true;
        if (appliedFilters.stops.includes("1 stop") && flightStops === 1) return true;
        if (appliedFilters.stops.includes("2+ stops") && flightStops >= 2) return true;
        
        return false;
      });
    }

    // Filter by airlines
    if (appliedFilters.airlines.length > 0) {
      filtered = filtered.filter(flight => 
        appliedFilters.airlines.includes(flight.airline)
      );
    }

    setFilteredFlights(filtered);
  };

  const handleSwapLocations = () => {
    setSearchParams(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Search Flights</h1>
          <p className="text-muted-foreground">
            Find the best deals on flights worldwide
          </p>
        </div>

        {/* Search Form */}
        <Card className="p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="space-y-6">
              {/* Trip Type */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Trip Type</Label>
                <RadioGroup
                  value={searchParams.tripType}
                  onValueChange={(value) => setSearchParams(prev => ({ ...prev, tripType: value }))}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="round-trip" id="round-trip" />
                    <Label htmlFor="round-trip" className="cursor-pointer">Round Trip</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="one-way" id="one-way" />
                    <Label htmlFor="one-way" className="cursor-pointer">One Way</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                <div>
                  <Label htmlFor="origin" className="mb-2 block">From</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="origin"
                      placeholder="Origin (e.g., DEL)"
                      value={searchParams.origin}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, origin: e.target.value.toUpperCase() }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="destination" className="mb-2 block">To</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="destination"
                      placeholder="Destination (e.g., BOM)"
                      value={searchParams.destination}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value.toUpperCase() }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-1 hidden md:flex z-10"
                  onClick={handleSwapLocations}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departDate" className="mb-2 block">Departure Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="departDate"
                      type="date"
                      value={searchParams.departDate}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, departDate: e.target.value }))}
                      className="pl-10"
                      required
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                </div>

                {searchParams.tripType === "round-trip" && (
                  <div>
                    <Label htmlFor="returnDate" className="mb-2 block">Return Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="returnDate"
                        type="date"
                        value={searchParams.returnDate}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, returnDate: e.target.value }))}
                        className="pl-10"
                        min={searchParams.departDate || format(new Date(), 'yyyy-MM-dd')}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Passengers */}
              <div>
                <Label htmlFor="passengers" className="mb-2 block">Passengers</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="passengers"
                    type="number"
                    min="1"
                    max="9"
                    value={searchParams.passengers}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, passengers: parseInt(e.target.value) || 1 }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Search Button */}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search Flights
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Results Section with Filters */}
        {hasSearched && !loading && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {filteredFlights.length > 0 
                  ? `${filteredFlights.length} Flight${filteredFlights.length !== 1 ? 's' : ''} Found`
                  : "No Flights Found"}
              </h2>
              {flights.length > 0 && filteredFlights.length !== flights.length && (
                <p className="text-sm text-muted-foreground">
                  (Filtered from {flights.length} total flights)
                </p>
              )}
            </div>

            {/* 45-Day Price Trend Chart */}
            {flights.length > 0 && searchParams.origin && searchParams.destination && searchParams.departDate && (
              <PriceTrendChart45Day
                origin={searchParams.origin}
                destination={searchParams.destination}
                departDate={searchParams.departDate}
                passengers={searchParams.passengers}
              />
            )}

            {/* Main Content: Filters + Results */}
            {flights.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filter Panel (Sidebar) */}
                <div className="lg:col-span-1">
                  <div className="sticky top-4">
                    <FilterPanel onFilterChange={handleFilterChange} />
                  </div>
                </div>

                {/* Flight Results */}
                <div className="lg:col-span-3">
                  {filteredFlights.length > 0 ? (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Available Flights</h3>
                      <div className="space-y-4">
                        {filteredFlights.map((flight, index) => (
                          <FlightCard key={index} flight={flight} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Card className="p-12 text-center">
                      <p className="text-muted-foreground">
                        No flights match your filter criteria. Try adjusting your filters.
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* No Results from Search */}
            {flights.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  No flights found for your search criteria. Try different dates or destinations.
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg font-medium">Searching for flights...</p>
              <p className="text-sm text-muted-foreground">
                This may take a few moments
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}