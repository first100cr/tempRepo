import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, Clock, IndianRupee, Calendar, ExternalLink, MapPin } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";

interface Flight {
  id: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departTime: string;
  arriveTime: string;
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

/* ✅ Format ISO datetime → "HH:mm" */
const formatTime = (iso: string) => {
  try {
    return format(parseISO(iso), "HH:mm");
  } catch {
    return iso;
  }
};

/* ✅ Format ISO datetime → "12 Nov" */
const formatDate = (iso: string) => {
  try {
    return format(parseISO(iso), "dd MMM");
  } catch {
    return iso;
  }
};

/* ✅ Convert PT6H50M → "6h 50m" */
const formatDuration = (duration: string) => {
  if (!duration) return "";
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;
  const hours = match[1] ? `${match[1]}h` : "";
  const minutes = match[2] ? `${match[2]}m` : "";
  return `${hours} ${minutes}`.trim();
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

  const handleBookNow = (flight: Flight) => {
    if (flight.bookingUrl) {
      window.open(flight.bookingUrl, "_blank", "noopener,noreferrer");
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
        <p className="text-muted-foreground">Try adjusting your search criteria</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Available Flights</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {flights.length} results found{" "}
             &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span className="font-bold text-yellow-500">
              Note: Real-time prices may vary and are often lower than those shown here.
            </span>
          </p>
        </div>
      </div>

      {/* Flight Cards */}
      {currentFlights.map((flight) => (
        <Card key={flight.id} className="p-6 hover:shadow-lg transition-all">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div className="flex-1 space-y-3">

              {/* Airline Info */}
              <div className="flex items-center gap-3">
                {flight.airlineLogo ? (
                  <img src={flight.airlineLogo} alt={flight.airline} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Plane className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div>
                  <div className="font-semibold">{flight.airline}</div>
                  <div className="text-xs text-muted-foreground">{flight.flightNumber} • {flight.aircraft}</div>
                </div>

                {flight.stops === 0 ? (
                  <Badge className="bg-green-500/10 text-green-600 ml-2">Non-stop</Badge>
                ) : (
                  <Badge variant="secondary" className="ml-2">{flight.stops} stop</Badge>
                )}

                {flight.isValidated && (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 ml-2">Verified</Badge>
                )}
              </div>

              {/* Time + Duration */}
              <div className="flex items-center gap-4">

                <div className="text-center">
                  <p className="text-2xl font-bold">{formatTime(flight.departTime)}</p>
                  <p className="text-sm text-muted-foreground">{flight.origin}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(flight.departTime)}</p>
                </div>

                <div className="flex-1 text-center text-sm text-muted-foreground flex flex-col items-center">
                  <Clock className="h-4 w-4 mb-1" />
                  {formatDuration(flight.duration)}
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold">{formatTime(flight.arriveTime)}</p>
                  <p className="text-sm text-muted-foreground">{flight.destination}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(flight.arriveTime)}</p>
                </div>

              </div>

              {/* Cabin + Seats */}
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                {flight.cabinClass} • {flight.availableSeats || flight.numberOfBookableSeats || 9} seats available 
              </div>
            </div>

            {/* Price + Book */}
            <div className="md:text-right space-y-2">
              <p className="text-3xl font-bold">₹ {flight.price.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground">per person</p>

              <Button className="w-full md:w-auto" onClick={() => handleBookNow(flight)}>
                Book Now <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

        </Card>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>Prev</Button>
          <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}>Next</Button>
        </div>
      )}

    </div>
  );
}
