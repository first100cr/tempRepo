// client/src/components/FlightResultsInline.tsx
// FIXED VERSION - Safe date parsing and null checks

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, Clock, IndianRupee, Calendar, ExternalLink, MapPin } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";

interface Flight {
  id: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departTime: string;
  arriveTime: string;
  departDate: string;
  arriveDate: string;
  duration: string;
  price: number;
  currency: string;
  aircraft: string;
  baggage?: string;
  cabinClass: string;
  availableSeats?: number;
  stops: number;
  bookingUrl?: string;
  segments?: any[];
  numberOfBookableSeats?: number;
  isValidated?: boolean;
  priceLastUpdated?: string;
}

interface FlightResultsInlineProps {
  flights: Flight[];
  searchParams: any;
  isMock?: boolean;
  loading?: boolean;
}

const AFFILIATE_CONFIG = {
  enabled: false,
  affiliateId: 'skailinker',
  campaignId: 'skailinker',
  market: 'IN',
};

export default function FlightResultsInline({
  flights,
  searchParams,
  isMock = false,
  loading = false
}: FlightResultsInlineProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const flightsPerPage = 10;

  const indexOfLastFlight = currentPage * flightsPerPage;
  const indexOfFirstFlight = indexOfLastFlight - flightsPerPage;
  const currentFlights = flights.slice(indexOfFirstFlight, indexOfLastFlight);
  const totalPages = Math.ceil(flights.length / flightsPerPage);

  // ✅ FIX: Safe date formatter for Skyscanner
  const formatDateForSkyscanner = (dateStr: string | undefined | null): string => {
    if (!dateStr) {
      console.warn('Invalid date string provided to formatDateForSkyscanner');
      return '';
    }

    try {
      const date = new Date(dateStr);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateStr);
        return '';
      }

      const yy = date.getFullYear().toString().slice(-2);
      const mm = (date.getMonth() + 1).toString().padStart(2, '0');
      const dd = date.getDate().toString().padStart(2, '0');
      return `${yy}${mm}${dd}`;
    } catch (error) {
      console.error('Error formatting date for Skyscanner:', error);
      return '';
    }
  };

  const generateSkyscannerUrl = (flight: Flight) => {
    if (flight.bookingUrl) {
      return flight.bookingUrl;
    }

    const origin = searchParams?.origin || flight.origin;
    const destination = searchParams?.destination || flight.destination;
    const departDate = searchParams?.departDate || flight.departDate || format(new Date(), 'yyyy-MM-dd');
    const returnDate = searchParams?.returnDate;
    const adults = searchParams?.passengers || 1;

    const departFormatted = formatDateForSkyscanner(departDate);
    const returnFormatted = returnDate ? formatDateForSkyscanner(returnDate) : '';

    // If date formatting failed, fallback to generic Skyscanner URL
    if (!departFormatted) {
      const baseUrl = 'https://www.skyscanner.co.in/transport/flights';
      return `${baseUrl}/${origin.toLowerCase()}/${destination.toLowerCase()}/`;
    }

    const baseUrl = 'https://www.skyscanner.co.in/transport/flights';
    const originCode = origin.toLowerCase();
    const destCode = destination.toLowerCase();
    
    let url = `${baseUrl}/${originCode}/${destCode}/${departFormatted}`;
    
    if (returnFormatted) {
      url += `/${returnFormatted}`;
    }
    
    const params = new URLSearchParams();
    params.append('adults', adults.toString());
    
    if (AFFILIATE_CONFIG.enabled && AFFILIATE_CONFIG.affiliateId !== 'YOUR_AFFILIATE_ID') {
      params.append('associateid', AFFILIATE_CONFIG.affiliateId);
      if (AFFILIATE_CONFIG.campaignId) {
        params.append('utm_source', AFFILIATE_CONFIG.campaignId);
        params.append('utm_medium', 'referral');
        params.append('utm_campaign', 'flight_booking');
      }
    }
    
    url += `/?${params.toString()}`;
    return url;
  };

  const handleBookNow = (flight: Flight) => {
    const skyscannerUrl = generateSkyscannerUrl(flight);
    if (AFFILIATE_CONFIG.enabled) {
      console.log('🔗 Affiliate link clicked:', skyscannerUrl);
    }
    window.open(skyscannerUrl, '_blank', 'noopener,noreferrer');
  };

  // ✅ FIX: Safe date display formatter
  const safeFormatDate = (dateStr: string | undefined | null, formatStr: string = 'MMM dd, yyyy'): string => {
    if (!dateStr) return 'N/A';
    
    try {
      const date = parseISO(dateStr);
      if (!isValid(date)) {
        // Try parsing as regular Date string
        const fallbackDate = new Date(dateStr);
        if (isValid(fallbackDate)) {
          return format(fallbackDate, formatStr);
        }
        return dateStr;
      }
      return format(date, formatStr);
    } catch (error) {
      console.warn('Error formatting date:', dateStr, error);
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-24 bg-muted rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!flights || flights.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="text-5xl mb-4">✈️</div>
        <h3 className="text-xl font-semibold mb-2">No flights found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria
        </p>
      </Card>
    );
  }

  const uniqueAirlines = Array.from(new Set(flights.map(f => f.airline).filter(Boolean)));

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Available Flights</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {flights.length} flight{flights.length !== 1 ? 's' : ''} found
            {uniqueAirlines.length > 0 && ` from ${uniqueAirlines.length} airline${uniqueAirlines.length !== 1 ? 's' : ''}`}
            {isMock && " (Sample data)"}
          </p>
          {uniqueAirlines.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Airlines: {uniqueAirlines.join(', ')}
            </p>
          )}
        </div>
        {searchParams && searchParams.departDate && (
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {safeFormatDate(searchParams.departDate)}
                {searchParams.returnDate && 
                  ` - ${safeFormatDate(searchParams.returnDate)}`
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Flight Cards */}
      <div className="space-y-4">
        {currentFlights.map((flight) => (
          <Card key={flight.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {flight.airlineLogo ? (
                      <img 
                        src={flight.airlineLogo} 
                        alt={flight.airline || 'Airline'}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const next = e.currentTarget.nextElementSibling;
                          if (next) next.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center ${flight.airlineLogo ? 'hidden' : ''}`}>
                      <Plane className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-base">{flight.airline || 'Unknown Airline'}</div>
                      <div className="text-xs text-muted-foreground">
                        {flight.flightNumber || 'N/A'} • {flight.aircraft || 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  {flight.stops === 0 && (
                    <Badge variant="secondary" className="ml-2 bg-green-500/10 text-green-600 dark:text-green-400">
                      Non-stop
                    </Badge>
                  )}
                  
                  {flight.stops > 0 && (
                    <Badge variant="outline">
                      {flight.stops} stop{flight.stops > 1 ? 's' : ''}
                    </Badge>
                  )}

                  {flight.isValidated && (
                    <Badge variant="secondary" className="ml-2 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold tabular-nums">{flight.departTime || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground font-medium">{flight.origin || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">{flight.departDate || 'N/A'}</div>
                  </div>
                  
                  <div className="flex-1 flex items-center gap-2 px-4">
                    <div className="h-px bg-border flex-1"></div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{flight.duration || 'N/A'}</span>
                    </div>
                    <div className="h-px bg-border flex-1"></div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold tabular-nums">{flight.arriveTime || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground font-medium">{flight.destination || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">{flight.arriveDate || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {flight.cabinClass || 'Economy'}
                  </span>
                  <span>•</span>
                  <span>{flight.availableSeats || flight.numberOfBookableSeats || 9} seats available</span>
                  {flight.baggage && (
                    <>
                      <span>•</span>
                      <span>{flight.baggage}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="md:text-right space-y-3 md:ml-6">
                <div>
                  <div className="flex items-baseline justify-end gap-1">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <span className="text-3xl font-bold tabular-nums">
                      {flight.price?.toLocaleString('en-IN') || '0'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    per person • {flight.currency || 'INR'}
                  </div>
                  {flight.priceLastUpdated && (
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Price updated recently
                    </div>
                  )}
                </div>
                
                <Button 
                  className="w-full md:w-auto min-w-[140px]" 
                  size="lg"
                  onClick={() => handleBookNow(flight)}
                >
                  Book Now
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let page;
              if (totalPages <= 7) {
                page = i + 1;
              } else if (currentPage <= 4) {
                page = i + 1;
              } else if (currentPage >= totalPages - 3) {
                page = totalPages - 6 + i;
              } else {
                page = currentPage - 3 + i;
              }
              
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-10"
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Mock Data Notice - ONLY IF MOCK */}
      {isMock && (
        <Card className="p-4 bg-muted/50 border-dashed">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="text-lg">ℹ️</div>
            <div>
              <div className="font-medium">Sample Data</div>
              <div className="text-xs">
                These are sample flights for demonstration.
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}