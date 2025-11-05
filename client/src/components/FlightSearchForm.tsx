// client/src/components/FlightSearchForm.tsx
// UPDATED - With autocomplete and inline-only errors

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plane, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FlightSearchFormProps {
  onSearchStart?: () => void;
  onSearchComplete?: (data: any) => void;
  onSearchError?: (error: string) => void;
  initialValues?: {
    origin?: string;
    destination?: string;
    departDate?: string;
    returnDate?: string;
    passengers?: number;
    tripType?: string;
  };
}

interface ValidationErrors {
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string;
}

// Popular Indian airports
const INDIAN_AIRPORTS = [
  { code: "DEL", city: "Delhi", name: "Indira Gandhi International Airport" },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj International Airport" },
  { code: "BLR", city: "Bangalore", name: "Kempegowda International Airport" },
  { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi International Airport" },
  { code: "MAA", city: "Chennai", name: "Chennai International Airport" },
  { code: "CCU", city: "Kolkata", name: "Netaji Subhas Chandra Bose International Airport" },
  { code: "PNQ", city: "Pune", name: "Pune Airport" },
  { code: "AMD", city: "Ahmedabad", name: "Sardar Vallabhbhai Patel International Airport" },
  { code: "GOI", city: "Goa", name: "Goa International Airport" },
  { code: "COK", city: "Kochi", name: "Cochin International Airport" },
  { code: "JAI", city: "Jaipur", name: "Jaipur International Airport" },
  { code: "LKO", city: "Lucknow", name: "Chaudhary Charan Singh International Airport" },
  { code: "TRV", city: "Thiruvananthapuram", name: "Trivandrum International Airport" },
  { code: "IXC", city: "Chandigarh", name: "Chandigarh International Airport" },
  { code: "GAU", city: "Guwahati", name: "Lokpriya Gopinath Bordoloi International Airport" },
  { code: "VNS", city: "Varanasi", name: "Lal Bahadur Shastri Airport" },
  { code: "PAT", city: "Patna", name: "Jay Prakash Narayan Airport" },
  { code: "IXR", city: "Ranchi", name: "Birsa Munda Airport" },
  { code: "NAG", city: "Nagpur", name: "Dr. Babasaheb Ambedkar International Airport" },
  { code: "SXR", city: "Srinagar", name: "Sheikh ul-Alam International Airport" },
];

export default function FlightSearchForm({
  onSearchStart,
  onSearchComplete,
  onSearchError,
  initialValues
}: FlightSearchFormProps) {
  const [tripType, setTripType] = useState(initialValues?.tripType || "round-trip");
  const [origin, setOrigin] = useState(initialValues?.origin || "");
  const [destination, setDestination] = useState(initialValues?.destination || "");
  const [departDate, setDepartDate] = useState<Date | undefined>(initialValues?.departDate 
      ? new Date(initialValues.departDate) 
      : new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [returnDate, setReturnDate] = useState<Date | undefined>(
    initialValues?.returnDate ? new Date(initialValues.returnDate) : undefined
  );
  const [passengers, setPassengers] = useState(initialValues?.passengers || 1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showErrors, setShowErrors] = useState(false);

  // Autocomplete states
  const [originSuggestions, setOriginSuggestions] = useState<typeof INDIAN_AIRPORTS>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<typeof INDIAN_AIRPORTS>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [originFocusedIndex, setOriginFocusedIndex] = useState(-1);
  const [destFocusedIndex, setDestFocusedIndex] = useState(-1);

  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const originDropdownRef = useRef<HTMLDivElement>(null);
  const destinationDropdownRef = useRef<HTMLDivElement>(null);

  // Update form when initialValues change
  useEffect(() => {
    if (initialValues) {
      if (initialValues.origin) setOrigin(initialValues.origin);
      if (initialValues.destination) setDestination(initialValues.destination);
      if (initialValues.departDate) setDepartDate(new Date(initialValues.departDate));
      if (initialValues.returnDate) setReturnDate(new Date(initialValues.returnDate));
      if (initialValues.passengers) setPassengers(initialValues.passengers);
      if (initialValues.tripType) setTripType(initialValues.tripType);
    }
  }, [initialValues]);

  // Clear error when field is updated
  useEffect(() => {
    if (origin && errors.origin) {
      setErrors(prev => ({ ...prev, origin: undefined }));
    }
  }, [origin]);

  useEffect(() => {
    if (destination && errors.destination) {
      setErrors(prev => ({ ...prev, destination: undefined }));
    }
  }, [destination]);

  useEffect(() => {
    if (departDate && errors.departDate) {
      setErrors(prev => ({ ...prev, departDate: undefined }));
    }
  }, [departDate]);

  useEffect(() => {
    if (returnDate && errors.returnDate) {
      setErrors(prev => ({ ...prev, returnDate: undefined }));
    }
  }, [returnDate]);

  // Filter airports based on input
  const filterAirports = (input: string) => {
    if (!input || input.length < 1) return [];
    const searchTerm = input.toLowerCase();
    return INDIAN_AIRPORTS.filter(
      airport =>
        airport.code.toLowerCase().includes(searchTerm) ||
        airport.city.toLowerCase().includes(searchTerm) ||
        airport.name.toLowerCase().includes(searchTerm)
    ).slice(0, 8); // Limit to 8 suggestions
  };

  // Handle origin input change
  const handleOriginChange = (value: string) => {
    setOrigin(value);
    const suggestions = filterAirports(value);
    setOriginSuggestions(suggestions);
    setShowOriginDropdown(suggestions.length > 0);
    setOriginFocusedIndex(-1);
  };

  // Handle destination input change
  const handleDestinationChange = (value: string) => {
    setDestination(value);
    const suggestions = filterAirports(value);
    setDestinationSuggestions(suggestions);
    setShowDestinationDropdown(suggestions.length > 0);
    setDestFocusedIndex(-1);
  };

  // Handle origin selection
  const handleOriginSelect = (airport: typeof INDIAN_AIRPORTS[0]) => {
    setOrigin(`${airport.code} - ${airport.city}`);
    setShowOriginDropdown(false);
    setOriginFocusedIndex(-1);
  };

  // Handle destination selection
  const handleDestinationSelect = (airport: typeof INDIAN_AIRPORTS[0]) => {
    setDestination(`${airport.code} - ${airport.city}`);
    setShowDestinationDropdown(false);
    setDestFocusedIndex(-1);
  };

  // Handle keyboard navigation for origin
  const handleOriginKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showOriginDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setOriginFocusedIndex(prev => 
          prev < originSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setOriginFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (originFocusedIndex >= 0 && originFocusedIndex < originSuggestions.length) {
          handleOriginSelect(originSuggestions[originFocusedIndex]);
        }
        break;
      case 'Escape':
        setShowOriginDropdown(false);
        setOriginFocusedIndex(-1);
        break;
    }
  };

  // Handle keyboard navigation for destination
  const handleDestinationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDestinationDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setDestFocusedIndex(prev => 
          prev < destinationSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setDestFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (destFocusedIndex >= 0 && destFocusedIndex < destinationSuggestions.length) {
          handleDestinationSelect(destinationSuggestions[destFocusedIndex]);
        }
        break;
      case 'Escape':
        setShowDestinationDropdown(false);
        setDestFocusedIndex(-1);
        break;
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        originDropdownRef.current &&
        !originDropdownRef.current.contains(event.target as Node) &&
        !originInputRef.current?.contains(event.target as Node)
      ) {
        setShowOriginDropdown(false);
      }
      if (
        destinationDropdownRef.current &&
        !destinationDropdownRef.current.contains(event.target as Node) &&
        !destinationInputRef.current?.contains(event.target as Node)
      ) {
        setShowDestinationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Extract airport code from input (e.g., "DEL - Delhi" -> "DEL")
    const originCode = origin.split('-')[0].trim().toUpperCase();
    const destinationCode = destination.split('-')[0].trim().toUpperCase();

    // Validate origin
    if (!origin || origin.trim() === "") {
      newErrors.origin = "Please enter departure city or airport code";
    } else if (origin.trim().length < 2) {
      newErrors.origin = "Origin must be at least 2 characters";
    }

    // Validate destination
    if (!destination || destination.trim() === "") {
      newErrors.destination = "Please enter arrival city or airport code";
    } else if (destination.trim().length < 2) {
      newErrors.destination = "Destination must be at least 2 characters";
    }

    // Validate same origin and destination
    if (originCode && destinationCode && originCode === destinationCode) {
      newErrors.origin = "Origin and destination cannot be the same";
      newErrors.destination = "Origin and destination cannot be the same";
    }

    // Validate departure date
    if (!departDate) {
      newErrors.departDate = "Please select a departure date";
    }

    // Validate return date for round trip
    if (tripType === "round-trip") {
      if (!returnDate) {
        newErrors.returnDate = "Please select a return date for round trip";
      } else if (departDate && returnDate < departDate) {
        newErrors.returnDate = "Return date cannot be before departure date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    onSearchStart?.();

    try {
      // Extract airport codes
      const originCode = origin.split('-')[0].trim().toUpperCase();
      const destinationCode = destination.split('-')[0].trim().toUpperCase();

      const searchParams = {
        origin: originCode,
        destination: destinationCode,
        departDate: format(departDate!, "yyyy-MM-dd"),
        returnDate: tripType === "round-trip" && returnDate ? format(returnDate, "yyyy-MM-dd") : undefined,
        passengers,
        tripType
      };

      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Search failed");
      }

      onSearchComplete?.({
        flights: data.data || [],
        searchParams,
        isMock: data.mock || false
      });
      
      // Clear errors on success
      setErrors({});
      setShowErrors(false);
    } catch (error: any) {
      console.error("Search error:", error);
      onSearchError?.(error.message || "Failed to search flights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="space-y-6">
      {/* Trip Type Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={tripType === "round-trip" ? "default" : "outline"}
          onClick={() => setTripType("round-trip")}
          className="flex-1"
        >
          Round Trip
        </Button>
        <Button
          type="button"
          variant={tripType === "one-way" ? "default" : "outline"}
          onClick={() => setTripType("one-way")}
          className="flex-1"
        >
          One Way
        </Button>
      </div>

      {/* From and To with Autocomplete */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Origin Field */}
        <div className="space-y-2 relative">
          <Label htmlFor="origin" className="text-sm font-medium">
            From <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Plane className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <input
              ref={originInputRef}
              id="origin"
              type="text"
              placeholder="Delhi, Mumbai, or DEL"
              value={origin}
              onChange={(e) => handleOriginChange(e.target.value)}
              onKeyDown={handleOriginKeyDown}
              onFocus={() => {
                if (origin) {
                  const suggestions = filterAirports(origin);
                  setOriginSuggestions(suggestions);
                  setShowOriginDropdown(suggestions.length > 0);
                }
              }}
              className={cn(
                "flex h-10 w-full rounded-md border-2 bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                showErrors && errors.origin
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-border"
              )}
              autoComplete="off"
            />
            
            {/* Origin Dropdown */}
            {showOriginDropdown && originSuggestions.length > 0 && (
              <div
                ref={originDropdownRef}
                className="absolute z-50 w-full mt-1 bg-popover border-2 border-border rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {originSuggestions.map((airport, index) => (
                  <div
                    key={airport.code}
                    className={cn(
                      "px-3 py-2 cursor-pointer hover:bg-accent transition-colors",
                      index === originFocusedIndex && "bg-accent"
                    )}
                    onClick={() => handleOriginSelect(airport)}
                    onMouseEnter={() => setOriginFocusedIndex(index)}
                  >
                    <div className="font-medium text-sm">
                      {airport.code} - {airport.city}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {airport.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {showErrors && errors.origin && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.origin}
            </p>
          )}
        </div>

        {/* Destination Field */}
        <div className="space-y-2 relative">
          <Label htmlFor="destination" className="text-sm font-medium">
            To <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Plane className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rotate-90 pointer-events-none z-10" />
            <input
              ref={destinationInputRef}
              id="destination"
              type="text"
              placeholder="Delhi, Mumbai, or BOM"
              value={destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              onKeyDown={handleDestinationKeyDown}
              onFocus={() => {
                if (destination) {
                  const suggestions = filterAirports(destination);
                  setDestinationSuggestions(suggestions);
                  setShowDestinationDropdown(suggestions.length > 0);
                }
              }}
              className={cn(
                "flex h-10 w-full rounded-md border-2 bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                showErrors && errors.destination
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-border"
              )}
              autoComplete="off"
            />
            
            {/* Destination Dropdown */}
            {showDestinationDropdown && destinationSuggestions.length > 0 && (
              <div
                ref={destinationDropdownRef}
                className="absolute z-50 w-full mt-1 bg-popover border-2 border-border rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {destinationSuggestions.map((airport, index) => (
                  <div
                    key={airport.code}
                    className={cn(
                      "px-3 py-2 cursor-pointer hover:bg-accent transition-colors",
                      index === destFocusedIndex && "bg-accent"
                    )}
                    onClick={() => handleDestinationSelect(airport)}
                    onMouseEnter={() => setDestFocusedIndex(index)}
                  >
                    <div className="font-medium text-sm">
                      {airport.code} - {airport.city}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {airport.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {showErrors && errors.destination && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.destination}
            </p>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Departure <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !departDate && "text-muted-foreground",
                  showErrors && errors.departDate && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {departDate ? format(departDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={departDate}
                onSelect={setDepartDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {showErrors && errors.departDate && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.departDate}
            </p>
          )}
        </div>

        {tripType === "round-trip" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Return <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !returnDate && "text-muted-foreground",
                    showErrors && errors.returnDate && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {returnDate ? format(returnDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={returnDate}
                  onSelect={setReturnDate}
                  disabled={(date) => {
                    const today = new Date(new Date().setHours(0, 0, 0, 0));
                    const minDate = departDate || today;
                    return date < minDate;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {showErrors && errors.returnDate && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.returnDate}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Passengers */}
      <div className="space-y-2">
        <Label htmlFor="passengers" className="text-sm font-medium">
          Passengers
        </Label>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setPassengers(Math.max(1, passengers - 1))}
            disabled={passengers <= 1}
          >
            -
          </Button>
          <span className="w-12 text-center font-medium text-lg">{passengers}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setPassengers(Math.min(9, passengers + 1))}
            disabled={passengers >= 9}
          >
            +
          </Button>
          <span className="text-sm text-muted-foreground">
            (Max 9 passengers)
          </span>
        </div>
      </div>

      {/* Search Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={loading}
        data-search-trigger
      >
        {loading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            Searching...
          </>
        ) : (
          <>
            Search Flights →
          </>
        )}
      </Button>
    </form>
  );
}