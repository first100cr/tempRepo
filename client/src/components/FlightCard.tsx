// client/src/components/FlightCard.tsx
// FIXED VERSION - Matches amadeusService.ts field names

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, Clock, ArrowRight, Briefcase, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { useState } from "react";

interface FlightCardProps {
  id: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departTime: string;        // ✅ FIXED: Was departureTime
  arriveTime: string;        // ✅ FIXED: Was arrivalTime
  departDate: string;        // ✅ ADDED
  arriveDate: string;        // ✅ ADDED
  duration: string;
  stops: number;
  price: number;
  currency?: string;         // ✅ ADDED
  aircraft: string;
  baggage?: string;
  cabinClass?: string;       // ✅ ADDED
  availableSeats?: number;   // ✅ ADDED
  isValidated?: boolean;     // ✅ ADDED
  bookingUrl?: string;       // ✅ ADDED
  prediction?: {
    trend: "up" | "down" | "stable";
    message: string;
  };
  isBestDeal?: boolean;
  onBook?: () => void;       // ✅ ADDED callback
}

export default function FlightCard({
  id,
  airline,
  airlineLogo,
  flightNumber,
  origin,
  destination,
  departTime,
  arriveTime,
  departDate,
  arriveDate,
  duration,
  stops,
  price,
  currency = "INR",
  aircraft,
  baggage = "15 kg",
  cabinClass = "Economy",
  availableSeats,
  isValidated = false,
  bookingUrl,
  prediction,
  isBestDeal = false,
  onBook
}: FlightCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleBook = () => {
    if (onBook) {
      onBook();
    } else if (bookingUrl) {
      window.open(bookingUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className={`p-6 hover-elevate transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${isBestDeal ? 'border-primary border-2 shadow-primary/20 shadow-lg' : ''}`}>
      {isBestDeal && (
        <div className="mb-4 flex items-center gap-2">
          <Badge className="bg-primary text-primary-foreground animate-pulse" data-testid="badge-best-deal">
            AI Recommended - Best Deal
          </Badge>
          <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            {airlineLogo ? (
              <img 
                src={airlineLogo} 
                alt={airline}
                className="h-10 w-10 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center ${airlineLogo ? 'hidden' : ''}`}>
              <Plane className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg" data-testid={`text-airline-${id}`}>{airline}</h3>
              <p className="text-sm text-muted-foreground">{flightNumber} • {aircraft}</p>
            </div>
            {isValidated && (
              <Badge variant="secondary" className="ml-auto bg-green-500/10 text-green-600 dark:text-green-400">
                Verified
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold font-display tabular-nums" data-testid={`text-depart-time-${id}`}>
                {departTime}
              </p>
              <p className="text-sm font-medium text-muted-foreground">{origin}</p>
              <p className="text-xs text-muted-foreground">{departDate}</p>
            </div>
            
            <div className="flex-1 flex flex-col items-center">
              <div className="flex items-center gap-2 w-full">
                <div className="h-px bg-border flex-1" />
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="h-px bg-border flex-1" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{duration}</p>
              {stops > 0 && (
                <Badge variant="secondary" className="mt-1" data-testid={`badge-stops-${id}`}>
                  {stops} {stops === 1 ? 'stop' : 'stops'}
                </Badge>
              )}
              {stops === 0 && (
                <Badge variant="secondary" className="mt-1 bg-green-500/10 text-green-600" data-testid={`badge-nonstop-${id}`}>
                  Non-stop
                </Badge>
              )}
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold font-display tabular-nums" data-testid={`text-arrive-time-${id}`}>
                {arriveTime}
              </p>
              <p className="text-sm font-medium text-muted-foreground">{destination}</p>
              <p className="text-xs text-muted-foreground">{arriveDate}</p>
            </div>
          </div>

          {prediction && (
            <Badge 
              variant="secondary" 
              className={`${prediction.trend === 'down' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'}`}
              data-testid={`badge-prediction-${id}`}
            >
              {prediction.message}
            </Badge>
          )}
        </div>

        <div className="lg:text-right space-y-3 lg:min-w-[180px]">
          <div>
            <p className="text-3xl font-bold font-display tabular-nums" data-testid={`text-price-${id}`}>
              {currency === 'INR' ? '₹' : currency} {price.toLocaleString('en-IN')}
            </p>
            <p className="text-sm text-muted-foreground">per person</p>
          </div>
          <Button 
            className="w-full" 
            data-testid={`button-book-${id}`}
            onClick={handleBook}
          >
            Book Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setShowDetails(!showDetails)}
            data-testid={`button-details-${id}`}
          >
            {showDetails ? 'Hide Details' : 'View Details'}
            {showDetails ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-6 pt-6 border-t grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Baggage</p>
              <p className="text-sm text-muted-foreground">{baggage}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Aircraft</p>
              <p className="text-sm text-muted-foreground">{aircraft}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Duration</p>
              <p className="text-sm text-muted-foreground">{duration}</p>
            </div>
          </div>
          {cabinClass && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Class</p>
                <p className="text-sm text-muted-foreground">{cabinClass}</p>
              </div>
            </div>
          )}
          {availableSeats !== undefined && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Seats Available</p>
                <p className="text-sm text-muted-foreground">{availableSeats} seats</p>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}