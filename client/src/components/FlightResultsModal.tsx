// client/src/components/FlightResults.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, Clock, ArrowRight, ExternalLink, AlertCircle } from "lucide-react";

interface FlightOffer {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  aircraft?: string;
  bookingUrl?: string;
  cabinClass?: string;
  segments?: any[];
}

interface FlightResultsProps {
  flights: FlightOffer[];
  searchParams?: {
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    passengers: number;
  };
  isMock?: boolean;
  isLoading?: boolean;
}

export default function FlightResults({
  flights,
  searchParams,
  isMock = false,
  isLoading = false
}: FlightResultsProps) {
  
  // Format currency
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Don't render anything if no flights and not loading
  if (!isLoading && (!flights || flights.length === 0)) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Plane className="h-6 w-6" />
              Flight Results
              {isMock && (
                <Badge variant="outline" className="ml-2">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Mock Data
                </Badge>
              )}
            </h2>
            {searchParams && (
              <p className="text-sm text-muted-foreground mt-1">
                {searchParams.origin} → {searchParams.destination} • {searchParams.passengers} passenger{searchParams.passengers > 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          {!isLoading && flights && flights.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {flights.length} flight{flights.length !== 1 ? 's' : ''} found
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <span className="text-xs">Sort by: Recommended</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Flight Results */}
      {!isLoading && flights && flights.length > 0 && (
        <div className="space-y-4">
          {flights.map((flight, index) => (
            <Card 
              key={flight.id} 
              className="p-6 hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50"
            >
              <div className="flex flex-col gap-4">
                {/* Badge for Best Deal */}
                {index === 0 && (
                  <div className="flex gap-2">
                    <Badge className="bg-cyan-500 hover:bg-cyan-600">
                      <span className="text-xs">AI Recommended - Best Deal</span>
                    </Badge>
                  </div>
                )}

                {/* Flight Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-lg">{flight.airline}</div>
                      {flight.cabinClass && (
                        <Badge variant="secondary" className="text-xs">
                          {flight.cabinClass}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {flight.flightNumber}
                      {flight.aircraft && ` • ${flight.aircraft}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {formatPrice(flight.price, flight.currency)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      per person
                    </div>
                  </div>
                </div>

                {/* Flight Route */}
                <div className="flex items-center gap-4 py-2">
                  {/* Departure */}
                  <div className="flex-1">
                    <div className="text-3xl font-bold">{flight.departTime}</div>
                    <div className="text-sm font-medium text-muted-foreground mt-1">
                      {flight.origin}
                    </div>
                  </div>
                  
                  {/* Duration & Stops */}
                  <div className="flex-1 flex flex-col items-center px-4">
                    <div className="text-xs text-muted-foreground mb-2">{flight.duration}</div>
                    <div className="w-full flex items-center">
                      <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                      <div className="mx-2">
                        <Plane className="h-5 w-5 text-primary rotate-90" />
                      </div>
                      <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                    </div>
                    <div className="text-xs mt-2">
                      {flight.stops === 0 ? (
                        <span className="text-green-600 font-semibold">Non-stop</span>
                      ) : (
                        <span className="text-orange-600 font-semibold">
                          {flight.stops} stop{flight.stops > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Arrival */}
                  <div className="flex-1 text-right">
                    <div className="text-3xl font-bold">{flight.arriveTime}</div>
                    <div className="text-sm font-medium text-muted-foreground mt-1">
                      {flight.destination}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {flight.segments && flight.segments.length > 0 && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Flight Details
                        </span>
                        <span className="text-xs group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="mt-3 space-y-2 pl-6">
                        {flight.segments.map((segment: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <span className="text-muted-foreground">
                              {segment.departure?.iataCode} → {segment.arrival?.iataCode}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({segment.duration})
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  <Button 
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600" 
                    onClick={() => flight.bookingUrl && window.open(flight.bookingUrl, '_blank')}
                  >
                    Book Now
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Mock Data Notice */}
      {isMock && !isLoading && flights && flights.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900 rounded-lg">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> These are sample results. Actual flight availability and prices may vary.
            </div>
          </div>
        </div>
      )}

      {/* Empty State (when not loading and no results) */}
      {!isLoading && (!flights || flights.length === 0) && (
        <Card className="p-12">
          <div className="text-center">
            <Plane className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Flights Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Try adjusting your search criteria or dates to find more options
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}